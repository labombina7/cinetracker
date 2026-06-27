import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Search, X } from 'lucide-react';
import { Media } from '@/types/media';
import { fetchEditorial, EditorialFetchConfig, EditorialSortBy } from '@/services/tmdb/discover/fetchEditorial';
import { searchMedia } from '@/services/tmdb/search';
import { useMediaFilters } from '@/contexts/MediaFiltersContext';
import { useLanguage } from '@/hooks/useLanguage';
import { useApiKey } from '@/hooks/useApiKey';
import { useProvidersData } from '@/hooks/useProvidersData';
import { useGenres } from '@/hooks/useGenres';
import MediaCard from '@/components/MediaCard';
import FilterBar from '@/components/FilterBar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { SpanishFilter } from '@/hooks/mediaFetch/types';

interface ListState {
  sortBy?: 'none' | 'rating' | 'date';
  movieGenreId?: number;
  tvGenreId?: number;
  searchText?: string;
}

const SORT_MAP: Record<string, { movie: EditorialSortBy; tv: EditorialSortBy }> = {
  none:   { movie: 'popularity.desc',           tv: 'popularity.desc' },
  rating: { movie: 'vote_average.desc',         tv: 'vote_average.desc' },
  date:   { movie: 'primary_release_date.desc', tv: 'first_air_date.desc' },
};

