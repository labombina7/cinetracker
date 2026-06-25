
import { Media } from '@/types/media';
import { fetchNewAdditions } from '@/services/tmdb/index';
import { sortByReleaseDate, sortByVoteAverage } from '@/utils/mediaSorting';

export const fetchNewStrategy = async (
  mediaType: 'all' | 'movie' | 'tv',
  page: number,
  validPlatformIds: number[],
  filterByPlatform: (items: Media[], platformIds: number[]) => Media[]
): Promise<Media[]> => {
  console.log(`Fetching new additions for ${mediaType}, page ${page}`);
  
  try {
    // Increase MAX_PAGES to allow more infinite scrolling
    const MAX_PAGES = 10;
    
    // If we're beyond the limit of pages, return empty to indicate end
    if (page > MAX_PAGES) {
      console.log(`Page ${page} requested for new additions, beyond limit (${MAX_PAGES}). Returning empty array.`);
      return [];
    }
    
    // Fetch specific page from API
    console.log(`Fetching new additions page ${page} for ${mediaType}, platforms: ${validPlatformIds.join(',') || 'all'}`);
    
    // For the "new" endpoint, we'll fetch using page parameter directly
    const params: Record<string, any> = {
      page: page
    };
    
    let results: Media[] = [];
    
    if (validPlatformIds.length > 0) {
      // Pass IDs directly to the API
      results = await fetchNewAdditions(mediaType, validPlatformIds, page);
      
      // Try alternative approach if not enough results
      if (results.length < 10) {
        console.log(`Not enough new results with API filtering (${results.length}), using fallback`);
        const allResults = await fetchNewAdditions(mediaType, [], page);
        
        if (allResults && allResults.length > 0) {
          // Apply manual filtering with stricter rules
          const filtered = filterByPlatform(allResults, validPlatformIds);
          
          if (filtered.length > results.length) {
            // Use results from manual filtering if we found more
            console.log(`Found more results with manual filtering: ${filtered.length}`);
            results = filtered;
          } else if (results.length < 5) {
            // Add some unfiltered results if still too few
            const remainingItems = allResults
              .filter(item => !results.some(r => r.id === item.id))
              .slice(0, 20);
            results = [...results, ...remainingItems];
          }
        }
      }
    } else {
      results = await fetchNewAdditions(mediaType, [], page);
    }
    
    // Sort by rating then by release date for consistency
    if (results && results.length > 0) {
      results = sortByVoteAverage(results);
      // Secondary sort - for items with same rating, sort by date
      if (results.length > 5) {
        const topRated = results.slice(0, 5);
        const rest = sortByReleaseDate(results.slice(5));
        results = [...topRated, ...rest];
      }
    }
    
    console.log(`New additions: Fetched page ${page} with ${results.length} items`);
    return results;
  } catch (error) {
    console.error(`Error fetching new additions data for ${mediaType}:`, error);
    return [];
  }
};
