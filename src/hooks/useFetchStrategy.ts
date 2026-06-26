
import { useCallback } from 'react';
import { Media } from '@/types/media';
import { fetchRealTrending } from '@/services/tmdb/index';
import { usePlatformFilter } from './usePlatformFilter';
import { fetchTrendingStrategy } from './fetchStrategies/trendingStrategy';
import { fetchDiscoverStrategy } from './fetchStrategies/discoverStrategy';
import { sortByReleaseDate, sortByVoteAverage } from '@/utils/mediaSorting';
import { SpanishFilter } from './mediaFetch/types';

export const useFetchStrategy = () => {
  const { filterByPlatform } = usePlatformFilter();

  const fetchMediaByStrategy = useCallback(async (
    dataSource: 'discover' | 'trending',
    mediaType: 'all' | 'movie' | 'tv',
    selectedPlatformIds: number[] = [],
    sortBy: 'none' | 'rating' | 'date' = 'none',
    page: number = 1,
    spanishFilter: SpanishFilter = 'off'
  ): Promise<Media[]> => {
    let results: Media[] = [];
    
    // Verificamos array válido de IDs de plataformas
    const validPlatformIds = Array.isArray(selectedPlatformIds) ? selectedPlatformIds : [];
    
    try {
      // Cache key for memoization
      const cacheKey = `${dataSource}-${mediaType}-${validPlatformIds.join(',')}-${sortBy}-${page}-${spanishFilter}`;
      
      // Seleccionar estrategia según fuente de datos
      switch (dataSource) {
        case 'trending':
          console.log(`Using trending strategy for ${mediaType}`);
          results = await fetchTrendingStrategy(
            mediaType, 
            page, 
            validPlatformIds, 
            filterByPlatform,
            spanishFilter
          );
          break;
          
        case 'discover':
          console.log(`Using discover strategy for ${mediaType}`);
          results = await fetchDiscoverStrategy(
            mediaType,
            page,
            validPlatformIds,
            filterByPlatform,
            spanishFilter,
            sortBy
          );
          break;
          
        default:
          console.log(`Fallback to trending for ${mediaType}, page ${page}`);
          results = await fetchRealTrending(mediaType, page, "week", spanishFilter);
          
          // Aplicar filtro de plataformas si es necesario
          if (validPlatformIds.length > 0) {
            const beforeCount = results.length;
            results = filterByPlatform(results, validPlatformIds);
            console.log(`Platform filtering: ${beforeCount} → ${results.length} items`);
          }
      }
      
      // Apply sorting based on sortBy parameter if we have results
      if (results && results.length > 0) {
        if (sortBy === 'rating') {
          results = sortByVoteAverage(results);
        } else if (sortBy === 'date') {
          results = sortByReleaseDate(results);
        }
      }
      
      // Only log brief summary of results
      if (results && results.length > 0) {
        console.log(`Strategy ${dataSource} returned ${results.length} items for ${mediaType} (sorted by ${sortBy})`);
      } else {
        console.warn(`No results from strategy ${dataSource} for ${mediaType}`);
      }
      
      return results;
    } catch (error) {
      console.error(`Error in fetchMediaByStrategy (${dataSource}/${mediaType}):`, error);
      return [];
    }
  }, [filterByPlatform]);

  return { fetchMediaByStrategy };
};
