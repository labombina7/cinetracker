
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';

interface MediaFiltersState {
  showSpanishOnly: boolean;
  mediaType: 'all' | 'movie' | 'tv';
  dataSource: 'discover' | 'trending';
  selectedPlatformIds: number[];
  sortBy: 'rating' | 'date';
}

interface MediaFiltersContextType {
  filtersState: MediaFiltersState;
  updateFilters: (filters: Partial<MediaFiltersState>) => void;
  setShowSpanishOnly: (value: boolean) => void;
  setMediaType: (type: 'all' | 'movie' | 'tv') => void;
  setDataSource: (source: 'discover' | 'trending') => void;
  setSortBy: (sort: 'rating' | 'date') => void;
  setSelectedPlatformIds: (platforms: number[]) => void;
  filtersChanged: boolean;
  resetFiltersChanged: () => void;
}

const initialState: MediaFiltersState = {
  showSpanishOnly: false,
  mediaType: 'all',
  dataSource: 'trending',
  selectedPlatformIds: [],
  sortBy: 'rating',
};

const MediaFiltersContext = createContext<MediaFiltersContextType>({
  filtersState: initialState,
  updateFilters: () => {},
  setShowSpanishOnly: () => {},
  setMediaType: () => {},
  setDataSource: () => {},
  setSortBy: () => {},
  setSelectedPlatformIds: () => {},
  filtersChanged: false,
  resetFiltersChanged: () => {},
});

export const useMediaFilters = () => useContext(MediaFiltersContext);

interface MediaFiltersProviderProps {
  children: ReactNode;
}

export const MediaFiltersProvider: React.FC<MediaFiltersProviderProps> = ({ children }) => {
  // Try to load saved filter state from localStorage
  const getSavedState = (): MediaFiltersState => {
    try {
      const savedFilters = localStorage.getItem('mediaFilters');
      if (savedFilters) {
        const parsed = JSON.parse(savedFilters);
        console.log('Loaded filters from localStorage:', parsed);
        
        // Convert old data source values to new ones
        if (parsed.dataSource === 'combined' || parsed.dataSource === 'new') {
          parsed.dataSource = 'discover';
        }
        
        // Add sortBy if it doesn't exist
        if (!parsed.sortBy) {
          parsed.sortBy = 'rating';
        }
        
        return parsed;
      }
    } catch (error) {
      console.error('Error loading filters from localStorage:', error);
    }
    return initialState;
  };

  const [filtersState, setFiltersState] = useState<MediaFiltersState>(getSavedState());
  const [filtersChanged, setFiltersChanged] = useState(false);
  const previousState = useRef<MediaFiltersState>({...filtersState});

  // Save filter state to localStorage and detect changes
  useEffect(() => {
    try {
      localStorage.setItem('mediaFilters', JSON.stringify(filtersState));
      
      // Verificación explícita de cada filtro para detectar cambios
      const dataSourceChanged = previousState.current.dataSource !== filtersState.dataSource;
      const mediaTypeChanged = previousState.current.mediaType !== filtersState.mediaType;
      const spanishOnlyChanged = previousState.current.showSpanishOnly !== filtersState.showSpanishOnly;
      const sortByChanged = previousState.current.sortBy !== filtersState.sortBy;
      
      // Comparación de arrays de IDs de plataformas
      const prevPlatformIds = [...previousState.current.selectedPlatformIds].sort().join(',');
      const currentPlatformIds = [...filtersState.selectedPlatformIds].sort().join(',');
      const platformIdsChanged = prevPlatformIds !== currentPlatformIds;
      
      // Si hay cambios, marcamos para forzar actualización
      if (dataSourceChanged || mediaTypeChanged || spanishOnlyChanged || platformIdsChanged || sortByChanged) {
        console.log('FILTERS CHANGED - Setting filtersChanged flag to true');
        console.log({
          dataSource: { from: previousState.current.dataSource, to: filtersState.dataSource, changed: dataSourceChanged },
          mediaType: { from: previousState.current.mediaType, to: filtersState.mediaType, changed: mediaTypeChanged },
          spanishOnly: { from: previousState.current.showSpanishOnly, to: filtersState.showSpanishOnly, changed: spanishOnlyChanged },
          sortBy: { from: previousState.current.sortBy, to: filtersState.sortBy, changed: sortByChanged },
          platformIds: { from: prevPlatformIds, to: currentPlatformIds, changed: platformIdsChanged }
        });
        
        setFiltersChanged(true);
      }
      
      // Actualizamos el estado anterior después de la detección de cambios
      previousState.current = JSON.parse(JSON.stringify(filtersState));
    } catch (error) {
      console.error('Error saving filters to localStorage:', error);
    }
  }, [filtersState]);

  const updateFilters = (filters: Partial<MediaFiltersState>) => {
    console.log('Updating filters:', filters);
    setFiltersState(prevState => {
      // Para cada filtro actualizado, comparamos si realmente cambió
      const newState = {...prevState, ...filters};
      
      // Forzar la detección de cambios inmediatamente
      const hasChanges = (
        (filters.dataSource !== undefined && filters.dataSource !== prevState.dataSource) ||
        (filters.mediaType !== undefined && filters.mediaType !== prevState.mediaType) ||
        (filters.showSpanishOnly !== undefined && filters.showSpanishOnly !== prevState.showSpanishOnly) ||
        (filters.sortBy !== undefined && filters.sortBy !== prevState.sortBy) ||
        (filters.selectedPlatformIds !== undefined)
      );
      
      if (hasChanges) {
        console.log('Setting filtersChanged flag due to immediate filter update');
        setFiltersChanged(true);
      }
      
      return newState;
    });
  };

  const setShowSpanishOnly = (value: boolean) => {
    updateFilters({ showSpanishOnly: value });
  };

  const setMediaType = (type: 'all' | 'movie' | 'tv') => {
    updateFilters({ mediaType: type });
  };

  const setDataSource = (source: 'discover' | 'trending') => {
    updateFilters({ dataSource: source });
  };

  const setSortBy = (sort: 'rating' | 'date') => {
    updateFilters({ sortBy: sort });
  };

  const setSelectedPlatformIds = (platforms: number[]) => {
    console.log('Setting selected platform IDs:', platforms);
    updateFilters({ selectedPlatformIds: platforms });
  };

  const resetFiltersChanged = () => {
    setFiltersChanged(false);
  };

  const value = {
    filtersState,
    updateFilters,
    setShowSpanishOnly,
    setMediaType,
    setDataSource,
    setSortBy,
    setSelectedPlatformIds,
    filtersChanged,
    resetFiltersChanged,
  };

  return (
    <MediaFiltersContext.Provider value={value}>
      {children}
    </MediaFiltersContext.Provider>
  );
};