const List = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const { isConfigured } = useApiKey();
  const { filtersState } = useMediaFilters();
  const { platforms } = useProvidersData();

  const incoming = (location.state as ListState) ?? {};

  // Local filter state
  const [mediaType, setMediaType] = useState(filtersState.mediaType);
  const [spanishFilter, setSpanishFilter] = useState<SpanishFilter>(filtersState.spanishFilter);
  const [sortBy, setSortBy] = useState<'none' | 'rating' | 'date'>(incoming.sortBy ?? filtersState.sortBy);
  const [movieGenreId, setMovieGenreId] = useState<number | null>(incoming.movieGenreId ?? null);
  const [tvGenreId, setTvGenreId] = useState<number | null>(incoming.tvGenreId ?? null);
  const [platformIds, setPlatformIds] = useState<number[]>(filtersState.selectedPlatformIds);
  const [searchText, setSearchText] = useState(incoming.searchText ?? '');
  const [debouncedSearch, setDebouncedSearch] = useState(incoming.searchText ?? '');

  const { genres } = useGenres(mediaType);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchText), 300);
    return () => clearTimeout(t);
  }, [searchText]);

  // Pagination state
  const [items, setItems] = useState<Media[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const selectedPlatforms = platforms.filter(p => platformIds.includes(p.id));

  // Active genre id for the current media type
  const activeGenreId = mediaType === 'tv' ? tvGenreId : movieGenreId;
  const handleGenreClick = (genreId: number) => {
    const next = activeGenreId === genreId ? null : genreId;
    setMovieGenreId(next);
    setTvGenreId(next);
  };

  const buildConfig = useCallback((): EditorialFetchConfig => {
    const sorts = SORT_MAP[sortBy] ?? SORT_MAP.none;
    return {
      mediaType,
      platformIds,
      spanishFilter,
      genreId: null,
      sortByMovie: sorts.movie,
      sortByTv: sorts.tv,
      minVoteCount: sortBy === 'rating' ? 200 : 10,
      movieGenreIdOverride: mediaType !== 'tv' ? movieGenreId : null,
      tvGenreIdOverride: mediaType !== 'movie' ? tvGenreId : null,
    };
  }, [mediaType, platformIds, spanishFilter, sortBy, movieGenreId, tvGenreId]);

  const resetAndFetch = useCallback(async () => {
    setLoading(true);
    setError(false);
    setItems([]);
    setPage(1);
    setHasMore(true);
    try {
      if (debouncedSearch.trim()) {
        const results = await searchMedia(debouncedSearch, language, spanishFilter, true);
        setItems(results.slice(0, 20));
        setHasMore(false);
      } else {
        const { items: newItems, hasMore: more } = await fetchEditorial(buildConfig(), 1);
        setItems(newItems);
        setHasMore(more);
        setPage(2);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [buildConfig, debouncedSearch, language, filtersState.spanishFilter]);

  useEffect(() => {
    resetAndFetch();
  }, [mediaType, spanishFilter, sortBy, movieGenreId, tvGenreId, platformIds, debouncedSearch]);

  // Load more (only for discover, not search)
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || loading || debouncedSearch) return;
    setLoadingMore(true);
    try {
      const { items: newItems, hasMore: more } = await fetchEditorial(buildConfig(), page);
      setItems(prev => [...prev, ...newItems]);
      setHasMore(more);
      setPage(prev => prev + 1);
    } catch { /* silent */ }
    finally { setLoadingMore(false); }
  }, [loadingMore, hasMore, loading, buildConfig, page, debouncedSearch]);

  // Sentinel observer — root is the scrollable grid container
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    if (!sentinelRef.current || !hasMore) return;
    observerRef.current = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { root: scrollContainerRef.current, rootMargin: '300px' }
    );
    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [loadMore, hasMore]);

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate('/explore');
  };

  if (!isConfigured) { navigate('/'); return null; }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 57px)' }}>
      {/* ── Filter bar — not in the scroll area, always visible ── */}
      <div className="flex-shrink-0 bg-background border-b border-white/10">
        <div className="container mx-auto px-4 pt-3 pb-2 space-y-2">

          {/* Row 1: back + search */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="shrink-0 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">{language === 'es' ? 'Explorar' : 'Explore'}</span>
            </button>

            <div className="relative flex-1">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                placeholder={language === 'es' ? 'Buscar...' : 'Search...'}
                className="w-full h-8 pl-8 pr-8 rounded-md bg-white/10 border border-white/10 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-white/30"
              />
              {searchText && (
                <button
                  onClick={() => setSearchText('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Row 2: filter bar */}
          <FilterBar
            mediaType={mediaType}
            onMediaTypeChange={setMediaType}
            spanishFilter={spanishFilter}
            onSpanishFilterChange={setSpanishFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            activePlatforms={selectedPlatforms}
            onPlatformClick={(id) => setPlatformIds(prev =>
              prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
            )}
            focusPlatformId={null}
          />

          {/* Row 3: genre chips */}
          {genres.length > 0 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {genres.map(g => (
                <button
                  key={g.id}
                  onClick={() => handleGenreClick(g.id)}
                  className={`shrink-0 px-3 h-6 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                    activeGenreId === g.id
                      ? 'bg-white text-black'
                      : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Grid — scrollable area ── */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
      <div className="container mx-auto px-4 py-4">
        {error && !loading && (
          <div className="flex flex-col items-center gap-4 py-20 text-muted-foreground">
            <p>{language === 'es' ? 'Error cargando resultados' : 'Error loading results'}</p>
            <Button variant="outline" size="sm" onClick={resetAndFetch}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {language === 'es' ? 'Reintentar' : 'Retry'}
            </Button>
          </div>
        )}

        {!error && (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            {loading
              ? Array.from({ length: 15 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[2/3] rounded-lg" />
                ))
              : items.map(item => (
                  <MediaCard
                    key={`${item.id}-${item.type}`}
                    media={item}
                    onClick={() => navigate(`/details/${item.type}/${item.id}`, { state: { from: 'list' } })}
                  />
                ))
            }
            {loadingMore && Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={`more-${i}`} className="aspect-[2/3] rounded-lg" />
            ))}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-20 text-muted-foreground">
            <p className="text-lg">{language === 'es' ? 'Sin resultados' : 'No results'}</p>
            <p className="text-sm">{language === 'es' ? 'Prueba con otros filtros' : 'Try different filters'}</p>
          </div>
        )}

        {!loading && !hasMore && items.length > 0 && (
          <p className="text-center text-xs text-muted-foreground mt-8 pb-4">
            {language === 'es' ? 'Has llegado al final' : "You've reached the end"}
          </p>
        )}

        <div ref={sentinelRef} className="h-1" />
      </div>
      </div>
    </div>
  );
};

export default List;
