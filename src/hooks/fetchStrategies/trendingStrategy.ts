
import { Media } from '@/types/media';
import { fetchRealTrending } from '@/services/tmdb/index';
import { sortByVoteAverage } from '@/utils/mediaSorting';

export const fetchTrendingStrategy = async (
  mediaType: 'all' | 'movie' | 'tv',
  page: number,
  validPlatformIds: number[],
  filterByPlatform: (items: Media[], platformIds: number[]) => Media[],
  showSpanishOnly: boolean = false // Nuevo parámetro
): Promise<Media[]> => {
  console.log(`Fetching trending for ${mediaType}, page ${page}, platforms: ${validPlatformIds.join(',') || 'all'}, Spanish only: ${showSpanishOnly}`);
  
  try {
    // Pasamos el parámetro de idioma español a fetchRealTrending
    let results = await fetchRealTrending(mediaType, page, 'week', showSpanishOnly);
    console.log(`Got ${results.length} trending items before platform filtering for page ${page}`);
    
    // Si no obtuvimos resultados, devolver array vacío para evitar errores
    if (!results || results.length === 0) {
      console.error('No trending results returned from API');
      return [];
    }
    
    // Apply platform filtering when platforms are selected
    if (validPlatformIds.length > 0) {
      console.log(`Filtering trending results by platforms: ${validPlatformIds.join(',')}`);
      
      const beforeCount = results.length;
      const filteredResults = filterByPlatform(results, validPlatformIds);
      console.log(`Platform filtering for page ${page}: ${beforeCount} → ${filteredResults.length} items`);
      
      // Si nos quedamos con muy pocos resultados, intentamos obtener más
      if (filteredResults.length < 20 && page <= 10) { // Increased limits significantly
        console.log(`Not enough results (${filteredResults.length}), getting more trending content from next pages`);
        
        // Determine how many additional pages we should fetch based on available results
        const additionalPagesToFetch = 
          filteredResults.length < 5 ? 5 : // If less than 5 results, fetch 5 more pages
          filteredResults.length < 10 ? 4 : // If less than 10 results, fetch 4 more pages
          filteredResults.length < 15 ? 3 : // If less than 15 results, fetch 3 more pages
          2; // Otherwise fetch 2 more pages (increased from 1)
          
        console.log(`Will fetch ${additionalPagesToFetch} additional pages`);
        
        // Array to hold all additional results
        let additionalFiltered: Media[] = [];
        
        // Fetch multiple additional pages if needed
        for (let i = 1; i <= additionalPagesToFetch; i++) {
          const nextPage = page + i;
          console.log(`Fetching additional trending page ${nextPage}`);
          
          // Pasamos el parámetro de idioma español
          const additionalResults = await fetchRealTrending(mediaType, nextPage, 'week', showSpanishOnly);
          console.log(`Got ${additionalResults.length} additional trending items from page ${nextPage}`);
          
          // Filter these results too
          const pageFiltered = filterByPlatform(additionalResults, validPlatformIds);
          console.log(`After filtering page ${nextPage}: ${pageFiltered.length} items`);
          
          // Add to our collection
          additionalFiltered = [
            ...additionalFiltered,
            ...pageFiltered
          ];
          
          // If we already have enough results, stop fetching more pages
          if (filteredResults.length + additionalFiltered.length >= 40) {
            console.log(`Already have ${filteredResults.length + additionalFiltered.length} results, stopping additional fetches`);
            break;
          }
        }
        
        // Combine results, avoiding duplicates
        const combinedResults = [
          ...filteredResults,
          ...additionalFiltered.filter(item => 
            !filteredResults.some(existing => existing.id === item.id)
          )
        ];
        
        console.log(`Combined results from all pages: ${combinedResults.length} items`);
        return sortByVoteAverage(combinedResults);
      }
      
      return filteredResults;
    }
    
    // Always sort by vote average for consistency
    results = sortByVoteAverage(results);
    
    return results || [];
  } catch (error) {
    console.error(`Error fetching trending data for ${mediaType}:`, error);
    return [];
  }
};
