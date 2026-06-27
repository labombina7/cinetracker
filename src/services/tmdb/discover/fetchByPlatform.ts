
import { Media } from '../../../types/media';
import { TMDBDiscoverResponse } from '../../../types/tmdb';
import { buildApiUrl } from '../config';
import { convertToMedia } from '../utils';
import { fetchWatchProviders } from '../providers';
import { SpanishFilter } from '@/hooks/mediaFetch/types';
import { cachedFetch } from '../apiCache';

export const fetchMediaByPlatforms = async (
  mediaType: 'all' | 'movie' | 'tv',
  platformIds: number[],
  page: number = 1,
  spanishFilter: SpanishFilter = 'off',
  sortBy: 'none' | 'rating' | 'date' = 'none',
  genreId: number | null = null
): Promise<Media[]> => {
  try {
    if (!platformIds || platformIds.length === 0) {
      console.log('No platform IDs provided for fetchMediaByPlatforms');
      return [];
    }

    console.log(`Fetching media for platforms: ${platformIds.join(', ')}, spanishFilter: ${spanishFilter}`);
    const results: Media[] = [];

    // Define qué tipos de contenido vamos a buscar
    const typesToFetch = mediaType === 'all' ? ['movie', 'tv'] : [mediaType];

    // Para cada tipo de contenido, realizar una solicitud
    for (const type of typesToFetch) {
      // Parámetros para la solicitud
      const apiSortBy = sortBy === 'date'
        ? (type === 'tv' ? 'first_air_date.desc' : 'primary_release_date.desc')
        : sortBy === 'rating'
          ? 'vote_average.desc'
          : 'popularity.desc';

      const params: Record<string, string | number | boolean> = {
        watch_region: 'ES',
        with_watch_providers: platformIds.join('|'),
        page: page,
        include_adult: false,
        'vote_count.gte': sortBy === 'rating' ? 50 : 5,
        sort_by: apiSortBy
      };

      if (genreId !== null) {
        params.with_genres = genreId;
      }

      if (spanishFilter === 'spain') {
        params.with_original_language = 'es';
        params['with_origin_country'] = 'ES';
      } else if (spanishFilter === 'hispano') {
        params.with_original_language = 'es';
      }

      // Realizar la solicitud
      const url = buildApiUrl(`/discover/${type}`, params);
      console.log(`Fetching by platform for ${type}:`, url);

      const response = await cachedFetch(url);
      
      if (!response.ok) {
        console.error(`Error fetching discover by platform for ${type}: ${response.status}`);
        continue;
      }

      const data: TMDBDiscoverResponse = await response.json();
      
      if (!data.results || data.results.length === 0) {
        console.log(`No results for ${type} with platforms: ${platformIds.join(', ')}`);
        continue;
      }

      console.log(`Found ${data.results.length} ${type} items for platforms: ${platformIds.join(', ')}`);

      const mediaPromises = data.results.map(async item => {
        const mType = type as 'movie' | 'tv';
        const media = await convertToMedia({...item, media_type: mType}, mType);
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

      const validItems = mediaItems.filter((item): item is Media => item !== null);
      
      // Añadir a los resultados
      results.push(...validItems);
    }

    console.log(`Total items found for platforms ${platformIds.join(', ')}: ${results.length}`);
    return results;
  } catch (error) {
    console.error('Error in fetchMediaByPlatforms:', error);
    return [];
  }
};
