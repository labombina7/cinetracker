
import { toast } from '@/components/ui/use-toast';
import { Media } from '@/types/media';
import { MediaFetchParams } from './types';

export const fetchMediaCore = async (
  fetchMediaByStrategy: (
    dataSource: 'discover' | 'trending',
    mediaType: 'all' | 'movie' | 'tv',
    selectedPlatformIds: number[],
    sortBy: 'rating' | 'date',
    page: number,
    spanishFilter: import('./types').SpanishFilter
  ) => Promise<Media[]>,
  params: MediaFetchParams,
  language: string
): Promise<Media[]> => {
  const {
    mediaType,
    spanishFilter,
    dataSource,
    selectedPlatformIds,
    sortBy,
    page
  } = params;

  // Verificar si hay plataformas seleccionadas y tomar alguna acción
  if (selectedPlatformIds.length > 0) {
    console.log(`Using selected platforms: ${selectedPlatformIds.join(',')}`);
  } else {
    console.log('No platforms selected, using all available');
  }
  
  // Fetch the data using the appropriate strategy
  console.log(`Fetching ${dataSource} data for ${mediaType}, platforms: ${selectedPlatformIds.join(',')}, sortBy: ${sortBy}, page: ${page}, Spanish only: ${spanishFilter}`);
  const results = await fetchMediaByStrategy(
    dataSource, 
    mediaType, 
    selectedPlatformIds, 
    sortBy, 
    page,
    spanishFilter
  );
  
  console.log(`Received ${results.length} results for ${dataSource}/${mediaType}`);
  
  // Ya no filtramos por idioma español aquí, ahora se hace directamente en la API
  let filteredData = results;
  
  console.log(`Results for page ${page}: ${filteredData.length} items (${spanishFilter ? 'Spanish only' : 'All languages'}, sorted by ${sortBy})`);
  
  return filteredData;
};

export const handleFetchError = (err: Error, language: string) => {
  console.error('Error fetching media:', err);
  const errorMessage = language === 'es' 
    ? 'Error al cargar los datos. Por favor, inténtalo de nuevo más tarde.'
    : 'Error loading data. Please try again later.';
    
  toast({
    variant: 'destructive',
    title: language === 'es' ? 'Error al cargar datos' : 'Error loading data',
    description: language === 'es' 
      ? 'Ha ocurrido un error al intentar cargar el contenido. Por favor, intenta de nuevo más tarde.'
      : 'An error occurred while loading content. Please try again later.',
  });
  
  return errorMessage;
};
