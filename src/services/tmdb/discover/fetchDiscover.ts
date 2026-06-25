
import { Media } from '../../../types/media';
import { TMDBDiscoverResponse } from '../../../types/tmdb';
import { buildApiUrl } from '../config';
import { convertToMedia } from '../utils';

export const discoverMedia = async (
  type: 'movie' | 'tv', 
  page: number = 1, 
  platformIds: number[] = [],
  showSpanishOnly: boolean = false // Nuevo parámetro
): Promise<Media[]> => {
  try {
    // Definimos los códigos de idioma según el toggle
    let languageCodes: string[];
    
    if (showSpanishOnly) {
      // Si solo queremos contenido español, limitamos a español
      languageCodes = ['es', 'es-ES', 'es-MX', 'es-AR', 'es-CO'];
    } else {
      // Lista completa de idiomas permitidos
      languageCodes = [
        'es',     // Español genérico
        'es-ES',  // Español de España
        'es-MX',  // Español de México
        'es-AR',  // Español de Argentina
        'es-CO',  // Español de Colombia
        'en', 
        'en-US',  // Inglés de Estados Unidos
        'en-GB',  // Inglés de Reino Unido (UK)
        'fr'      // Mantenemos francés
      ];
    }
    
    // Parámetros para la API de Discover
    let params: Record<string, string | number | boolean> = {
      sort_by: 'vote_average.desc', // Ordenar por puntuación descendente
      'vote_count.gte': 100, // Aumentamos el mínimo de votos para resultados más relevantes
      page: page,
      include_adult: false,
      watch_region: 'ES'
    };
    
    // Si filtramos por idioma español, usamos with_original_language
    if (showSpanishOnly) {
      params.with_original_language = 'es';
      console.log('Discover: Filtering for Spanish original language only');
    } else {
      // Si no, permitimos varios idiomas
      params.with_original_language = languageCodes.join('|');
    }
    
    // Si hay plataformas seleccionadas, incluirlas en los parámetros
    if (platformIds && platformIds.length > 0) {
      params.with_watch_providers = platformIds.join('|');
      console.log(`Discover: Filtering by platforms: ${platformIds.join(', ')}`);
    }
    
    // Si queremos contenido español, damos prioridad a España como país de origen
    if (showSpanishOnly) {
      // Para películas y series, especificamos directamente el país de origen
      params['with_origin_country'] = 'ES';
      console.log('Buscando contenido con origen en España');
    }
    
    const url = buildApiUrl(`/discover/${type}`, params);
    console.log(`Fetching discover ${type}:`, url);
    
    const response = await fetch(url);
    
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
    
    // Filtrar los nulos (los que no cumplen con los requisitos)
    const validMedia = mediaItems.filter((item): item is Media => item !== null);
    
    // Aseguramos que los resultados estén ordenados por puntuación (de mayor a menor)
    validMedia.sort((a, b) => {
      // Primero por puntuación (de mayor a menor)
      const ratingDiff = b.voteAverage - a.voteAverage;
      if (ratingDiff !== 0) return ratingDiff;
      
      // Si tienen la misma puntuación, por fecha de lanzamiento (más reciente primero)
      if (a.releaseDate && b.releaseDate) {
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      }
      return 0;
    });
    
    console.log(`Discover: Returning ${validMedia.length} sorted results for ${type}`);
    return validMedia;
  } catch (error) {
    console.error(`Error fetching discover ${type}:`, error);
    return [];
  }
};
