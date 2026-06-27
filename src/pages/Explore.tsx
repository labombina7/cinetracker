import React from 'react';
import { Link } from 'react-router-dom';
import { useApiKey } from '@/hooks/useApiKey';
import { useLanguage } from '@/hooks/useLanguage';
import { useMediaFilters } from '@/contexts/MediaFiltersContext';
import { useProvidersData } from '@/hooks/useProvidersData';
import ApiKeySetup from '@/components/ApiKeySetup';
import MediaFilters from '@/components/home/MediaFilters';
import PlatformFilters from '@/components/home/PlatformFilters';
import HomeLoadingSkeleton from '@/components/home/HomeLoadingSkeleton';
import PlatformSection from '@/components/explore/PlatformSection';

const Explore = () => {
  const { isConfigured, configureApiKey, isLoading } = useApiKey();
  const { language } = useLanguage();
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

  const selectedPlatforms = platforms.filter(p =>
    filtersState.selectedPlatformIds.includes(p.id)
  );

  if (isLoading) return <HomeLoadingSkeleton />;
  if (!isConfigured) return <ApiKeySetup onApiKeySet={configureApiKey} />;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        {language === 'es' ? 'Explorar' : 'Explore'}
      </h1>

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

      <div className="mb-6">
        <PlatformFilters
          platforms={platforms}
          loading={platformsLoading}
          selectedPlatformIds={filtersState.selectedPlatformIds}
          onPlatformChange={handlePlatformChange}
        />
      </div>

      {selectedPlatforms.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <p className="text-muted-foreground">
            {language === 'es'
              ? 'Selecciona al menos una plataforma arriba para ver su contenido.'
              : 'Select at least one platform above to browse its content.'}
          </p>
          <Link to="/settings" className="text-primary underline text-sm">
            {language === 'es' ? 'Gestionar plataformas en Configuración' : 'Manage platforms in Settings'}
          </Link>
        </div>
      ) : (
        <div className="mt-4">
          {selectedPlatforms.map(platform => (
            <PlatformSection key={platform.id} platform={platform} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
