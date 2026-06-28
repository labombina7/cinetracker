import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useApiKey } from '@/hooks/useApiKey';
import { useLanguage } from '@/hooks/useLanguage';
import { useMediaFilters } from '@/contexts/MediaFiltersContext';
import { useProvidersData } from '@/hooks/useProvidersData';
import ApiKeySetup from '@/components/ApiKeySetup';
import HomeLoadingSkeleton from '@/components/home/HomeLoadingSkeleton';
import EditorialSection from '@/components/explore/EditorialSection';
import MustWatchBlock from '@/components/explore/MustWatchBlock';
import HeroRelease from '@/components/explore/HeroRelease';
import FilterBar from '@/components/FilterBar';
import { useWeeklyReleases } from '@/hooks/useWeeklyReleases';
import { CarouselConfig } from '@/hooks/useEditorialCarousel';

const sixtyDaysAgo = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 60);
  return d.toISOString().split('T')[0];
};

const EDITORIAL_CAROUSELS: CarouselConfig[] = [
  {
    id: 'trending',
    titleEs: 'Tendencias esta semana',
    titleEn: 'Trending this week',
    strategy: 'trending',
    sortByMovie: 'popularity.desc',
    sortByTv: 'popularity.desc',
    sortByForMore: 'none',
  },
  {
    id: 'new-releases',
    titleEs: 'Estrenos recientes',
    titleEn: 'New releases',
    strategy: 'editorial',
    sortByMovie: 'primary_release_date.desc',
    sortByTv: 'first_air_date.desc',
    releaseDateGteMovie: sixtyDaysAgo(),
    releaseDateGteTv: sixtyDaysAgo(),
    minVoteCount: 5,
    sortByForMore: 'date',
  },
  {
    id: 'top-rated',
    titleEs: 'Mejor valoradas',
    titleEn: 'Top rated',
    strategy: 'editorial',
    sortByMovie: 'vote_average.desc',
    sortByTv: 'vote_average.desc',
    minVoteCount: 500,
    sortByForMore: 'rating',
  },
];

const GENRE_CAROUSELS: CarouselConfig[] = [
  { id: 'genre-action',    titleEs: 'Acción',          titleEn: 'Action',         strategy: 'genre', movieGenreId: 28,  tvGenreId: 10759, sortByForMore: 'none' },
  { id: 'genre-comedy',    titleEs: 'Comedia',         titleEn: 'Comedy',         strategy: 'genre', movieGenreId: 35,  tvGenreId: 35,    sortByForMore: 'none' },
  { id: 'genre-drama',     titleEs: 'Drama',           titleEn: 'Drama',          strategy: 'genre', movieGenreId: 18,  tvGenreId: 18,    sortByForMore: 'none' },
  { id: 'genre-horror',    titleEs: 'Terror',          titleEn: 'Horror',         strategy: 'genre', movieGenreId: 27,  tvGenreId: 9648,  sortByForMore: 'none' },
  { id: 'genre-scifi',     titleEs: 'Ciencia ficción', titleEn: 'Sci-Fi',         strategy: 'genre', movieGenreId: 878, tvGenreId: 10765, sortByForMore: 'none' },
  { id: 'genre-animation', titleEs: 'Animación',       titleEn: 'Animation',      strategy: 'genre', movieGenreId: 16,  tvGenreId: 16,    sortByForMore: 'none' },
  { id: 'genre-thriller',  titleEs: 'Thriller',        titleEn: 'Thriller',       strategy: 'genre', movieGenreId: 53,  tvGenreId: 80,    sortByForMore: 'none' },
  { id: 'genre-docs',      titleEs: 'Documentales',    titleEn: 'Documentaries',  strategy: 'genre', movieGenreId: 99,  tvGenreId: 99,    sortByForMore: 'none' },
];

