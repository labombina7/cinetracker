
import { Media } from '@/types/media';

export const applyPlatformFiltering = (
  results: Media[], 
  validPlatformIds: number[], 
  filterByPlatform: (results: Media[], platformIds: number[]) => Media[],
  dataSource: 'discover' | 'new' | string
): Media[] => {
  // Verificar que tenemos resultados y plataformas válidas
  if (!results || results.length === 0) {
    return [];
  }
  
  if (validPlatformIds.length > 0 && (dataSource === 'discover' || dataSource === 'new')) {
    console.log(`Double checking platform filtering for ${dataSource}`);
    const filteredResults = filterByPlatform(results, validPlatformIds);
    
    // Si el filtrado reduce significativamente los resultados, combinar los filtrados con algunos sin filtrar
    if (filteredResults.length < Math.min(5, results.length / 2)) {
      console.log(`Platform filtering too restrictive (${filteredResults.length} results), adding some unfiltered`);
      // Obtener elementos que no estén ya en los filtrados
      const unfilteredItems = results.filter(item => 
        !filteredResults.some(filtered => filtered.id === item.id)
      );
      
      // Combinar: primero los filtrados, luego hasta 15 sin filtrar
      return [...filteredResults, ...unfilteredItems.slice(0, 15)];
    } else {
      // Suficientes resultados filtrados, usamos esos
      return filteredResults;
    }
  }
  
  return results;
};
