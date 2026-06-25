
import { Media } from '@/types/media';
import { convertToMedia } from '../utils';
import { buildApiUrl } from '../config';
import { fetchWatchProviders } from '../providers';

export const fetchNewAdditions = async (
  mediaType: 'all' | 'movie' | 'tv' = 'all',
  platformIds: number[] = [],
  page: number = 1
): Promise<Media[]> => {
  try {
    console.log(`fetchNewAdditions: type=${mediaType}, platforms=${platformIds.join(',') || 'none'}, page=${page}`);
    const results: Media[] = [];
    
    // Definir los tipos que vamos a consultar
    const typesToFetch = mediaType === 'all' 
      ? ['movie', 'tv'] 
      : [mediaType];
    
    // Consultar cada tipo
    for (const type of typesToFetch as ('movie' | 'tv')[]) {
      // Construir la URL para descubrir contenido ordenado por fecha de lanzamiento
      const params: Record<string, string | number | boolean> = {
        language: 'es',
        sort_by: 'primary_release_date.desc', // Ordenar por fecha de lanzamiento descendente
        'vote_count.gte': 10, // Filtrar solo con al menos 10 votos
        include_adult: false,
        page: page // Use the provided page parameter
      };

      // Si se especificaron plataformas, añadirlas a la consulta
      if (platformIds && platformIds.length > 0) {
        // Solo usamos las plataformas seleccionadas específicamente
        params.with_watch_providers = platformIds.join('|');
        params.watch_region = 'ES'; // Región para proveedores (España)
        console.log(`Using specified platforms for ${type}: ${platformIds.join(', ')}`);
      }
      
      const url = buildApiUrl(`/discover/${type}`, params);
      console.log(`Fetching new ${type} content: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error fetching new ${type} content: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Fetched ${data.results?.length || 0} new ${type} content items, page ${page}`);
      
      // Convertir los resultados al formato común
      if (data.results && Array.isArray(data.results)) {
        const mediaPromises = data.results
          .filter(Boolean)
          .map(async (item: any) => {
            const mediaItem = await convertToMedia({...item, media_type: type}, type);
            
            // Si el ítem es válido, intentamos obtener sus proveedores de streaming
            if (mediaItem && (!platformIds.length || !params.with_watch_providers)) {
              try {
                const providers = await fetchWatchProviders(mediaItem.id, type);
                if (providers && providers.results && providers.results.ES) {
                  mediaItem.watchProviders = {
                    flatrate: providers.results.ES.flatrate || [],
                    rent: providers.results.ES.rent || [],
                    buy: providers.results.ES.buy || []
                  };
                }
              } catch (error) {
                console.error(`Error fetching providers for ${mediaItem.title}:`, error);
                // Si hay error, inicializar watchProviders con arrays vacíos
                mediaItem.watchProviders = { flatrate: [], rent: [], buy: [] };
              }
            }
            
            return mediaItem;
          });
        
        const convertedItems = await Promise.all(mediaPromises);
        const validItems = convertedItems.filter((item): item is Media => item !== null);
        console.log(`Converted ${validItems.length} valid items for ${type}`);
        
        results.push(...validItems);
      } else {
        console.warn(`No results or invalid format for new ${type} content`);
      }
    }
    
    // Reordenar todos los resultados por fecha de lanzamiento (más recientes primero)
    const sortedResults = results.sort((a, b) => {
      if (!a.releaseDate) return 1;
      if (!b.releaseDate) return -1;
      return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
    });
    
    console.log(`New additions: ${sortedResults.length} valid items for page ${page}`);
    if (sortedResults.length > 0) {
      console.log(`Newest item date: ${sortedResults[0]?.releaseDate}`);
      console.log(`Oldest item date: ${sortedResults[sortedResults.length-1]?.releaseDate}`);
    }
    
    return sortedResults;
  } catch (error) {
    console.error('Error fetching new additions:', error);
    return [];
  }
};
