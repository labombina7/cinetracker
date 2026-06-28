import { TMDB_CONFIG } from '@/config/tmdb.config';
import type { WatchProvider } from '@/contexts/FavoritesContext';

export type FavoriteEnrichment = {
  posterPath: string;
  title: string;
  year?: number;
  voteAverage?: number;
  watchProviders?: WatchProvider[];
};

const COUNTRY = 'ES';

export const enrichFavorite = async (
  id: number,
  type: 'movie' | 'tv',
  language = 'es'
): Promise<FavoriteEnrichment | null> => {
  const apiKey = TMDB_CONFIG.API_KEY;
  if (!apiKey) return null;

  const endpoint = type === 'movie' ? 'movie' : 'tv';
  const base = TMDB_CONFIG.BASE_URL;

  try {
    const [detailsRes, providersRes] = await Promise.all([
      fetch(`${base}/${endpoint}/${id}?api_key=${apiKey}&language=${language}`),
      fetch(`${base}/${endpoint}/${id}/watch/providers?api_key=${apiKey}`),
    ]);

    if (!detailsRes.ok) return null;

    const details = await detailsRes.json();
    const title = type === 'movie' ? (details.title ?? '') : (details.name ?? '');
    const releaseDate = type === 'movie' ? details.release_date : details.first_air_date;
    const year = releaseDate ? parseInt(releaseDate.substring(0, 4)) : undefined;
    const voteAverage: number | undefined =
      typeof details.vote_average === 'number' && details.vote_average > 0
        ? details.vote_average
        : undefined;

    let watchProviders: WatchProvider[] | undefined;
    if (providersRes.ok) {
      const providersData = await providersRes.json();
      const countryData = providersData?.results?.[COUNTRY];
      // Keep empty array for movies in theaters (flatrate exists but is empty)
      watchProviders = countryData?.flatrate ?? [];
    }

    return { posterPath: details.poster_path ?? '', title, year, voteAverage, watchProviders };
  } catch {
    return null;
  }
};
