import { useState, useEffect, useRef } from 'react';
import { Media } from '@/types/media';
import { fetchEditorial, EditorialFetchConfig, EditorialSortBy } from '@/services/tmdb/discover/fetchEditorial';
import { fetchRealTrending } from '@/services/tmdb/index';
import { useMediaFilters } from '@/contexts/MediaFiltersContext';

export type CarouselStrategy = 'trending' | 'editorial' | 'genre';

// Maps the global sortBy filter to TMDB sort_by strings for genre carousels
const SORT_MAP: Record<string, { movie: EditorialSortBy; tv: EditorialSortBy }> = {
  none:   { movie: 'popularity.desc',          tv: 'popularity.desc' },
  rating: { movie: 'vote_average.desc',        tv: 'vote_average.desc' },
  date:   { movie: 'primary_release_date.desc', tv: 'first_air_date.desc' },
};

export interface CarouselConfig {
  id: string;
  titleEs: string;
  titleEn: string;
  strategy: CarouselStrategy;
  sortByForMore?: 'none' | 'rating' | 'date';
  // editorial strategy params (fixed sort, ignores global sortBy)
  sortByMovie?: string;
  sortByTv?: string;
  minVoteCount?: number;
  releaseDateGteMovie?: string;
  releaseDateGteTv?: string;
  // genre strategy params — fixed genre per media type
  movieGenreId?: number;
  tvGenreId?: number;
  genreMinVoteCount?: number;
}

export const useEditorialCarousel = (
  config: CarouselConfig,
  overridePlatformIds?: number[]
) => {
  const { filtersState } = useMediaFilters();
  const { mediaType, spanishFilter, selectedPlatformIds, selectedGenreId, sortBy } = filtersState;

  // Platform source: explicit override (focus mode) or global selection
  const effectivePlatformIds = overridePlatformIds ?? selectedPlatformIds;

  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!triggered) return;

    let cancelled = false;
    setLoading(true);
    setMedia([]);

    const run = async () => {
      let results: Media[] = [];

      if (config.strategy === 'trending' && effectivePlatformIds.length === 0) {
        results = await fetchRealTrending(mediaType, 1, 'week', spanishFilter);
        if (selectedGenreId !== null) {
          results = results.filter(
            m => m.genre_ids?.includes(selectedGenreId) || m.genres?.some(g => g.id === selectedGenreId)
          );
        }
        results = results.slice(0, 10);

      } else if (config.strategy === 'genre') {
        // Genre carousels: fixed genreId per type, sort driven by global sortBy
        const sorts = SORT_MAP[sortBy] ?? SORT_MAP.none;
        const resolvedMovieGenreId = mediaType !== 'tv' ? (config.movieGenreId ?? null) : null;
        const resolvedTvGenreId    = mediaType !== 'movie' ? (config.tvGenreId ?? null) : null;

        const editorialConfig: EditorialFetchConfig = {
          mediaType,
          platformIds: effectivePlatformIds,
          spanishFilter,
          genreId: null, // handled per-type below via separate fetches
          sortByMovie: sorts.movie,
          sortByTv: sorts.tv,
          minVoteCount: config.genreMinVoteCount ?? 20,
          movieGenreIdOverride: resolvedMovieGenreId,
          tvGenreIdOverride: resolvedTvGenreId,
        };
        ({ items: results } = await fetchEditorial(editorialConfig));

      } else {
        // Editorial carousels: fixed sort, uses global selectedGenreId
        const editorialConfig: EditorialFetchConfig = {
          mediaType,
          platformIds: effectivePlatformIds,
          spanishFilter,
          genreId: selectedGenreId,
          sortByMovie: (config.sortByMovie ?? 'popularity.desc') as EditorialSortBy,
          sortByTv: (config.sortByTv ?? 'popularity.desc') as EditorialSortBy,
          minVoteCount: config.minVoteCount,
          releaseDateGteMovie: config.releaseDateGteMovie,
          releaseDateGteTv: config.releaseDateGteTv,
        };
        ({ items: results } = await fetchEditorial(editorialConfig));
      }

      if (!cancelled) {
        setMedia(results.slice(0, 10));
        setLoading(false);
        setHasLoaded(true);
      }
    };

    run().catch(() => {
      if (!cancelled) { setLoading(false); setHasLoaded(true); }
    });

    return () => { cancelled = true; };
  }, [triggered, config.id, mediaType, spanishFilter, effectivePlatformIds, selectedGenreId, sortBy]);

  return { media, loading, hasLoaded, sectionRef };
};
