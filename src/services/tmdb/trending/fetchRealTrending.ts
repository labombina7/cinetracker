
import { Media } from '@/types/media';
import { convertToMedia } from '../utils';
import { buildApiUrl } from '../config';
import { fetchWatchProviders } from '../providers';
import { getLanguageParams } from '@/hooks/mediaFetch/fetchMediaUtils';

export const fetchRealTrending = async (
  type: 'all' | 'movie' | 'tv' = 'all',
  page: number = 1,
  timeWindow: 'day' | 'week' = 'week',
  showSpanishOnly: boolean = false,
  fetchProviders: boolean = false
): Promise<Media[]> => {
  try {
    // Obtenemos los parámetros de idioma según el toggle
    const languageParams = showSpanishOnly ? 'es' : 'es-ES';

    // Construir URL con soporte para paginación y filtrado de idioma
    const params: any = { 
      page,
      language: languageParams, // Usamos el idioma basado en la selección
      region: 'ES' // Región España para mejores resultados regionales
    };
    
    // Si queremos solo contenido español, añadir with_original_language
    if (showSpanishOnly) {
      params.with_original_language = 'es';
    }
    
    const url = buildApiUrl(`/trending/${type}/${timeWindow}`, params);
    
    console.log(`Fetching trending ${type} for ${timeWindow}, page ${page}, Spanish only: ${showSpanishOnly}: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error fetching trending ${type}: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Received ${data.results?.length || 0} trending results for ${type}, page ${page}`);
    
    // No limitamos el número de resultados
    // Convertir los resultados a nuestro formato estandarizado
    const mediaPromises = data.results
      .filter(Boolean)
      .map(async (item: any) => {
        // Obtener tipo real de contenido
        const mediaType = item.media_type || type;
        
        // Convertir el item
        const media = await convertToMedia(item, mediaType === 'all' ? item.media_type : mediaType);
        
        if (media) {
          // Guardar información del país de origen
          if (item.original_language === 'es' || (item.origin_country && item.origin_country.includes('ES'))) {
            media.country = 'ES';
          } else {
            media.country = item.origin_country?.[0] || undefined;
          }

          // Solo pedir providers si se va a filtrar por plataforma
          if (fetchProviders) {
            try {
              const providers = await fetchWatchProviders(media.id, media.type);
              if (providers?.results?.ES) {
                media.watchProviders = {
                  flatrate: providers.results.ES.flatrate || [],
                  rent: providers.results.ES.rent || [],
                  buy: providers.results.ES.buy || []
                };
              }
            } catch (err) {
              console.error(`Error fetching providers for ${media.title}:`, err);
            }
          }
        }
        
        return media;
      });
      
    const mediaResults = await Promise.all(mediaPromises);
    const validResults = mediaResults.filter((item): item is Media => item !== null);
    
    console.log(`Trending ${type} page ${page}: Found ${validResults.length} valid items`);
    
    // Log Spanish content for debugging
    const spanishContent = validResults.filter(item => 
      item.original_language === 'es' || item.country === 'ES'
    );
    
    console.log(`Spanish content count in trending results: ${spanishContent.length}`);
    
    return validResults;
  } catch (error) {
    console.error(`Error fetching trending ${type}:`, error);
    return [];
  }
};
