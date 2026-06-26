
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { SpanishFilter } from '@/hooks/mediaFetch/types';

interface MediaFiltersState {
  spanishFilter: SpanishFilter;
  mediaType: 'all' | 'movie' | 'tv';
  dataSource: 'discover' | 'trending';
  selectedPlatformIds: number[];
  sortBy: 'none' | 'rating' | 'date';
  selectedGenreId: number | null;
}

interface MediaFiltersContextType {
  filtersState: MediaFiltersState;
  updateFilters: (filters: Partial<MediaFiltersState>) => void;
  setSpanishFilter: (value: SpanishFilter) => void;
  setMediaType: (type: 'all' | 'movie' | 'tv') => void;
  setDataSource: (source: 'discover' | 'trending') => void;
  setSortBy: (sort: 'none' | 'rating' | 'date') => void;
  setSelectedPlatformIds: (platforms: number[]) => void;
  setSelectedGenreId: (genreId: number | null) => void;
  filtersChanged: boolean;
  resetFiltersChanged: () => void;
}

const initialState: MediaFiltersState = {
  spanishFilter: 'off',
  mediaType: 'all',
  dataSource: 'trending',
  selectedPlatformIds: [],
  sortBy: 'none',
  selectedGenreId: null,
};

const MediaFiltersContext = createContext<MediaFiltersContextType>({
  filtersState: initialState,
  updateFilters: () => {},
  setSpanishFilter: () => {},
  setMediaType: () => {},
  setDataSource: () => {},
  setSortBy: () => {},
  setSelectedPlatformIds: () => {},
  setSelectedGenreId: () => {},
  filtersChanged: false,
  resetFiltersChanged: () => {},
});

export const useMediaFilters = () => useContext(MediaFiltersContext);

interface MediaFiltersProviderProps {
  children: ReactNode;
}

export const MediaFiltersProvider: React.FC<MediaFiltersProviderProps> = ({ children }) => {
  const getSavedState = (): MediaFiltersState => {
    try {
      const savedFilters = localStorage.getItem('mediaFilters');
      if (savedFilters) {
        const parsed = JSON.parse(savedFilters);
        console.log('Loaded filters from localStorage:', parsed);

        // Migrate old data source values
        if (parsed.dataSource === 'combined' || parsed.dataSource === 'new') {
          parsed.dataSource = 'discover';
        }

        // Add sortBy if missing
        if (!parsed.sortBy) {
          parsed.sortBy = 'none';
        }

        // Migrate old showSpanishOnly boolean to spanishFilter
        if (parsed.showSpanishOnly !== undefined && !parsed.spanishFilter) {
          parsed.spanishFilter = parsed.showSpanishOnly ? 'hispano' : 'off';
          delete parsed.showSpanishOnly;
        }
        if (!parsed.spanishFilter) {
          parsed.spanishFilter = 'off';
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

  useEffect(() => {
    try {
      localStorage.setItem('mediaFilters', JSON.stringify(filtersState));

      const dataSourceChanged = previousState.current.dataSource !== filtersState.dataSource;
      const mediaTypeChanged = previousState.current.mediaType !== filtersState.mediaType;
      const spanishFilterChanged = previousState.current.spanishFilter !== filtersState.spanishFilter;
      const sortByChanged = previousState.current.sortBy !== filtersState.sortBy;

      const prevPlatformIds = [...previousState.current.selectedPlatformIds].sort().join(',');
      const currentPlatformIds = [...filtersState.selectedPlatformIds].sort().join(',');
      const platformIdsChanged = prevPlatformIds !== currentPlatformIds;

      const genreChanged = previousState.current.selectedGenreId !== filtersState.selectedGenreId;

      if (dataSourceChanged || mediaTypeChanged || spanishFilterChanged || platformIdsChanged || sortByChanged || genreChanged) {
        console.log('FILTERS CHANGED - Setting filtersChanged flag to true');
        console.log({
          dataSource: { from: previousState.current.dataSource, to: filtersState.dataSource, changed: dataSourceChanged },
          mediaType: { from: previousState.current.mediaType, to: filtersState.mediaType, changed: mediaTypeChanged },
          spanishFilter: { from: previousState.current.spanishFilter, to: filtersState.spanishFilter, changed: spanishFilterChanged },
          sortBy: { from: previousState.current.sortBy, to: filtersState.sortBy, changed: sortByChanged },
          platformIds: { from: prevPlatformIds, to: currentPlatformIds, changed: platformIdsChanged }
        });

        setFiltersChanged(true);
      }

      previousState.current = JSON.parse(JSON.stringify(filtersState));
    } catch (error) {
      console.error('Error saving filters to localStorage:', error);
    }
  }, [filtersState]);

  const updateFilters = (filters: Partial<MediaFiltersState>) => {
    console.log('Updating filters:', filters);
    setFiltersState(prevState => {
      const newState = {...prevState, ...filters};

      const hasChanges = (
        (filters.dataSource !== undefined && filters.dataSource !== prevState.dataSource) ||
        (filters.mediaType !== undefined && filters.mediaType !== prevState.mediaType) ||
        (filters.spanishFilter !== undefined && filters.spanishFilter !== prevState.spanishFilter) ||
        (filters.sortBy !== undefined && filters.sortBy !== prevState.sortBy) ||
        (filters.selectedPlatformIds !== undefined) ||
        (filters.selectedGenreId !== undefined && filters.selectedGenreId !== prevState.selectedGenreId)
      );

      if (hasChanges) {
        console.log('Setting filtersChanged flag due to immediate filter update');
        setFiltersChanged(true);
      }

      return newState;
    });
  };

  const setSpanishFilter = (value: SpanishFilter) => {
    updateFilters({ spanishFilter: value });
  };

  const setMediaType = (type: 'all' | 'movie' | 'tv') => {
    updateFilters({ mediaType: type });
  };

  const setDataSource = (source: 'discover' | 'trending') => {
    updateFilters({ dataSource: source });
  };

  const setSortBy = (sort: 'none' | 'rating' | 'date') => {
    updateFilters({ sortBy: sort });
  };

  const setSelectedPlatformIds = (platforms: number[]) => {
    console.log('Setting selected platform IDs:', platforms);
    updateFilters({ selectedPlatformIds: platforms });
  };

  const setSelectedGenreId = (genreId: number | null) => {
    updateFilters({ selectedGenreId: genreId });
  };

  const resetFiltersChanged = () => {
    setFiltersChanged(false);
  };

  const value = {
    filtersState,
    updateFilters,
    setSpanishFilter,
    setMediaType,
    setDataSource,
    setSortBy,
    setSelectedGenreId,
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
