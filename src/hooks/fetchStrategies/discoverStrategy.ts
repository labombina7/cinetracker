
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
  sortBy: 'none' | 'rating' | 'date' = 'none',
  genreId: number | null = null
): Promise<Media[]> => {
  let results: Media[] = [];

  try {
    if (validPlatformIds.length > 0) {
      results = await fetchMediaByPlatforms(mediaType, validPlatformIds, page, spanishFilter, sortBy, genreId);

      if (results.length < 5 && page === 1) {
        const typesToFetch = mediaType === 'all' ? ['movie', 'tv'] : [mediaType];
        let generalResults: Media[] = [];
        for (const type of typesToFetch) {
          const data = await discoverMedia(type as 'movie' | 'tv', page, [], spanishFilter, sortBy, genreId);
          if (data && data.length > 0) generalResults = [...generalResults, ...data];
        }

        const filteredResults = filterByPlatform(generalResults, validPlatformIds);
        const allResults = [...results];
        for (const item of filteredResults) {
          if (!allResults.some(existing => existing.id === item.id)) allResults.push(item);
        }
        results = sortByVoteAverage(allResults);
      } else {
        results = sortByVoteAverage(results);
      }

      return results;
    } else {
      const typesToFetch = mediaType === 'all' ? ['movie', 'tv'] : [mediaType];
      for (const type of typesToFetch) {
        const data = await discoverMedia(type as 'movie' | 'tv', page, [], spanishFilter, sortBy, genreId);
        if (data && data.length > 0) results = [...results, ...data];
      }
      results = sortByVoteAverage(results);
      return results || [];
    }
  } catch (error) {
    console.error(`Error fetching discover data for ${mediaType}:`, error);
    return [];
  }
};
