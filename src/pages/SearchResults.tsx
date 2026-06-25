
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';
import { useApiKey } from '@/hooks/useApiKey';
import { useLanguage } from '@/hooks/useLanguage';
import { useProvidersData } from '@/hooks/useProvidersData';
import { useSearch } from '@/hooks/useSearch';
import { translations } from '@/utils/translations/searchResults';
import MediaFilters from '@/components/home/MediaFilters';
import ApiKeySetup from '@/components/ApiKeySetup';
import SearchResultsContent from '@/components/search/SearchResultsContent';
import { Skeleton } from '@/components/ui/skeleton';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { isConfigured, configureApiKey, isLoading } = useApiKey();
  const { language } = useLanguage();
  const { selectedPlatforms } = useProvidersData();
  const [showSpanishOnly, setShowSpanishOnly] = React.useState(false);
  const t = translations[language];
  
  const selectedPlatformIds = selectedPlatforms.map(platform => platform.id);
  
  // Usar el hook useSearch para realizar la búsqueda
  const { results, loading, error, performSearch } = useSearch(
    query,
    language,
    selectedPlatformIds,
    showSpanishOnly
  );

  // Realizar búsqueda cuando cambian los parámetros relevantes
  useEffect(() => {
    if (!isConfigured) return;
    
    // Ejecutar búsqueda con un pequeño retraso para evitar condiciones de carrera
    const timeoutId = setTimeout(() => {
      console.log('Executing search from SearchResults component');
      performSearch();
    }, 50);
    
    return () => clearTimeout(timeoutId);
  }, [
    query,
    showSpanishOnly,
    JSON.stringify(selectedPlatformIds),
    isConfigured,
    language,
    performSearch
  ]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 flex justify-center items-center min-h-[80vh]">
        <div className="text-center">
          <Skeleton className="h-10 w-40 mb-4 mx-auto" />
          <Skeleton className="h-4 w-60 mx-auto" />
        </div>
      </div>
    );
  }

  if (!isConfigured) {
    return <ApiKeySetup onApiKeySet={configureApiKey} />;
  }

  console.log(`Search Results: ${results.length} items found for "${query}"`);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        {t.searchResults}
      </h1>
      
      <SearchBar />
      
      <MediaFilters 
        showSpanishOnly={showSpanishOnly}
        setShowSpanishOnly={setShowSpanishOnly}
        mediaType="all"
        setMediaType={() => {}} // No permitimos cambiar el tipo en búsqueda
        dataSource="discover"
        setDataSource={() => {}} // No permitimos cambiar la fuente en búsqueda
        selectedPlatforms={selectedPlatformIds}
        setSelectedPlatforms={() => {}} // No permitimos cambiar plataformas directamente
        onPlatformChange={() => {}} // Desactivado
        sortBy="rating"
        setSortBy={() => {}}
      />

      <SearchResultsContent 
        loading={loading}
        error={error}
        results={results}
        query={query}
        language={language}
      />
    </div>
  );
};

export default SearchResults;
