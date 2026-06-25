import { Media } from '@/types/media';
import { MediaFetchParams, SpanishFilter } from './types';

/**
 * Helper function to check if fetch parameters have changed
 */
export const haveParamsChanged = (
  currentParams: MediaFetchParams,
  lastParams: MediaFetchParams
): boolean => {
  if (!lastParams) return true;
  
  // Compare media type, data source, and filters
  const mediaTypeChanged = currentParams.mediaType !== lastParams.mediaType;
  const dataSourceChanged = currentParams.dataSource !== lastParams.dataSource;
  const spanishOnlyChanged = currentParams.spanishFilter !== lastParams.spanishFilter;
  
  // Compare platform IDs (using string representation for array comparison)
  const currentPlatformsKey = [...(currentParams.selectedPlatformIds || [])].sort().join(',');
  const lastPlatformsKey = [...(lastParams.selectedPlatformIds || [])].sort().join(',');
  const platformsChanged = currentPlatformsKey !== lastPlatformsKey;
  
  const sortByChanged = currentParams.sortBy !== lastParams.sortBy;
  
  const anyChanged = mediaTypeChanged || dataSourceChanged || spanishOnlyChanged || platformsChanged || sortByChanged;
  
  if (anyChanged) {
    console.log('Parameters changed between fetches:', {
      mediaType: { from: lastParams.mediaType, to: currentParams.mediaType, changed: mediaTypeChanged },
      dataSource: { from: lastParams.dataSource, to: currentParams.dataSource, changed: dataSourceChanged },
      spanishFilter: { from: lastParams.spanishFilter, to: currentParams.spanishFilter, changed: spanishOnlyChanged },
      sortBy: { from: lastParams.sortBy, to: currentParams.sortBy, changed: sortByChanged },
      platformsKey: { from: lastPlatformsKey, to: currentPlatformsKey, changed: platformsChanged }
    });
  }
  
  return anyChanged;
};

/**
 * Helper function to ensure valid platform IDs array
 */
export const sanitizePlatformIds = (
  selectedPlatformIds: number[] = [],
  selectedPlatforms: Array<{id: number, name: string, logoPath?: string}> = []
): number[] => {
  const platformIdsToUse = Array.isArray(selectedPlatformIds) && selectedPlatformIds.length > 0
    ? selectedPlatformIds
    : selectedPlatforms && selectedPlatforms.length > 0
      ? selectedPlatforms.map(p => p.id)
      : [];
      
  console.log(`Platforms to use for fetch: ${platformIdsToUse.join(', ') || 'none'}`);
  return platformIdsToUse;
};

/**
 * Filter Spanish content with more inclusive criteria
 * This function is used for client-side filtering when needed
 */
export const filterSpanishContent = (results: Media[], spanishFilter: SpanishFilter): Media[] => {
  if (spanishFilter === 'off') return results;
  
  console.log(`Client-side filtering for Spanish content from ${results.length} items`);
  
  // Filter client-side for Spanish content with broader criteria
  const filteredData = results.filter(item => {
    // Consider Spanish if:
    // 1. Original language is Spanish - PRINCIPAL CRITERIA
    const isSpanishLanguage = item.original_language === 'es';
    
    // 2. Country is Spain - SECONDARY CRITERIA
    const isFromSpain = item.country === 'ES';
    
    // 3. Title contains Spanish indicators
    const hasSpanishTitle = item.title && (
      item.title.toLowerCase().includes('española') ||
      item.title.toLowerCase().includes('español') ||
      item.title.includes('(Spain)') ||
      item.title.includes('(España)')
    );
    
    // We prioritize language as the main criterion
    // This will include all Spanish content (both from Spain and Latin America)
    const isSpanish = isSpanishLanguage || isFromSpain || hasSpanishTitle;
    
    if (isSpanish) {
      console.log(`Spanish content: "${item.title}" (lang: ${item.original_language}, country: ${item.country || 'unknown'})`);
    }
    
    return isSpanish;
  });
  
  console.log(`Found ${filteredData.length} Spanish items out of ${results.length} total items`);
  return filteredData;
};

/**
 * Creates the appropriate language parameter for API requests based on filter settings
 */
export const getLanguageParams = (spanishFilter: SpanishFilter): string => {
  if (spanishFilter !== 'off') return 'es';
  return 'es|en|en-US|fr';
};
