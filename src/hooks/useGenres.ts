import { useState, useEffect } from 'react';
import { Genre } from '@/types/media';
import { fetchGenres } from '@/services/tmdb/genres';
import { useLanguage } from '@/hooks/useLanguage';

interface UseGenresResult {
  genres: Genre[];
  loading: boolean;
}

export const useGenres = (mediaType: 'all' | 'movie' | 'tv'): UseGenresResult => {
  const { language } = useLanguage();
  const [movieGenres, setMovieGenres] = useState<Genre[]>([]);
  const [tvGenres, setTvGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [movies, tv] = await Promise.all([
          fetchGenres('movie', language),
          fetchGenres('tv', language),
        ]);
        if (!cancelled) {
          setMovieGenres(movies);
          setTvGenres(tv);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [language]);

  const genres: Genre[] = (() => {
    if (mediaType === 'movie') return movieGenres;
    if (mediaType === 'tv') return tvGenres;
    // 'all' → intersection by id
    const tvIds = new Set(tvGenres.map(g => g.id));
    return movieGenres.filter(g => tvIds.has(g.id));
  })();

  return { genres, loading };
};
