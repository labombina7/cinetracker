
import { Media } from '@/types/media';
import { fetchMediaData } from './fetchMediaData';
import { sortByReleaseDate, sortByVoteAverage } from '@/utils/mediaSorting';

interface FetchMediaForPlatformsProps {
  fetchMediaByStrategy: any;
  currentParams: any;
  platformIdsToUse: number[];
  language: string;
  sortBy: 'none' | 'rating' | 'date';
  genreId?: number | null;
}

export const fetchMediaForMultiplePlatforms = async ({
  fetchMediaByStrategy,
  currentParams,
  platformIdsToUse,
  language,
  sortBy,
  genreId = null
}: FetchMediaForPlatformsProps): Promise<Media[]> => {
  const allMediaPromises = [
    fetchMediaData(
      (ds, mt, _pids, sb, pg) =>
        fetchMediaByStrategy(ds, mt, platformIdsToUse, sb, pg, currentParams.spanishFilter, genreId),
      currentParams,
      language
    )
  ];
  
  // Wait for all promises to resolve
  const allResults = await Promise.all(allMediaPromises);
  
  // Combine all results into a single list
  let combinedResults: Media[] = [];
  allResults.forEach(results => {
    if (results && results.length > 0) {
      combinedResults = [...combinedResults, ...results];
    }
  });
  
  // Remove duplicates (by ID)
  const uniqueMap = new Map<number, Media>();
  combinedResults.forEach(item => {
    if (!uniqueMap.has(item.id)) {
      uniqueMap.set(item.id, item);
    }
  });
  
  // Convert Map to array and sort globally
  let finalData = Array.from(uniqueMap.values());
  
  // Sort the entire set according to selected criterion
  if (sortBy === 'rating') {
    finalData = sortByVoteAverage(finalData);
  } else if (sortBy === 'date') {
    finalData = sortByReleaseDate(finalData);
  }
  
  return finalData;
};
