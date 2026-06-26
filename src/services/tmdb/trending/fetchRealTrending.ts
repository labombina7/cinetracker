
import { Media } from '@/types/media';
import { convertToMedia } from '../utils';
import { buildApiUrl } from '../config';
import { fetchWatchProviders } from '../providers';
import { SpanishFilter } from '@/hooks/mediaFetch/types';
import { cachedFetch } from '../apiCache';

export const fetchRealTrending = async (
  type: 'all' | 'movie' | 'tv' = 'all',
  page: number = 1,
  timeWindow: 'day' | 'week' = 'week',
  spanishFilter: SpanishFilter = 'off',
  fetchProviders: boolean = false
): Promise<Media[]> => {
  try {
    // The trending endpoint ignores with_original_language — we filter client-side below
    const params: any = {
      page,
      language: 'es-ES',
      region: 'ES'
    };
    
    const url = buildApiUrl(`/trending/${type}/${timeWindow}`, params);
    
    console.log(`Fetching trending ${type} for ${timeWindow}, page ${page}, spanishFilter: ${spanishFilter}: ${url}`);
    
    const response = await cachedFetch(url);
    
    if (!response.ok) {
      throw new Error(`Error fetching trending ${type}: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Received ${data.results?.length || 0} trending results for ${type}, page ${page}`);

    // Client-side language filter (trending endpoint ignores with_original_language)
    let rawResults: any[] = (data.results || []).filter(Boolean);
    if (spanishFilter === 'hispano') {
      rawResults = rawResults.filter(item => item.original_language === 'es');
    } else if (spanishFilter === 'spain') {
      rawResults = rawResults.filter(item =>
        item.original_language === 'es' && item.origin_country?.includes('ES')
      );
    }
    console.log(`After spanishFilter="${spanishFilter}": ${rawResults.length} items`);

    const mediaPromises = rawResults
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
    return validResults;
  } catch (error) {
    console.error(`Error fetching trending ${type}:`, error);
    return [];
  }
};
