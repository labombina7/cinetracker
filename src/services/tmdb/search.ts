
import { Media } from '../../types/media';
import { convertToMedia } from './utils';
import { buildApiUrl } from './config';
import { fetchWatchProviders } from './providers';
import { SpanishFilter } from '@/hooks/mediaFetch/types';

export const searchMedia = async (query: string, language: string = 'es', spanishFilter: SpanishFilter = 'off'): Promise<Media[]> => {
  try {
    if (!query) return [];

    console.log(`Searching for "${query}" in language: ${language}, spanishFilter: ${spanishFilter}`);
    
    // Construir parámetros de API
    const params: Record<string, string | number> = {
      query: query,
      include_adult: false,
      language: language === 'es' ? 'es-ES' : 'en-US',
      page: 1,
      region: 'ES' // Siempre usamos región España para resultados más relevantes
    };
    
    if (spanishFilter !== 'off') {
      params.with_original_language = 'es';
    }
    
    // URL de la API
    const url = buildApiUrl('/search/multi', params);
    console.log(`Search URL: ${url}`);
    
    // Realizar petición
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error searching: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Search returned ${data.results.length} results`);
    
    // Filtrar tipos válidos
    const filteredResults = data.results.filter((item: any) => 
      item.media_type === 'movie' || item.media_type === 'tv'
    );
    
    console.log(`After filtering invalid media types: ${filteredResults.length} results`);
    
    // Convertir a formato Media y obtener proveedores de streaming
    const mediaPromises = filteredResults.map(async (item: any) => {
      try {
        const media = await convertToMedia(item, item.media_type);
        
        if (media) {
          // Obtener proveedores de streaming para España
          const providers = await fetchWatchProviders(media.id, media.type);
          if (providers?.results?.ES) {
            media.watchProviders = {
              flatrate: providers.results.ES.flatrate || [],
              rent: providers.results.ES.rent || [],
              buy: providers.results.ES.buy || []
            };
          }
        }
        
        return media;
      } catch (err) {
        console.error(`Error converting search result ID ${item.id}:`, err);
        return null;
      }
    });
    
    const mediaResults = await Promise.all(mediaPromises);
    const validResults = mediaResults.filter((item): item is Media => item !== null);
    
    if (spanishFilter !== 'off') {
      const spanishLanguageResults = validResults.filter(item => item.original_language === 'es');
      console.log(`Search found ${spanishLanguageResults.length} Spanish language results out of ${validResults.length} total`);
    }
    
    return validResults;
  } catch (error) {
    console.error('Error searching media:', error);
    return [];
  }
};
