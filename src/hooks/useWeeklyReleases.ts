import { useState, useEffect } from 'react';
import { Media } from '@/types/media';
import { fetchTrendingMoviesWeek, fetchTvOnTheAir } from '@/services/tmdb/nowPlaying';

const CACHE_KEY = 'weekly_releases_cache';
const CACHE_TTL = 15 * 60 * 1000; // 15 min

interface CacheEntry {
  data: Media[];
  expiresAt: number;
}

export const useWeeklyReleases = (mediaType: 'all' | 'movie' | 'tv') => {
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);

      // Check in-memory sessionStorage cache
      try {
        const raw = sessionStorage.getItem(CACHE_KEY);
        if (raw) {
          const entry: CacheEntry = JSON.parse(raw);
          if (entry.expiresAt > Date.now()) {
            const filtered = filterByType(entry.data, mediaType);
            if (!cancelled) { setItems(filtered); setLoading(false); }
            return;
          }
        }
      } catch { /* ignore */ }

      const [movies, tvShows] = await Promise.all([
        fetchTrendingMoviesWeek(),
        fetchTvOnTheAir(),
      ]);

      const combined = [...movies, ...tvShows]
        .sort((a, b) => (b as any).popularity - (a as any).popularity || b.voteAverage - a.voteAverage)
        .slice(0, 14);

      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: combined, expiresAt: Date.now() + CACHE_TTL }));
      } catch { /* ignore */ }

      if (!cancelled) {
        setItems(filterByType(combined, mediaType));
        setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [mediaType]);

  return { items: items.slice(0, 7), loading };
};

const filterByType = (items: Media[], mediaType: 'all' | 'movie' | 'tv'): Media[] => {
  if (mediaType === 'all') return items;
  return items.filter(m => m.type === mediaType);
};
