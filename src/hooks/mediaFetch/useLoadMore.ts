
import { useCallback } from 'react';
import { MediaFetchParams } from './types';

interface UseLoadMoreProps {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  loading: boolean;
  hasMore: boolean;
  lastFetchParams: React.MutableRefObject<MediaFetchParams>;
  fetchMedia: (
    mediaType: 'all' | 'movie' | 'tv',
    spanishFilter: import('./types').SpanishFilter,
    dataSource: 'discover' | 'trending',
    selectedPlatformIds: number[],
    forceRefresh: boolean,
    page: number,
    append: boolean
  ) => Promise<void>;
}

export const useLoadMore = ({
  currentPage,
  setCurrentPage,
  loading,
  hasMore,
  lastFetchParams,
  fetchMedia
}: UseLoadMoreProps) => {
  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;

    const nextPage = currentPage + 1;
    console.log(`Loading more content, page ${nextPage}`);
    
    setCurrentPage(nextPage);
    
    console.log("Load more with params:", {
      mediaType: lastFetchParams.current.mediaType,
      spanishFilter: lastFetchParams.current.spanishFilter,
      dataSource: lastFetchParams.current.dataSource,
      selectedPlatformIds: lastFetchParams.current.selectedPlatformIds,
      page: nextPage
    });
    
    fetchMedia(
      lastFetchParams.current.mediaType,
      lastFetchParams.current.spanishFilter,
      lastFetchParams.current.dataSource,
      lastFetchParams.current.selectedPlatformIds,
      false, // No force refresh on load more
      nextPage,
      true // append: true to keep existing content
    );
  }, [currentPage, loading, hasMore, setCurrentPage, fetchMedia, lastFetchParams]);

  return { loadMore };
};
