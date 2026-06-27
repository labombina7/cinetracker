import { Media } from '@/types/media';
import { TMDBDiscoverResponse } from '@/types/tmdb';
import { buildApiUrl } from '../config';
import { convertToMedia } from '../utils';
import { fetchWatchProviders } from '../providers';
import { SpanishFilter } from '@/hooks/mediaFetch/types';
import { cachedFetch } from '../apiCache';

export type EditorialSortBy =
  | 'popularity.desc'
  | 'vote_average.desc'
  | 'primary_release_date.desc'
  | 'first_air_date.desc';

export interface EditorialFetchConfig {
  mediaType: 'movie' | 'tv' | 'all';
  platformIds: number[];
  spanishFilter: SpanishFilter;
  genreId: number | null;
  sortByMovie?: EditorialSortBy;
  sortByTv?: EditorialSortBy;
  minVoteCount?: number;
  releaseDateGteMovie?: string;
  releaseDateGteTv?: string;
  // genre carousel overrides — takes precedence over genreId per type
  movieGenreIdOverride?: number | null;
  tvGenreIdOverride?: number | null;
}

const buildDiscoverParams = (
  type: 'movie' | 'tv',
  config: EditorialFetchConfig,
  page = 1
): Record<string, string | number | boolean> => {
  const sortBy = type === 'tv' ? config.sortByTv : config.sortByMovie;

  const params: Record<string, string | number | boolean> = {
    sort_by: sortBy ?? 'popularity.desc',
    'vote_count.gte': config.minVoteCount ?? 10,
    page,
    include_adult: false,
    watch_region: 'ES',
  };

  if (config.spanishFilter === 'spain') {
    params.with_original_language = 'es';
    params.with_origin_country = 'ES';
  } else if (config.spanishFilter === 'hispano') {
    params.with_original_language = 'es';
  }

  if (config.platformIds.length > 0) {
    params.with_watch_providers = config.platformIds.join('|');
  }

  // Genre: per-type override takes precedence over shared genreId
  const genreId = type === 'tv'
    ? (config.tvGenreIdOverride !== undefined ? config.tvGenreIdOverride : config.genreId)
    : (config.movieGenreIdOverride !== undefined ? config.movieGenreIdOverride : config.genreId);

  if (genreId !== null && genreId !== undefined) {
    params.with_genres = genreId;
  }

  const dateGte = type === 'tv' ? config.releaseDateGteTv : config.releaseDateGteMovie;
  if (dateGte) {
    params[type === 'tv' ? 'first_air_date.gte' : 'primary_release_date.gte'] = dateGte;
  }

  return params;
};

const fetchForType = async (
  type: 'movie' | 'tv',
  config: EditorialFetchConfig,
  page = 1
): Promise<{ items: Media[]; totalPages: number }> => {
  const params = buildDiscoverParams(type, config, page);
  const url = buildApiUrl(`/discover/${type}`, params);
  const response = await cachedFetch(url);

  if (!response.ok) return { items: [], totalPages: 0 };

  const data: TMDBDiscoverResponse = await response.json();
  if (!data.results?.length) return { items: [], totalPages: data.total_pages ?? 0 };

  const items = await Promise.all(
    data.results.map(async item => {
      const media = await convertToMedia({ ...item, media_type: type }, type);
      if (media) {
        try {
          const providers = await fetchWatchProviders(media.id, media.type);
          if (providers?.results?.ES) {
            media.watchProviders = {
              flatrate: providers.results.ES.flatrate || [],
              rent: providers.results.ES.rent || [],
              buy: providers.results.ES.buy || [],
            };
          }
        } catch { /* ignorar */ }
      }
      return media;
    })
  );
  return { items: items.filter((m): m is Media => m !== null), totalPages: data.total_pages ?? 0 };
};

export const fetchEditorial = async (
  config: EditorialFetchConfig,
  page = 1
): Promise<{ items: Media[]; hasMore: boolean }> => {
  try {
    const types: Array<'movie' | 'tv'> =
      config.mediaType === 'all' ? ['movie', 'tv'] :
      config.mediaType === 'movie' ? ['movie'] : ['tv'];

    const results = await Promise.all(types.map(t => fetchForType(t, config, page)));

    const maxTotalPages = Math.max(...results.map(r => r.totalPages));
    const hasMore = page < maxTotalPages;

    if (types.length === 2) {
      const movies = results[0].items;
      const tv = results[1].items;
      const interleaved: Media[] = [];
      const len = Math.max(movies.length, tv.length);
      for (let i = 0; i < len; i++) {
        if (movies[i]) interleaved.push(movies[i]);
        if (tv[i]) interleaved.push(tv[i]);
      }
      return { items: interleaved.slice(0, 20), hasMore };
    }

    return { items: results.flat().flatMap(r => r.items), hasMore };
  } catch {
    return { items: [], hasMore: false };
  }
};
