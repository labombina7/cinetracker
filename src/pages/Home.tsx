import React, { useMemo } from 'react';
import { useApiKey } from '@/hooks/useApiKey';
import { useLanguage } from '@/hooks/useLanguage';
import { useHomeMediaFetch } from '@/hooks/useHomeMediaFetch';
import { useMediaFilters } from '@/contexts/MediaFiltersContext';
import { useProvidersData } from '@/hooks/useProvidersData';
import { getBackdropUrl } from '@/services/tmdb/index';
import ApiKeySetup from '@/components/ApiKeySetup';
import SearchBar from '@/components/SearchBar';
import MediaFilters from '@/components/home/MediaFilters';
import PlatformFilters from '@/components/home/PlatformFilters';
import HomeLoadingSkeleton from '@/components/home/HomeLoadingSkeleton';
import HomeErrorState from '@/components/home/HomeErrorState';
import HomeEmptyState from '@/components/home/HomeEmptyState';
import HomeContent from '@/components/home/HomeContent';
import MediaLoadingSkeleton from '@/components/home/MediaLoadingSkeleton';

const Home = () => {
  const { isConfigured, configureApiKey, isLoading } = useApiKey();
  const { language } = useLanguage();
  const { mediaList, loading, error, hasMore, loadingRef } = useHomeMediaFetch();
  const {
    filtersState,
    setSpanishFilter,
    setMediaType,
    setSortBy,
    setSelectedGenreId,
    setSelectedPlatformIds,
  } = useMediaFilters();
  const { platforms, loading: platformsLoading } = useProvidersData();

  const featuredBackdrop = useMemo(() => {
    if (mediaList.length === 0) return null;
    const pool = mediaList.slice(0, 10).filter(m => m.backdropPath);
    if (pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)].backdropPath;
  }, [mediaList]);

  const handlePlatformChange = (platformId: number) => {
    const current = filtersState.selectedPlatformIds;
    const updated = current.includes(platformId)
      ? current.filter(id => id !== platformId)
      : [...current, platformId];
    setSelectedPlatformIds(updated);
  };

  const getEmptyReason = (): 'no-platforms' | 'filtered' | 'no-content' => {
    if (filtersState.selectedPlatformIds.length === 0) return 'no-platforms';
    if (
      filtersState.selectedGenreId !== null ||
      filtersState.spanishFilter !== 'off' ||
      filtersState.mediaType !== 'all' ||
      filtersState.sortBy !== 'none'
    ) return 'filtered';
    return 'no-content';
  };

  if (isLoading) {
    return <HomeLoadingSkeleton />;
  }

  if (!isConfigured) {
    return <ApiKeySetup onApiKeySet={configureApiKey} />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {featuredBackdrop && (
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-top transition-all duration-700"
            style={{ backgroundImage: `url(${getBackdropUrl(featuredBackdrop)})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-background/80 to-background" />
        </div>
      )}
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        {language === 'es' ? 'Descubre' : 'Discover'}
      </h1>

      <SearchBar />

      <MediaFilters
        spanishFilter={filtersState.spanishFilter}
        setSpanishFilter={setSpanishFilter}
        mediaType={filtersState.mediaType}
        setMediaType={setMediaType}
        sortBy={filtersState.sortBy}
        setSortBy={setSortBy}
        selectedGenreId={filtersState.selectedGenreId}
        setSelectedGenreId={setSelectedGenreId}
        selectedPlatforms={filtersState.selectedPlatformIds}
        setSelectedPlatforms={() => {}}
        onPlatformChange={handlePlatformChange}
      />

      <div className="mb-4">
        <PlatformFilters
          platforms={platforms}
          loading={platformsLoading}
          selectedPlatformIds={filtersState.selectedPlatformIds}
          onPlatformChange={handlePlatformChange}
        />
      </div>

      {loading && mediaList.length === 0 ? (
        <MediaLoadingSkeleton />
      ) : error ? (
        <HomeErrorState error={error} />
      ) : mediaList.length === 0 ? (
        <HomeEmptyState reason={getEmptyReason()} />
      ) : (
        <HomeContent
          mediaList={mediaList}
          dataSource={filtersState.dataSource}
          loadingRef={loadingRef}
          hasMore={hasMore}
        />
      )}
    </div>
  );
};

export default Home;
