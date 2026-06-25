
import { useState, useRef, useEffect, useCallback } from 'react';
import { useMediaFilters } from '@/contexts/MediaFiltersContext';
import { useInitialFetch } from './home/useInitialFetch';
import { useMediaScroll } from './home/useMediaScroll';
import { useMediaFetch } from './useMediaFetch';
import { useApiKey } from '@/hooks/useApiKey';
import { useLocation } from 'react-router-dom';

export const useHomeMediaFetch = () => {
  const { isConfigured } = useApiKey();
  const {
    mediaList,
    loading,
    error,
    hasMore,
    fetchMedia,
    loadMore,
    clearSavedResults
  } = useMediaFetch();

  // Reference for the infinite scroll
  const loadingRef = useRef<HTMLDivElement>(null);

  // Get filters context and change indicator
  const { filtersState, filtersChanged, resetFiltersChanged } = useMediaFilters();
  
  // Track if we need to force a refresh
  const location = useLocation();
  const [forceRefreshNeeded, setForceRefreshNeeded] = useState(false);
  
  // Track initial fetch to avoid double fetching
  const initialFetchCompleted = useRef(false);
  const refreshCompleted = useRef(false);
  const fetchInProgress = useRef(false);
  
  // Detect if we're coming from settings page and force refresh
  const checkForceRefresh = useCallback(() => {
    if (fetchInProgress.current) return;
    
    console.log('Checking for force refresh:', location.state);
    
    const needsRefresh = location.state?.forceRefresh === true || 
                         location.state?.from === 'settings';
    
    if (needsRefresh && !refreshCompleted.current) {
      console.log('Force refresh needed from navigation state:', location.state);
      setForceRefreshNeeded(true);
      clearSavedResults();
      
      // Clean up location state to prevent reuse on future navigation
      window.history.replaceState({}, document.title);
      
      // Mark refresh as needed but not completed yet
      refreshCompleted.current = false;
    }
  }, [location.state, clearSavedResults]);
  
  // Execute forced refresh check on mount and location change
  useEffect(() => {
    checkForceRefresh();
  }, [location, checkForceRefresh]);
  
  // Perform initial fetch or when filters change
  useEffect(() => {
    // Prevent duplicate API calls
    if (fetchInProgress.current) {
      console.log('Fetch operation already in progress, skipping...');
      return;
    }
    
    console.log('useHomeMediaFetch: Detecting changes:', {
      filtersChanged,
      forceRefreshNeeded,
      mediaType: filtersState.mediaType,
      spanishFilter: filtersState.spanishFilter,
      dataSource: filtersState.dataSource,
      sortBy: filtersState.sortBy,
      selectedPlatformIds: filtersState.selectedPlatformIds,
      initialFetchCompleted: initialFetchCompleted.current,
      refreshCompleted: refreshCompleted.current
    });
    
    // If not initialized or filters changed or we need to force refresh
    if (!initialFetchCompleted.current || filtersChanged || forceRefreshNeeded) {
      console.log('useHomeMediaFetch: Performing fetch with force refresh:', forceRefreshNeeded);
      
      // Set flag to prevent duplicate calls
      fetchInProgress.current = true;
      
      // Clear cache to ensure fresh data
      clearSavedResults();
      
      // Load new data with updated filters
      fetchMedia({
        mediaType: filtersState.mediaType,
        spanishFilter: filtersState.spanishFilter,
        dataSource: filtersState.dataSource,
        selectedPlatformIds: filtersState.selectedPlatformIds,
        sortBy: filtersState.sortBy,
        forceRefresh: true,
        page: 1,
        append: false
      }).then(() => {
        console.log('Initial fetch completed successfully');
        if (isConfigured) {
          initialFetchCompleted.current = true;
        }
        refreshCompleted.current = true;
        fetchInProgress.current = false;
      }).catch(() => {
        initialFetchCompleted.current = true;
        fetchInProgress.current = false;
      });
      
      // Reset indicators after loading
      resetFiltersChanged();
      setForceRefreshNeeded(false);
    }
  }, [
    isConfigured,
    filtersChanged,
    forceRefreshNeeded,
    filtersState.mediaType,
    filtersState.spanishFilter,
    filtersState.dataSource,
    filtersState.selectedPlatformIds,
    filtersState.sortBy,
    fetchMedia,
    resetFiltersChanged,
    clearSavedResults
  ]);

  // Set up infinite scroll with the loadMore function
  useMediaScroll(loadingRef, loading, hasMore, loadMore);

  return { mediaList, loading, error, hasMore, loadingRef };
};
