
import { useCallback, useEffect } from 'react';
import { useApiKey } from '@/hooks/useApiKey';
import { useLanguage } from '@/hooks/useLanguage';
import { useFetchStrategy } from './useFetchStrategy';
import { useMediaState } from './mediaFetch/useMediaState';
import { useMediaCache } from './mediaFetch/useMediaCache';
import { useFetchMediaCore } from './mediaFetch/useFetchMediaCore';
import { useLoadMore } from './mediaFetch/useLoadMore';
import { useProvidersData } from './useProvidersData';
import { MediaFetchParams } from './mediaFetch/types';

interface FetchMediaOptions {
  mediaType?: 'all' | 'movie' | 'tv';
  showSpanishOnly?: boolean;
  dataSource?: 'discover' | 'trending';
  sortBy?: 'rating' | 'date';
  selectedPlatformIds?: number[];
  forceRefresh?: boolean;
  page?: number;
  append?: boolean;
}

export const useMediaFetch = () => {
  const { isConfigured } = useApiKey();
  const { language } = useLanguage();
  const { fetchMediaByStrategy } = useFetchStrategy();
  const { selectedPlatforms } = useProvidersData();
  
  const {
    mediaList,
    loading,
    error,
    hasMore,
    currentPage,
    fetchInProgress,
    lastFetchParams,
    setMediaList,
    setLoading,
    setError,
    setHasMore,
    setCurrentPage,
    updateMediaList
  } = useMediaState();

  const {
    checkCache,
    saveToCache,
    clearSavedResults,
    restoreLastParams
  } = useMediaCache();
  
  const { fetchMedia: fetchMediaCore } = useFetchMediaCore({
    isConfigured,
    language,
    fetchMediaByStrategy,
    selectedPlatforms,
    fetchInProgress,
    lastFetchParams,
    setLoading,
    setMediaList,
    setCurrentPage,
    updateMediaList,
    setError,
    setHasMore,
    checkCache,
    saveToCache
  });

  // Wrapper function that accepts either object or parameters
  const fetchMedia = useCallback((
    optionsOrMediaType: FetchMediaOptions | 'all' | 'movie' | 'tv',
    showSpanishOnly?: boolean,
    dataSource?: 'discover' | 'trending',
    selectedPlatformIds?: number[],
    forceRefresh?: boolean,
    page?: number,
    append?: boolean,
    sortBy?: 'rating' | 'date'
  ): Promise<void> => {
    // Check if first argument is an object (options)
    if (typeof optionsOrMediaType === 'object') {
      const options = optionsOrMediaType;
      return fetchMediaCore(
        options.mediaType || 'all',
        options.showSpanishOnly || false,
        options.dataSource || 'trending',
        options.selectedPlatformIds || [],
        options.forceRefresh || false,
        options.page || 1,
        options.append || false,
        options.sortBy || 'rating'
      );
    } else {
      // Legacy parameter style
      return fetchMediaCore(
        optionsOrMediaType,
        showSpanishOnly || false,
        dataSource || 'trending',
        selectedPlatformIds || [],
        forceRefresh || false,
        page || 1,
        append || false,
        sortBy || 'rating'
      );
    }
  }, [fetchMediaCore]);

  // Restore cached state on initial mount
  useEffect(() => {
    const savedParams = restoreLastParams();
    if (savedParams) {
      // Convert old data source values if needed
      if (savedParams.dataSource === 'combined' || savedParams.dataSource === 'new') {
        savedParams.dataSource = 'discover';
      }
      
      // Add sortBy if it doesn't exist
      if (!savedParams.sortBy) {
        savedParams.sortBy = 'rating';
      }
      
      lastFetchParams.current = {
        ...savedParams,
        page: savedParams.page || 1
      };
      console.log('Restored search parameters:', savedParams);
    }

    const cachedResults = checkCache(
      lastFetchParams.current,
      lastFetchParams.current, 
      false
    );
    
    if (cachedResults) {
      setMediaList(cachedResults);
      console.log(`Restored ${cachedResults.length} results from previous session`);
    }
  }, [restoreLastParams, checkCache, setMediaList, lastFetchParams]);

  // Load more functionality
  const { loadMore } = useLoadMore({
    currentPage,
    setCurrentPage,
    loading,
    hasMore,
    lastFetchParams,
    fetchMedia: fetchMediaCore
  });

  return {
    mediaList,
    loading,
    error,
    hasMore,
    fetchMedia,
    loadMore,
    clearSavedResults,
    currentPage
  };
};
