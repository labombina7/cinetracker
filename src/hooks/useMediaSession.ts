
import { useCallback } from 'react';
import { Media } from '@/types/media';
import { CacheParams } from './useCacheStrategy';

const LAST_MEDIA_RESULTS_KEY = 'lastMediaResults';
const LAST_FETCH_PARAMS_KEY = 'lastFetchParams';

export const useMediaSession = () => {
  const saveResultsToSession = useCallback((results: Media[], params: Omit<CacheParams, "page">) => {
    try {
      // Guardar copia profunda para evitar problemas de referencia
      const resultsCopy = JSON.parse(JSON.stringify(results));
      sessionStorage.setItem(LAST_MEDIA_RESULTS_KEY, JSON.stringify(resultsCopy));
      sessionStorage.setItem(LAST_FETCH_PARAMS_KEY, JSON.stringify(params));
      
      console.log(`Saved ${results.length} results to session with params:`, {
        mediaType: params.mediaType,
        dataSource: params.dataSource,
        platformIds: params.selectedPlatformIds
      });
    } catch (err) {
      console.error('Error saving results to sessionStorage:', err);
    }
  }, []);

  const clearSavedResults = useCallback(() => {
    sessionStorage.removeItem(LAST_MEDIA_RESULTS_KEY);
    sessionStorage.removeItem(LAST_FETCH_PARAMS_KEY);
    console.log('Cleared saved results from session');
  }, []);

  const getSessionStorageSize = useCallback(() => {
    try {
      const resultsSize = sessionStorage.getItem(LAST_MEDIA_RESULTS_KEY)?.length || 0;
      const paramsSize = sessionStorage.getItem(LAST_FETCH_PARAMS_KEY)?.length || 0;
      return {
        resultsSize: Math.round(resultsSize / 1024),
        paramsSize: Math.round(paramsSize / 1024),
        total: Math.round((resultsSize + paramsSize) / 1024)
      };
    } catch (e) {
      return { resultsSize: 0, paramsSize: 0, total: 0 };
    }
  }, []);

  return {
    saveResultsToSession,
    clearSavedResults,
    getSessionStorageSize,
    LAST_MEDIA_RESULTS_KEY,
    LAST_FETCH_PARAMS_KEY
  };
};
