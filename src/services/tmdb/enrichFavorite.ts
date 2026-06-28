import { TMDB_CONFIG } from '@/config/tmdb.config';

export type FavoriteEnrichment = {
  posterPath: string;
  title: string;
  year?: number;
};

export const enrichFavorite = async (
  id: number,
  type: 'movie' | 'tv',
  language = 'es'
): Promise<FavoriteEnrichment | null> => {
  const apiKey = TMDB_CONFIG.API_KEY;
  if (!apiKey) return null;

  try {
    const endpoint = type === 'movie' ? 'movie' : 'tv';
    const url = `${TMDB_CONFIG.BASE_URL}/${endpoint}/${id}?api_key=${apiKey}&language=${language}`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const title = type === 'movie' ? (data.title ?? '') : (data.name ?? '');
    const releaseDate = type === 'movie' ? data.release_date : data.first_air_date;
    const year = releaseDate ? parseInt(releaseDate.substring(0, 4)) : undefined;

    return {
      posterPath: data.poster_path ?? '',
      title,
      year,
    };
  } catch {
    return null;
  }
};
