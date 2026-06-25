
import { useState, useRef } from 'react';
import { Media } from '@/types/media';
import { MediaFetchParams } from './types';

export const useMediaState = () => {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  const fetchInProgress = useRef(false);
  const lastFetchParams = useRef<MediaFetchParams>({
    mediaType: 'all',
    showSpanishOnly: false,
    dataSource: 'trending',
    selectedPlatformIds: [],
    sortBy: 'rating',
    page: 1
  });

  const updateMediaList = (
    results: Media[], 
    append: boolean,
    shouldCheckHasMore: boolean = true
  ) => {
    // Crear copia profunda para prevenir mutaciones
    const finalResults = JSON.parse(JSON.stringify(results));
    
    // Actualizamos el estado según si estamos añadiendo o reemplazando
    if (append) {
      setMediaList(prev => {
        // Filtrar duplicados
        const newItems = finalResults.filter(newItem => 
          !prev.some(existingItem => existingItem.id === newItem.id)
        );
        
        console.log(`Adding ${newItems.length} new items to existing ${prev.length} items`);
        
        return [...prev, ...newItems];
      });
    } else {
      setMediaList(finalResults);
    }
    
    // Actualizamos si hay más resultados o no
    if (shouldCheckHasMore) {
      setHasMore(finalResults.length > 0);
    }
  };

  return {
    mediaList,
    loading,
    error,
    hasMore,
    currentPage,
    fetchInProgress,
    lastFetchParams,
    setMediaList,
    setLoading,
    setError,
    setHasMore,
    setCurrentPage,
    updateMediaList
  };
};
