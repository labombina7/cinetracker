
import { Media } from '../../../types/media';
import { TMDBDiscoverResponse } from '../../../types/tmdb';
import { buildApiUrl } from '../config';
import { convertToMedia } from '../utils';

// Función para obtener específicamente contenido español
export const discoverSpanishMedia = async (type: 'movie' | 'tv', page: number = 1): Promise<Media[]> => {
  try {
    const params: Record<string, string | number | boolean> = {
      sort_by: 'popularity.desc',
      page: page,
      with_original_language: 'es', // Solo idioma español
      with_origin_country: 'ES', // Solo país de origen España
      include_adult: false,
      'vote_count.gte': 10, // Menos restrictivo para encontrar más contenido español
      watch_region: 'ES'
    };
    
    const url = buildApiUrl(`/discover/${type}`, params);
    console.log(`Fetching Spanish ${type}:`, url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error fetching Spanish ${type}: ${response.status}`);
    }
    
    const data: TMDBDiscoverResponse = await response.json();
    console.log(`Received ${data.results.length} Spanish results for ${type}`);
    
    // Convertir los resultados
    const mediaPromises = data.results.map(async item => {
      const media = await convertToMedia({...item, media_type: type}, type);
      if (media) {
        // Asegurarnos de marcar CORRECTAMENTE el contenido como español
        // Solo si realmente es de origen español o en idioma español
        if (item.original_language === 'es' || item.origin_country?.includes('ES')) {
          media.country = 'ES';
          media.original_language = 'es';
        }
      }
      return media;
    });
    
    const mediaItems = await Promise.all(mediaPromises);
    
    // Filtrar los nulos
    const validMedia = mediaItems.filter((item): item is Media => item !== null);
    
    console.log(`Valid Spanish ${type} items: ${validMedia.length}`);
    return validMedia;
  } catch (error) {
    console.error(`Error fetching Spanish ${type}:`, error);
    return [];
  }
};
