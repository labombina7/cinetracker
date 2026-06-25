
import { useEffect, useRef } from 'react';
import { useMediaFilters } from '@/contexts/MediaFiltersContext';
import { useLocation } from 'react-router-dom';
import { useMediaFetch } from '../useMediaFetch';

export const useInitialFetch = () => {
  const { filtersState, filtersChanged, resetFiltersChanged } = useMediaFilters();
  const { fetchMedia, clearSavedResults } = useMediaFetch();
  const location = useLocation();
  const isReturningFromDetails = useRef(false);
  const initialFetchComplete = useRef(false);
  const lastDataSource = useRef(filtersState.dataSource);
  const lastMediaType = useRef(filtersState.mediaType);
  const lastShowSpanishOnly = useRef(filtersState.showSpanishOnly);
  const lastSelectedPlatformIds = useRef<number[]>([...filtersState.selectedPlatformIds]);
  const fetchInProgress = useRef(false);
  
  // Detectar si volvemos de una página de detalles
  useEffect(() => {
    const fromDetails = location.state?.from === 'details';
    isReturningFromDetails.current = fromDetails;
    
    // Restablecer el estado para futuras navegaciones
    if (fromDetails) {
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  // Función mejorada para verificar cambios en filtros
  const haveFiltersChanged = () => {
    // Comprobación directa de cada filtro individual
    const dataSourceChanged = lastDataSource.current !== filtersState.dataSource;
    const mediaTypeChanged = lastMediaType.current !== filtersState.mediaType;
    const spanishOnlyChanged = lastShowSpanishOnly.current !== filtersState.showSpanishOnly;
    
    // Comparación de arrays de plataformas usando strings para simplificar
    const prevPlatforms = [...lastSelectedPlatformIds.current].sort().join(',');
    const currentPlatforms = [...filtersState.selectedPlatformIds].sort().join(',');
    const platformsChanged = prevPlatforms !== currentPlatforms;
    
    const anyChanged = dataSourceChanged || mediaTypeChanged || spanishOnlyChanged || platformsChanged;
    
    if (anyChanged) {
      console.log('FILTERS HAVE CHANGED - Detected in useInitialFetch:', {
        dataSource: { from: lastDataSource.current, to: filtersState.dataSource, changed: dataSourceChanged },
        mediaType: { from: lastMediaType.current, to: filtersState.mediaType, changed: mediaTypeChanged },
        spanishOnly: { from: lastShowSpanishOnly.current, to: filtersState.showSpanishOnly, changed: spanishOnlyChanged },
        platforms: { from: prevPlatforms, to: currentPlatforms, changed: platformsChanged }
      });
    }
    
    return anyChanged;
  };

  // Cargar datos iniciales o cuando cambien los filtros
  useEffect(() => {
    // Prevent multiple simultaneous fetches
    if (fetchInProgress.current) {
      console.log('Initial fetch already in progress, skipping...');
      return;
    }
    
    console.log('Current filters:', {
      mediaType: filtersState.mediaType,
      showSpanishOnly: filtersState.showSpanishOnly,
      dataSource: filtersState.dataSource,
      selectedPlatformIds: filtersState.selectedPlatformIds,
      filtersChanged: filtersChanged
    });

    const loadInitialData = async () => {
      // Verificar si los filtros han cambiado
      const filtersHaveChanged = haveFiltersChanged();
      const forceRefresh = filtersChanged || !initialFetchComplete.current || filtersHaveChanged;
      
      console.log(`Deciding to refresh: filtersChanged=${filtersChanged}, initialFetchComplete=${initialFetchComplete.current}, filtersHaveChanged=${filtersHaveChanged}, forceRefresh=${forceRefresh}`);
      
      // Si el dataSource o mediaType cambió, necesitamos limpiar la caché
      if ((lastDataSource.current !== filtersState.dataSource || lastMediaType.current !== filtersState.mediaType) && forceRefresh) {
        console.log('Data source or media type changed, clearing cache');
        clearSavedResults();
      }
      
      console.log(`Fetching media with forceRefresh=${forceRefresh}, isReturning=${isReturningFromDetails.current}`);
      
      if (forceRefresh && !fetchInProgress.current) {
        // Set flag to prevent multiple simultaneous fetches
        fetchInProgress.current = true;
        
        // IMPORTANTE: Actualizar referencias a valores actuales ANTES de la petición
        // para garantizar que detectemos cambios en la próxima llamada
        lastDataSource.current = filtersState.dataSource;
        lastMediaType.current = filtersState.mediaType;
        lastShowSpanishOnly.current = filtersState.showSpanishOnly;
        lastSelectedPlatformIds.current = [...filtersState.selectedPlatformIds];
        
        // Hacer la petición inicial con los filtros actuales
        try {
          await fetchMedia({
            mediaType: filtersState.mediaType,
            showSpanishOnly: filtersState.showSpanishOnly,
            dataSource: filtersState.dataSource,
            selectedPlatformIds: filtersState.selectedPlatformIds,
            forceRefresh: forceRefresh,
            page: 1,
            append: false
          });
          
          initialFetchComplete.current = true;
          
          // Resetear el indicador de cambios después de cargar
          if (filtersChanged) {
            console.log('Resetting filtersChanged flag after data fetch');
            resetFiltersChanged();
          }
        } catch (error) {
          console.error('Error during initial data fetch:', error);
        } finally {
          fetchInProgress.current = false;
        }
      }
    };

    loadInitialData();
    
  }, [
    fetchMedia, 
    filtersState.mediaType, 
    filtersState.showSpanishOnly, 
    filtersState.dataSource, 
    filtersState.selectedPlatformIds,
    filtersChanged,
    resetFiltersChanged,
    clearSavedResults
  ]);

  return { isReturningFromDetails: isReturningFromDetails.current };
};
