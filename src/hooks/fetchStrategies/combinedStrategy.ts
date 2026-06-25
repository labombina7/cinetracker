
import { Media } from '@/types/media';
import { fetchRealTrending, fetchCombinedTrending, fetchMediaByPlatforms } from '@/services/tmdb/index';

export const fetchCombinedStrategy = async (
  mediaType: 'all' | 'movie' | 'tv',
  page: number,
  validPlatformIds: number[],
  filterByPlatform: (items: Media[], platformIds: number[]) => Media[]
): Promise<Media[]> => {
  console.log(`Fetching combined trending for ${mediaType}, page ${page}, platforms: ${validPlatformIds.join(',') || 'all'}`);
  
  try {
    // Para combinados, si hay plataformas seleccionadas, usamos enfoque mixto
    let results: Media[] = [];
    
    // Para paginación en combinado, limitamos las páginas
    if (page > 3) {
      console.log('Combined strategy does not support more than 3 pages');
      return [];
    }
    
    // En la primera página, obtenemos combined trending
    if (page === 1) {
      results = await fetchCombinedTrending(mediaType);
      console.log(`Got ${results.length} combined trending items before platform filtering`);
    } else {
      // Para páginas adicionales, usamos trending normal
      results = await fetchRealTrending(mediaType, page);
      console.log(`Got ${results.length} real trending items for page ${page}`);
    }
    
    // Verificar que tenemos resultados válidos
    if (!results || results.length === 0) {
      console.error('No combined results returned from API');
      return [];
    }
    
    // Siempre aplicamos el filtro de plataforma si hay plataformas seleccionadas
    if (validPlatformIds.length > 0) {
      console.log(`Filtering combined results by platforms: ${validPlatformIds.join(',')}`);
      const beforeCount = results.length;
      const filteredResults = filterByPlatform(results, validPlatformIds);
      console.log(`Platform filtering: ${beforeCount} → ${filteredResults.length} items`);
      
      // Si hay pocos resultados, intentar obtener directamente por plataformas
      if (filteredResults.length < 5) {
        console.log('Few combined results after filtering, adding platform-specific items');
        
        // Obtener items específicos de las plataformas seleccionadas
        const platformItems = await fetchMediaByPlatforms(mediaType, validPlatformIds, page);
        
        // Unir resultados sin duplicados
        const allResults = [...filteredResults];
        for (const item of platformItems) {
          if (!allResults.some(existing => existing.id === item.id)) {
            allResults.push(item);
          }
        }
        
        // Ordenar por puntuación
        allResults.sort((a, b) => b.voteAverage - a.voteAverage);
        
        return allResults.slice(0, 20); // Limitar a 20 resultados
      }
      
      return filteredResults;
    }
    
    return results;
  } catch (error) {
    console.error(`Error fetching combined data for ${mediaType}:`, error);
    return [];
  }
};
