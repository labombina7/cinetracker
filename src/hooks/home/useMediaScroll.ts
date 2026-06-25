
import { useEffect, useCallback } from 'react';

export const useMediaScroll = (
  loadingRef: React.RefObject<HTMLDivElement>,
  loading: boolean,
  hasMore: boolean,
  loadMore: () => void
) => {
  // Define the callback for when the intersection is detected
  const handleIntersect = useCallback(() => {
    if (!loading && hasMore) {
      console.log('Intersection detected, loading more content');
      loadMore();
    }
  }, [loading, hasMore, loadMore]);

  // Use the intersection observer with improved options for better detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          console.log('Loading element is visible in viewport, triggering load more');
          handleIntersect();
        }
      },
      { 
        rootMargin: '800px', // Increased significantly to detect much earlier
        threshold: 0.05 // Trigger when just a tiny part of the element is visible
      }
    );
    
    const currentLoadingRef = loadingRef.current;
    
    if (currentLoadingRef) {
      console.log('Setting up intersection observer for infinite scroll');
      observer.observe(currentLoadingRef);
    } else {
      console.warn('Loading ref is null, cannot set up intersection observer');
    }
    
    return () => {
      if (currentLoadingRef) {
        observer.disconnect();
      }
    };
  }, [loadingRef, hasMore, loading, handleIntersect]);

  return null;
};
