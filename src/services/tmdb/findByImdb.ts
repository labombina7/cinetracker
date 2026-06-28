import { TMDB_CONFIG } from '@/config/tmdb.config';

export type TmdbFindResult = {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  posterPath: string;
  releaseDate?: string;
} | null;

export const findByImdbId = async (imdbId: string): Promise<TmdbFindResult> => {
  const apiKey = TMDB_CONFIG.API_KEY;
  if (!apiKey || !imdbId) return null;

  try {
    const url = `${TMDB_CONFIG.BASE_URL}/find/${imdbId}?api_key=${apiKey}&external_source=imdb_id`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();

    const movie = data.movie_results?.[0];
    if (movie) {
      return {
        id: movie.id,
        type: 'movie',
        title: movie.title ?? '',
        posterPath: movie.poster_path ?? '',
        releaseDate: movie.release_date,
      };
    }

    const show = data.tv_results?.[0];
    if (show) {
      return {
        id: show.id,
        type: 'tv',
        title: show.name ?? '',
        posterPath: show.poster_path ?? '',
        releaseDate: show.first_air_date,
      };
    }

    return null;
  } catch {
    return null;
  }
};
