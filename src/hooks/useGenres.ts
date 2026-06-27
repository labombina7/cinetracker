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
    if (mediaType === 'tv') return tvGenres;
    // 'movie' and 'all' → movie genres (Action=28, Horror=27, Sci-Fi=878 have different TV IDs
    // so the intersection would miss them; movie genres are more complete and recognizable)
    return movieGenres;
  })();

  return { genres, loading };
};