const Explore = () => {
  const { isConfigured, configureApiKey, isLoading } = useApiKey();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const {
    filtersState,
    setSpanishFilter,
    setMediaType,
    setSortBy,
  } = useMediaFilters();
  const { platforms } = useProvidersData();
  const { items: heroItems, loading: heroLoading } = useWeeklyReleases(filtersState.mediaType);

  const [focusPlatformId, setFocusPlatformId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (value.trim()) {
      searchTimerRef.current = setTimeout(() => {
        navigate('/list', { state: { searchText: value.trim() } });
        setSearchText('');
      }, 400);
    }
  };

  const effectivePlatformIds = focusPlatformId !== null
    ? [focusPlatformId]
    : filtersState.selectedPlatformIds;

  const selectedPlatforms = platforms.filter(p =>
    filtersState.selectedPlatformIds.includes(p.id)
  );

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleShowMore = (config: CarouselConfig) => {
    navigate('/list', {
      state: {
        sortBy: config.sortByForMore ?? 'none',
        ...(config.strategy === 'genre' && {
          movieGenreId: config.movieGenreId,
          tvGenreId: config.tvGenreId,
        }),
      },
    });
  };

  if (isLoading) return <HomeLoadingSkeleton />;
  if (!isConfigured) return <ApiKeySetup onApiKeySet={configureApiKey} />;

  return (
    <>
      {/* ── Header sticky ── */}
      <div className="sticky top-[57px] z-10">
        {/* Search bar */}
        <div className="bg-background/95 backdrop-blur-sm border-b border-white/10 py-2">
          <div className="container mx-auto px-4">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchText}
                onChange={e => handleSearchChange(e.target.value)}
                placeholder={language === 'es' ? 'Buscar películas y series...' : 'Search movies and shows...'}
                style={{ fontSize: '16px' }}
                className="w-full h-9 pl-9 pr-4 rounded-lg bg-white/10 border border-white/10 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-white/30"
              />
            </div>
          </div>
        </div>
        {/* ── Anchor chips de género ── */}
        <div className="bg-background/95 backdrop-blur-sm border-b border-white/10 py-2">
          <div className="container mx-auto px-4 flex gap-2 overflow-x-auto scrollbar-hide">
            {GENRE_CAROUSELS.map(c => (
              <button
                key={c.id}
                onClick={() => scrollToSection(c.id)}
                className="shrink-0 px-3 h-7 rounded-full text-xs font-medium bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors whitespace-nowrap"
              >
                {language === 'es' ? c.titleEs : c.titleEn}
              </button>
            ))}
          </div>
        </div>
        <FilterBar
          mediaType={filtersState.mediaType}
          onMediaTypeChange={setMediaType}
          spanishFilter={filtersState.spanishFilter}
          onSpanishFilterChange={setSpanishFilter}
          sortBy={filtersState.sortBy}
          onSortChange={setSortBy}
          activePlatforms={selectedPlatforms}
          onPlatformClick={(id) => setFocusPlatformId(prev => prev === id ? null : id)}
          focusPlatformId={focusPlatformId}
        />
      </div>

    <div className="container mx-auto px-4 py-6">
      {/* ── Hero estreno de la semana ── */}
      <HeroRelease items={heroItems} loading={heroLoading} />

      {/* ── Carruseles editoriales ── */}
      {EDITORIAL_CAROUSELS.map(config => (
        <EditorialSection
          key={config.id}
          config={config}
          overridePlatformIds={effectivePlatformIds}
          onShowMore={() => handleShowMore(config)}
        />
      ))}

      {/* ── Divisor ── */}
      <div className="flex items-center gap-3 my-8">
        <div className="flex-1 border-t border-white/10" />
        <span className="text-xs text-muted-foreground uppercase tracking-widest">
          {language === 'es' ? 'Por categoría' : 'By category'}
        </span>
        <div className="flex-1 border-t border-white/10" />
      </div>

      {/* ── Carruseles de género ── */}
      {GENRE_CAROUSELS.map((config, index) => (
        <React.Fragment key={config.id}>
          {index === 2 && (
            <MustWatchBlock mediaType={filtersState.mediaType} platformIds={effectivePlatformIds} />
          )}
          <div id={config.id}>
            <EditorialSection
              config={config}
              overridePlatformIds={effectivePlatformIds}
              onShowMore={() => handleShowMore(config)}
            />
          </div>
        </React.Fragment>
      ))}
    </div>
    </>
  );
};

export default Explore;
