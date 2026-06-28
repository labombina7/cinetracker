import { useState, useEffect, useRef } from 'react';
import { Media } from '@/types/media';
import { fetchTopRated } from '@/services/tmdb/topRated';

const MIN_VOTE_AVERAGE = 8.0;
const TARGET_COUNT = 8;

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

// Raw (unfiltered) cache keyed by mediaType — avoids re-fetching when platform changes
const rawCache: Record<string, Media[]> = {};

const filterAndPick = (items: Media[], platformIds: number[]): Media[] => {
  const filtered = items.filter(m => {
    if (m.voteAverage < MIN_VOTE_AVERAGE) return false;
    if (!platformIds.length) return true;
    return (m.watchProviders?.flatrate ?? []).some(p => platformIds.includes(p.provider_id));
  });
  return seededShuffle(filtered, dailySeed()).slice(0, TARGET_COUNT);
};

export const useMustWatch = (mediaType: 'all' | 'movie' | 'tv', platformIds: number[] = []) => {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const platformKey = platformIds.join(',');

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    // If raw data already cached, just re-filter without re-fetching
    if (rawCache[mediaType]) {
      setMedia(filterAndPick(rawCache[mediaType], platformIds));
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

      if (!mountedRef.current) return;
      rawCache[mediaType] = combined;
      setMedia(filterAndPick(combined, platformIds));
      setLoading(false);
    };

    load().catch(() => {
      if (mountedRef.current) setLoading(false);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaType, platformKey]);

  return { media, loading };
};
