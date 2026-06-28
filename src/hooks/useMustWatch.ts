import { useState, useEffect, useRef } from 'react';
import { Media } from '@/types/media';
import { fetchTopRated } from '@/services/tmdb/topRated';

const MIN_VOTE_AVERAGE = 8.0;
const MIN_VOTE_COUNT = 1000;
const TARGET_COUNT = 8;

// Seeded Fisher-Yates shuffle — same result for the same seed (daily)
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const dailySeed = () => Math.floor(Date.now() / 86400000);

// In-memory session cache
const sessionCache: Record<string, Media[]> = {};

export const useMustWatch = (mediaType: 'all' | 'movie' | 'tv') => {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    const cacheKey = `must-watch-${mediaType}`;
    if (sessionCache[cacheKey]) {
      setMedia(sessionCache[cacheKey]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const load = async () => {
      const fetches: Promise<Media[]>[] = [];
      if (mediaType === 'all' || mediaType === 'movie') fetches.push(fetchTopRated('movie'));
      if (mediaType === 'all' || mediaType === 'tv') fetches.push(fetchTopRated('tv'));

      const results = await Promise.all(fetches);
      const combined = results.flat();

      const filtered = combined.filter(
        m => m.voteAverage >= MIN_VOTE_AVERAGE
      );

      const shuffled = seededShuffle(filtered, dailySeed()).slice(0, TARGET_COUNT);

      if (!mountedRef.current) return;
      sessionCache[cacheKey] = shuffled;
      setMedia(shuffled);
      setLoading(false);
    };

    load().catch(() => {
      if (mountedRef.current) setLoading(false);
    });
  }, [mediaType]);

  return { media, loading };
};
