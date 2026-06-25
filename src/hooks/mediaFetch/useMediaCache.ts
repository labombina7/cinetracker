
import { useCallback } from 'react';
import { Media } from '@/types/media';
import { useMediaSession } from '../useMediaSession';
import { useCacheStrategy, CacheParams } from '../useCacheStrategy';
import type { MediaFetchParams } from './types';

export const useMediaCache = () => {
  const { 
    shouldUseCache, 
    getCachedResults, 
    restoreLastParams 
  } = useCacheStrategy();

  const { saveResultsToSession, clearSavedResults } = useMediaSession();

  const checkCache = useCallback((
    currentParams: MediaFetchParams, 
    lastParams: MediaFetchParams, 
    forceRefresh: boolean
  ) => {
    // Always bypass cache when force refreshing
    if (forceRefresh) {
      console.log('Force refresh requested, skipping cache check');
      clearSavedResults(); // Clear cache on force refresh
      return null;
    }
    
    // Always check if ANY parameter has changed, and if so, invalidate cache
    const currentPlatformIds = [...(currentParams.selectedPlatformIds || [])].sort().join(',');
    const lastPlatformIds = [...(lastParams.selectedPlatformIds || [])].sort().join(',');
    
    // If parameters changed, invalidate the cache
    if (currentParams.mediaType !== lastParams.mediaType ||
        currentParams.dataSource !== lastParams.dataSource ||
        currentParams.showSpanishOnly !== lastParams.showSpanishOnly ||
        currentParams.sortBy !== lastParams.sortBy ||
        currentPlatformIds !== lastPlatformIds) {
          
      console.log('Parameters changed, invalidating cache');
      console.log('Previous vs Current platforms:', lastPlatformIds, currentPlatformIds);
      console.log('Previous vs Current mediaType:', lastParams.mediaType, currentParams.mediaType);
      console.log('Previous vs Current dataSource:', lastParams.dataSource, currentParams.dataSource);
      console.log('Previous vs Current showSpanishOnly:', lastParams.showSpanishOnly, currentParams.showSpanishOnly);
      console.log('Previous vs Current sortBy:', lastParams.sortBy, currentParams.sortBy);
      
      clearSavedResults();
      return null;
    }
    
    // Solo usar caché para la primera página y si los parámetros no han cambiado
    if (currentParams.page === 1 && shouldUseCache(currentParams, lastParams, forceRefresh)) {
      const cachedResults = getCachedResults();
      if (cachedResults && cachedResults.length > 0) {
        console.log('Using cached results, same parameters:', currentParams);
        // Crear copia profunda para evitar mutaciones
        return JSON.parse(JSON.stringify(cachedResults));
      } else {
        console.log('Cache miss or empty results, fetching new data');
      }
    }
    return null;
  }, [getCachedResults, shouldUseCache, clearSavedResults]);

  const saveToCache = useCallback((
    results: Media[], 
    params: Omit<MediaFetchParams, 'page'>
  ) => {
    console.log(`Saving ${results.length} results to cache:`, params);
    // Guardar copia limpia en el almacenamiento de sesión
    // Solo guardamos en sesión la primera página
    saveResultsToSession(results, params);
  }, [saveResultsToSession]);

  return {
    checkCache,
    saveToCache,
    clearSavedResults,
    restoreLastParams
  };
};
