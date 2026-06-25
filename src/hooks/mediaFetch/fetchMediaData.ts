
import { Media } from '@/types/media';
import { MediaFetchParams } from './types';
import { sortByReleaseDate, sortByVoteAverage } from '@/utils/mediaSorting';

/**
 * Core function to fetch media data using the appropriate strategy
 */
export const fetchMediaData = async (
  fetchMediaByStrategy: (
    dataSource: 'discover' | 'trending',
    mediaType: 'all' | 'movie' | 'tv',
    selectedPlatformIds: number[],
    sortBy: 'rating' | 'date',
    page: number
  ) => Promise<Media[]>,
  params: MediaFetchParams,
  language: string
): Promise<Media[]> => {
  const { 
    mediaType, 
    showSpanishOnly, 
    dataSource, 
    selectedPlatformIds,
    sortBy,
    page
  } = params;

  // Log platform selection only on first page
  if (page === 1 && selectedPlatformIds.length > 0) {
    console.log(`Using selected platforms: ${selectedPlatformIds.join(',')}`);
  }
  
  // Fetch data using strategy - now the Spanish filter is applied at the API level
  console.log(`Fetching ${dataSource} data for ${mediaType}, platforms: ${selectedPlatformIds.join(',')}, page: ${page}`);
  const results = await fetchMediaByStrategy(dataSource, mediaType, selectedPlatformIds, sortBy, page);
  
  // Only log results count, not entire results
  console.log(`Received ${results.length} results for ${dataSource}/${mediaType}`);
  
  // Apply sorting if needed
  let sortedData = results;
  if (sortBy === 'rating' && results.length > 0) {
    sortedData = sortByVoteAverage(results);
  } else if (sortBy === 'date' && results.length > 0) {
    sortedData = sortByReleaseDate(results);
  }
  
  return sortedData;
};
