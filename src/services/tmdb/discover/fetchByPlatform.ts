
import { Media } from '../../../types/media';
import { TMDBDiscoverResponse } from '../../../types/tmdb';
import { buildApiUrl } from '../config';
import { convertToMedia } from '../utils';

export const fetchMediaByPlatforms = async (
  mediaType: 'all' | 'movie' | 'tv',
  platformIds: number[],
  page: number = 1,
  showSpanishOnly: boolean = false,
  sortBy: 'rating' | 'date' = 'rating'
): Promise<Media[]> => {
  try {
    if (!platformIds || platformIds.length === 0) {
      console.log('No platform IDs provided for fetchMediaByPlatforms');
      return [];
    }

    console.log(`Fetching media for platforms: ${platformIds.join(', ')}, Spanish only: ${showSpanishOnly}`);
    const results: Media[] = [];

    // Define qué tipos de contenido vamos a buscar
    const typesToFetch = mediaType === 'all' ? ['movie', 'tv'] : [mediaType];

    // Para cada tipo de contenido, realizar una solicitud
    for (const type of typesToFetch) {
      // Parámetros para la solicitud
      const apiSortBy = sortBy === 'date'
        ? (type === 'tv' ? 'first_air_date.desc' : 'primary_release_date.desc')
        : 'vote_average.desc';

      const params: Record<string, string | number | boolean> = {
        watch_region: 'ES',
        with_watch_providers: platformIds.join('|'),
        page: page,
        include_adult: false,
        'vote_count.gte': sortBy === 'rating' ? 50 : 5,
        sort_by: apiSortBy
      };

      // Si queremos solo contenido español, añadimos el filtro de idioma original
      if (showSpanishOnly) {
        params.with_original_language = 'es';
      }

      // Realizar la solicitud
      const url = buildApiUrl(`/discover/${type}`, params);
      console.log(`Fetching by platform for ${type}:`, url);

      const response = await fetch(url);
      
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

      // Convertir resultados al formato Media
      const mediaPromises = data.results.map(async item => {
        // Fix: Convert 'movie' or 'tv' string to proper type
        const mediaType = type as 'movie' | 'tv';
        return await convertToMedia({...item, media_type: mediaType}, mediaType);
      });

      const mediaItems = await Promise.all(mediaPromises);
      
      // Filtrar elementos nulos
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
