
import React from 'react';
import { useApiKey } from '@/hooks/useApiKey';
import { useLanguage } from '@/hooks/useLanguage';
import { useHomeMediaFetch } from '@/hooks/useHomeMediaFetch';
import { useMediaFilters } from '@/contexts/MediaFiltersContext';
import ApiKeySetup from '@/components/ApiKeySetup';
import SearchBar from '@/components/SearchBar';
import MediaFilters from '@/components/home/MediaFilters';
import HomeLoadingSkeleton from '@/components/home/HomeLoadingSkeleton';
import HomeErrorState from '@/components/home/HomeErrorState';
import HomeEmptyState from '@/components/home/HomeEmptyState';
import HomeContent from '@/components/home/HomeContent';
import MediaLoadingSkeleton from '@/components/home/MediaLoadingSkeleton';

const Home = () => {
  const { isConfigured, configureApiKey, isLoading } = useApiKey();
  const { language } = useLanguage();
  const { mediaList, loading, error, hasMore, loadingRef } = useHomeMediaFetch();
  const { filtersState, setSpanishFilter, setMediaType, setDataSource, setSortBy, setSelectedGenreId } = useMediaFilters();

  const handlePlatformChange = (platformId: number) => {
    console.log("Platform selection should be done from Settings page");
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
        selectedPlatforms={[]}
        setSelectedPlatforms={() => {}}
        onPlatformChange={handlePlatformChange}
      />

      {loading && mediaList.length === 0 ? (
        <MediaLoadingSkeleton />
      ) : error ? (
        <HomeErrorState error={error} />
      ) : mediaList.length === 0 ? (
        <HomeEmptyState />
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
