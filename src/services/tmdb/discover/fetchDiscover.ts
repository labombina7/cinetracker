
import { Media } from '../../../types/media';
import { TMDBDiscoverResponse } from '../../../types/tmdb';
import { buildApiUrl } from '../config';
import { convertToMedia } from '../utils';
import { SpanishFilter } from '@/hooks/mediaFetch/types';
import { cachedFetch } from '../apiCache';

export const discoverMedia = async (
  type: 'movie' | 'tv',
  page: number = 1,
  platformIds: number[] = [],
  spanishFilter: SpanishFilter = 'off',
  sortBy: 'rating' | 'date' = 'rating'
): Promise<Media[]> => {
  try {
    const apiSortBy = sortBy === 'date'
      ? (type === 'tv' ? 'first_air_date.desc' : 'primary_release_date.desc')
      : 'vote_average.desc';

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
    
    // Si hay plataformas seleccionadas, incluirlas en los parámetros
    if (platformIds && platformIds.length > 0) {
      params.with_watch_providers = platformIds.join('|');
      console.log(`Discover: Filtering by platforms: ${platformIds.join(', ')}`);
    }
    
    const url = buildApiUrl(`/discover/${type}`, params);
    console.log(`Fetching discover ${type}:`, url);
    
    const response = await cachedFetch(url);
    
    if (!response.ok) {
      throw new Error(`Error fetching discover ${type}: ${response.status}`);
    }
    
    const data: TMDBDiscoverResponse = await response.json();
    console.log(`Received ${data.results.length} results for ${type}`);
    
    // Convertir y filtrar los resultados
    const mediaPromises = data.results.map(async item => {
      const media = await convertToMedia({...item, media_type: type}, type);
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
