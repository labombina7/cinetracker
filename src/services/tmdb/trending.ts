
import { Media } from '../../types/media';
import { fetchRealTrending, fetchCombinedTrending } from './trending/index';

// Función para obtener las tendencias actuales con soporte para paginación
export const fetchTrending = async (
  type: 'all' | 'movie' | 'tv' = 'all', 
  page: number = 1
): Promise<Media[]> => {
  try {
    console.log(`fetchTrending called with type: ${type}, page: ${page}`);
    
    // Pasamos el tipo y la página a la implementación de tendencias reales
    // El tercer parámetro 'week' es el valor predeterminado en fetchRealTrending
    const results = await fetchRealTrending(type, page);
    console.log(`fetchTrending returning ${results.length} results for page ${page}`);
    
    return results;
  } catch (error) {
    console.error(`Error fetching trending ${type}:`, error);
    return [];
  }
};
