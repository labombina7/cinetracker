
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import MediaList from '@/components/MediaList';
import { Media } from '@/types/media';
import { translations } from '@/utils/translations/searchResults';
import { AppLanguage } from '@/hooks/useLanguage';

interface SearchResultsContentProps {
  loading: boolean;
  error: string;
  results: Media[];
  query: string;
  language: AppLanguage;
}

const SearchResultsContent: React.FC<SearchResultsContentProps> = ({
  loading,
  error,
  results,
  query,
  language
}) => {
  const t = translations[language];
  
  console.log(`SearchResultsContent rendering with ${results.length} results, loading: ${loading}`);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
          <div key={item}>
            <Skeleton className="h-[350px] w-full mb-2" />
            <Skeleton className="h-5 w-full mb-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center my-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center my-12">
        <p className="text-gray-500">
          {query ? t.noResults : t.enterSearchTerm}
        </p>
      </div>
    );
  }

  return <MediaList mediaList={results} title={t.results} />;
};

export default SearchResultsContent;
