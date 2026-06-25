
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
    showSpanishOnly: boolean,
    dataSource: 'discover' | 'trending' | 'combined' | 'new',
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
      showSpanishOnly: lastFetchParams.current.showSpanishOnly,
      dataSource: lastFetchParams.current.dataSource,
      selectedPlatformIds: lastFetchParams.current.selectedPlatformIds,
      page: nextPage
    });
    
    fetchMedia(
      lastFetchParams.current.mediaType,
      lastFetchParams.current.showSpanishOnly,
      lastFetchParams.current.dataSource,
      lastFetchParams.current.selectedPlatformIds,
      false, // No force refresh on load more
      nextPage,
      true // append: true to keep existing content
    );
  }, [currentPage, loading, hasMore, setCurrentPage, fetchMedia, lastFetchParams]);

  return { loadMore };
};
