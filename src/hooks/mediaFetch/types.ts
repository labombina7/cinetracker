
import { Media } from '@/types/media';

export type SpanishFilter = 'off' | 'hispano' | 'spain';

export interface MediaFetchParams {
  mediaType: 'all' | 'movie' | 'tv';
  spanishFilter: SpanishFilter;
  dataSource: 'discover' | 'trending';
  selectedPlatformIds: number[];
  sortBy: 'rating' | 'date';
  page: number;
}

export interface FetchMediaCoreProps {
  isConfigured: boolean;
  language: string;
  fetchMediaByStrategy: (
    dataSource: 'discover' | 'trending',
    mediaType: 'all' | 'movie' | 'tv',
    selectedPlatformIds: number[],
    sortBy: 'rating' | 'date',
    page: number,
    spanishFilter: SpanishFilter
  ) => Promise<Media[]>;
  selectedPlatforms: Array<{id: number, name: string, logoPath?: string}>;
  fetchInProgress: React.MutableRefObject<boolean>;
  lastFetchParams: React.MutableRefObject<MediaFetchParams>;
  setLoading: (loading: boolean) => void;
  setMediaList: (mediaList: Media[]) => void;
  setCurrentPage: (page: number) => void;
  updateMediaList: (results: Media[], append: boolean, shouldCheckHasMore: boolean) => void;
  setError: (error: string) => void;
  setHasMore: (hasMore: boolean) => void;
  checkCache: (
    currentParams: MediaFetchParams, 
    lastParams: MediaFetchParams, 
    forceRefresh: boolean
  ) => Media[] | null;
  saveToCache: (
    results: Media[], 
    params: Omit<MediaFetchParams, 'page'>
  ) => void;
}
