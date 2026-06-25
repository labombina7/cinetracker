
import { useCallback } from 'react';
import { Media } from '@/types/media';
import { MediaFetchParams } from './types';
import { haveParamsChanged, sanitizePlatformIds } from './fetchMediaUtils';
import { fetchMediaForMultiplePlatforms } from './fetchMediaPlatforms';
import { handleFetchError } from './fetchMediaError';

export const useFetchMedia = ({
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
}) => {
  
  const fetchMedia = useCallback(async (
    mediaType: 'all' | 'movie' | 'tv' = 'all',
    spanishFilter: import('./types').SpanishFilter = 'off',
    dataSource: 'discover' | 'trending' = 'trending',
    selectedPlatformIds: number[] = [],
    forceRefresh: boolean = false,
    page: number = 1,
    append: boolean = false,
    sortBy: 'rating' | 'date' = 'rating'
  ): Promise<void> => {
    if (!isConfigured) {
      console.log('API not configured, skipping fetch');
      return Promise.resolve();
    }
    
    // Prevent multiple simultaneous requests
    if (fetchInProgress.current) {
      console.log('Fetch already in progress, skipping...');
      return Promise.resolve();
    }

    // Debug logging
    console.log(`[fetchMedia] dataSource: ${dataSource}, mediaType: ${mediaType}, Spanish: ${spanishFilter}, platforms: ${selectedPlatformIds.join(',') || 'none'}, sortBy: ${sortBy}, page: ${page}, forceRefresh: ${forceRefresh}, append: ${append}`);

    // Sanitize platform IDs
    const platformIdsToUse = sanitizePlatformIds(selectedPlatformIds, selectedPlatforms);
    
    // Create current params object
    const currentParams = {
      mediaType,
      spanishFilter,
      dataSource,
      selectedPlatformIds: platformIdsToUse,
      sortBy,
      page
    };
    
    // Check if params have changed
    const paramsChanged = haveParamsChanged(currentParams, lastFetchParams.current);
    
    if (paramsChanged) {
      console.log('Parameters changed, forcing refresh');
      forceRefresh = true;
    }
    
    // Cache check - only if first page and no append or forceRefresh
    if (page === 1 && !append && !forceRefresh) {
      const cachedResults = checkCache(currentParams, lastFetchParams.current, false);
      if (cachedResults && cachedResults.length > 0) {
        console.log(`Using ${cachedResults.length} cached results`);
        setMediaList(cachedResults);
        setHasMore(true);
        setLoading(false);
        
        // Update last params even when using cache
        lastFetchParams.current = { 
          ...currentParams,
          selectedPlatformIds: [...platformIdsToUse]
        };
        
        return Promise.resolve();
      }
    }
    
    // Update last fetch params before making request
    lastFetchParams.current = { 
      ...currentParams,
      selectedPlatformIds: [...platformIdsToUse]
    };

    try {
      fetchInProgress.current = true;
      setLoading(true);
      
      // Reset list if force refreshing and not appending
      if (forceRefresh && !append) {
        console.log('Clearing media list due to forced refresh');
        setMediaList([]);
        setCurrentPage(1);
      }
      
      // Fetch data for all platforms or without platforms
      const finalData = await fetchMediaForMultiplePlatforms({
        fetchMediaByStrategy,
        currentParams,
        platformIdsToUse,
        language,
        sortBy
      });
      
      console.log(`Combined results: ${finalData.length} unique items`);
      
      // Handle empty results
      if (!finalData || finalData.length === 0) {
        console.log(`No results found for ${currentParams.dataSource}/${currentParams.mediaType}`);
        setHasMore(false);
        
        if (!append) {
          setMediaList([]);
        }
      } else {
        console.log(`Received ${finalData.length} combined results for ${currentParams.dataSource}/${currentParams.mediaType}`);
        
        // Update media list
        updateMediaList(finalData, append, finalData.length >= 10);
        
        // Cache first page results
        if (page === 1) {
          saveToCache(finalData, {
            mediaType,
            spanishFilter, 
            dataSource,
            selectedPlatformIds: platformIdsToUse,
            sortBy
          });
        }
        
        setError('');
        setHasMore(finalData.length >= 10);
      }
      
      return Promise.resolve();
    } catch (err: any) {
      const errorMessage = handleFetchError(err, language);
      setError(errorMessage);
      setHasMore(false);
      return Promise.reject(err);
    } finally {
      setLoading(false);
      fetchInProgress.current = false;
    }
  }, [
    isConfigured, 
    language, 
    fetchMediaByStrategy, 
    selectedPlatforms,
    checkCache,
    saveToCache,
    setLoading,
    setMediaList,
    setCurrentPage,
    updateMediaList,
    setError,
    setHasMore
  ]);

  return { fetchMedia };
};
