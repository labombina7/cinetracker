
import { Media } from '../../../types/media';
import { TMDBDiscoverResponse } from '../../../types/tmdb';
import { buildApiUrl } from '../config';
import { convertToMedia } from '../utils';
import { fetchWatchProviders } from '../providers';
import { SpanishFilter } from '@/hooks/mediaFetch/types';
import { cachedFetch } from '../apiCache';

export const discoverMedia = async (
  type: 'movie' | 'tv',
  page: number = 1,
  platformIds: number[] = [],
  spanishFilter: SpanishFilter = 'off',
  sortBy: 'none' | 'rating' | 'date' = 'none',
  genreId: number | null = null
): Promise<Media[]> => {
  try {
    const apiSortBy = sortBy === 'date'
      ? (type === 'tv' ? 'first_air_date.desc' : 'primary_release_date.desc')
      : sortBy === 'rating'
        ? 'vote_average.desc'
        : 'popularity.desc';

    // Parámetros para la API de Discover
    let params: Record<string, string | number | boolean> = {
      sort_by: apiSortBy,
      'vote_count.gte': sortBy === 'rating' ? 100 : 10,
      page: page,
      include_adult: false,
      watch_region: 'ES'
    };

    if (spanishFilter === 'spain') {
      params.with_original_language = 'es';
      params['with_origin_country'] = 'ES';
    } else if (spanishFilter === 'hispano') {
      params.with_original_language = 'es';
    } else {
      params.with_original_language = 'es|en|fr';
    }
    
    if (platformIds && platformIds.length > 0) {
      params.with_watch_providers = platformIds.join('|');
    }

    if (genreId !== null) {
      params.with_genres = genreId;
    }
    
    const url = buildApiUrl(`/discover/${type}`, params);
    console.log(`Fetching discover ${type}:`, url);
    
    const response = await cachedFetch(url);
    
    if (!response.ok) {
      throw new Error(`Error fetching discover ${type}: ${response.status}`);
    }
    
    const data: TMDBDiscoverResponse = await response.json();
    console.log(`Received ${data.results.length} results for ${type}`);
    
    const mediaPromises = data.results.map(async item => {
      const media = await convertToMedia({...item, media_type: type}, type);
      if (media) {
        try {
          const providers = await fetchWatchProviders(media.id, media.type);
          if (providers?.results?.ES) {
            media.watchProviders = {
              flatrate: providers.results.ES.flatrate || [],
              rent: providers.results.ES.rent || [],
              buy: providers.results.ES.buy || []
            };
          }
        } catch { /* ignorar errores de providers */ }
      }
      return media;
    });

    const mediaItems = await Promise.all(mediaPromises);
    
    const validMedia = mediaItems.filter((item): item is Media => item !== null);
    console.log(`Discover: Returning ${validMedia.length} results for ${type} sorted by ${apiSortBy}`);
    return validMedia;
  } catch (error) {
    console.error(`Error fetching discover ${type}:`, error);
    return [];
  }
};
