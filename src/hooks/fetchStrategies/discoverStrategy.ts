
import { Media } from '@/types/media';
import { discoverMedia, fetchMediaByPlatforms } from '@/services/tmdb/index';
import { sortByVoteAverage } from '@/utils/mediaSorting';
import { SpanishFilter } from '@/hooks/mediaFetch/types';

export const fetchDiscoverStrategy = async (
  mediaType: 'all' | 'movie' | 'tv',
  page: number,
  validPlatformIds: number[],
  filterByPlatform: (items: Media[], platformIds: number[]) => Media[],
  spanishFilter: SpanishFilter = 'off',
  sortBy: 'none' | 'rating' | 'date' = 'none'
): Promise<Media[]> => {
  console.log(`Fetching discover for ${mediaType}, page ${page}, spanishFilter: ${spanishFilter}`);
  let results: Media[] = [];
  
  try {
    // If platforms selected, use direct platform API
    if (validPlatformIds.length > 0) {
      console.log(`Using direct platform API for discover with platforms: ${validPlatformIds.join(',')}`);
      
      // Use the API that filters directly by platform
      // Pasamos el nuevo parámetro de idioma español
      results = await fetchMediaByPlatforms(mediaType, validPlatformIds, page, spanishFilter, sortBy);
      console.log(`Direct platform API returned ${results.length} items for discover`);
      
      // Fallback if not enough results
      if (results.length < 5 && page === 1) {
        console.log(`Not enough discover results with direct platform API (${results.length}), falling back to regular discover + filtering`);
        
        // Handle different types for "all"
        const typesToFetch = mediaType === 'all' ? ['movie', 'tv'] : [mediaType];
        
        let generalResults: Media[] = [];
        for (const type of typesToFetch) {
          // Pasamos el parámetro de idioma español a discoverMedia
          const data = await discoverMedia(type as 'movie' | 'tv', page, [], spanishFilter, sortBy);
          if (data && data.length > 0) {
            generalResults = [...generalResults, ...data];
          }
        }
        
        // Apply strict platform filtering
        const filteredResults = filterByPlatform(generalResults, validPlatformIds);
        console.log(`Platform filtering: ${generalResults.length} → ${filteredResults.length} items`);
        
        // Combine unique results
        const allResults = [...results];
        
        for (const item of filteredResults) {
          if (!allResults.some(existing => existing.id === item.id)) {
            allResults.push(item);
          }
        }
        
        // Sort by rating
        results = sortByVoteAverage(allResults);
      } else {
        // Ensure results are sorted by rating
        results = sortByVoteAverage(results);
      }
      
      return results;
    } else {
      // Regular behavior without platform filtering
      const typesToFetch = mediaType === 'all' ? ['movie', 'tv'] : [mediaType];
      
      for (const type of typesToFetch) {
        // Pasamos el parámetro de idioma español
        const data = await discoverMedia(type as 'movie' | 'tv', page, [], spanishFilter);
        if (data && data.length > 0) {
          results = [...results, ...data];
        }
      }
      
      // Always sort by rating
      results = sortByVoteAverage(results);
      
      return results || [];
    }
  } catch (error) {
    console.error(`Error fetching discover data for ${mediaType}:`, error);
    return [];
  }
};
