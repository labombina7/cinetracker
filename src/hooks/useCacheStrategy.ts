
import { useCallback } from 'react';
import { useMediaSession } from './useMediaSession';

import { SpanishFilter } from './mediaFetch/types';

export interface CacheParams {
  mediaType: string;
  spanishFilter: SpanishFilter;
  dataSource: string;
  selectedPlatformIds: number[];
}

export const useCacheStrategy = () => {
  const { 
    LAST_MEDIA_RESULTS_KEY, 
    LAST_FETCH_PARAMS_KEY 
  } = useMediaSession();

  const shouldUseCache = useCallback((
    currentParams: CacheParams,
    lastParams: CacheParams,
    forceRefresh: boolean
  ): boolean => {
    if (forceRefresh) {
      console.log('Cache bypass: forceRefresh is true');
      return false;
    }
    
    // Verificar si algún parámetro ha cambiado
    const mediaTypeChanged = lastParams.mediaType !== currentParams.mediaType;
    const spanishOnlyChanged = lastParams.spanishFilter !== currentParams.spanishFilter;
    const dataSourceChanged = lastParams.dataSource !== currentParams.dataSource;
    
    // Compare platform IDs by converting arrays to sorted strings
    const currentPlatformsStr = JSON.stringify([...currentParams.selectedPlatformIds].sort());
    const lastPlatformsStr = JSON.stringify([...lastParams.selectedPlatformIds].sort());
    const platformsChanged = currentPlatformsStr !== lastPlatformsStr;
    
    // Registrar cambios para depuración
    if (mediaTypeChanged) console.log('Cache miss: mediaType changed');
    if (spanishOnlyChanged) console.log('Cache miss: spanishFilter changed');
    if (dataSourceChanged) console.log('Cache miss: dataSource changed');
    if (platformsChanged) console.log('Cache miss: platforms changed', {
      last: lastParams.selectedPlatformIds, 
      current: currentParams.selectedPlatformIds
    });
    
    // Solo usar caché si TODOS los parámetros son iguales
    return !mediaTypeChanged && !spanishOnlyChanged && !dataSourceChanged && !platformsChanged;
  }, []);

  const getCachedResults = useCallback(() => {
    try {
      const cachedResults = sessionStorage.getItem(LAST_MEDIA_RESULTS_KEY);
      if (!cachedResults) {
        console.log('Cache miss: No cached results found');
        return null;
      }
      
      const parsedResults = JSON.parse(cachedResults);
      if (Array.isArray(parsedResults) && parsedResults.length > 0) {
        console.log(`Cache hit: Found ${parsedResults.length} cached results`);
        // Crear una copia profunda para evitar mutaciones accidentales
        return JSON.parse(JSON.stringify(parsedResults));
      }
      
      console.log('Cache miss: Invalid or empty cached results');
    } catch (e) {
      console.error('Error parsing cached results:', e);
    }
    return null;
  }, [LAST_MEDIA_RESULTS_KEY]);

  const restoreLastParams = useCallback(() => {
    try {
      const savedParams = sessionStorage.getItem(LAST_FETCH_PARAMS_KEY);
      if (savedParams) {
        const params = JSON.parse(savedParams);
        console.log('Restored search parameters:', params);
        return params;
      }
      console.log('No saved search parameters found');
    } catch (err) {
      console.error('Error restoring last params:', err);
    }
    return null;
  }, [LAST_FETCH_PARAMS_KEY]);

  return {
    shouldUseCache,
    getCachedResults,
    restoreLastParams
  };
};
