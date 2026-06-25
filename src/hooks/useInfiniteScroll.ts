
import { useEffect, useState, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  initialPage?: number;
}

export const useInfiniteScroll = (options: UseInfiniteScrollOptions = {}) => {
  const { threshold = 200, initialPage = 1 } = options;
  
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadingRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  
  // Callback que se ejecuta cuando se ve el elemento de carga
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries;
    if (target.isIntersecting && hasMore && !isLoadingMore) {
      setPage(prev => prev + 1);
    }
  }, [hasMore, isLoadingMore]);
  
  // Configurar el observador
  useEffect(() => {
    if (loadingRef.current && hasMore) {
      if (observer.current) observer.current.disconnect();
      
      observer.current = new IntersectionObserver(handleObserver, {
        rootMargin: `0px 0px ${threshold}px 0px`
      });
      
      observer.current.observe(loadingRef.current);
    }
    
    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [handleObserver, hasMore, threshold]);
  
  // Reset de páginas
  const resetPagination = useCallback(() => {
    setPage(initialPage);
    setHasMore(true);
    setIsLoadingMore(false);
  }, [initialPage]);
  
  return {
    page,
    setPage,
    hasMore,
    setHasMore,
    isLoadingMore,
    setIsLoadingMore,
    loadingRef,
    resetPagination
  };
};
