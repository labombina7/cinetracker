import React from 'react';
import { useApiKey } from '@/hooks/useApiKey';
import { useLanguage } from '@/hooks/useLanguage';
import { useHomeMediaFetch } from '@/hooks/useHomeMediaFetch';
import { useMediaFilters } from '@/contexts/MediaFiltersContext';
import { useProvidersData } from '@/hooks/useProvidersData';
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
    setDataSource,
    setSortBy,
    setSelectedGenreId,
    setSelectedPlatformIds,
  } = useMediaFilters();
  const { platforms, loading: platformsLoading } = useProvidersData();

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
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        {language === 'es' ? 'Descubre' : 'Discover'}
      </h1>

      <SearchBar />

      <MediaFilters
        spanishFilter={filtersState.spanishFilter}
        setSpanishFilter={setSpanishFilter}
        mediaType={filtersState.mediaType}
        setMediaType={setMediaType}
        dataSource={filtersState.dataSource}
        setDataSource={setDataSource}
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
