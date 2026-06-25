
import React, { useEffect } from 'react';
import MediaList from '@/components/MediaList';
import { Media } from '@/types/media';
import { useLanguage } from '@/hooks/useLanguage';
import { useDataSourceInfo } from '@/hooks/useDataSourceInfo';
import { useMediaFilters } from '@/contexts/MediaFiltersContext';

interface HomeContentProps {
  mediaList: Media[];
  dataSource: 'discover' | 'trending';
  loadingRef?: React.RefObject<HTMLDivElement>;
  hasMore?: boolean;
}

const HomeContent: React.FC<HomeContentProps> = ({ 
  mediaList, 
  dataSource, 
  loadingRef,
  hasMore = false
}) => {
  const { language } = useLanguage();
  const dataSourceInfo = useDataSourceInfo(dataSource);
  const { filtersState } = useMediaFilters();
  
  // Log important information about content but only once
  useEffect(() => {
    console.log(`HomeContent rendering ${mediaList.length} items with data source: ${dataSource}`);
    console.log(`Current platform IDs: ${filtersState.selectedPlatformIds.join(', ')}`);
    
    // Log sample items to help debugging
    if (mediaList.length > 0) {
      const sampleItems = mediaList.slice(0, 3).map(item => ({
        id: item.id,
        title: item.title,
        type: item.type,
        genres: item.genres?.length || 0,
        genreIds: item.genre_ids?.length || 0,
        platforms: item.platforms || []
      }));
      console.log('Sample items:', sampleItems);
    }
  }, [mediaList.length, dataSource, filtersState.selectedPlatformIds]);

  if (mediaList.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">
          {language === 'es' 
            ? 'No se encontraron resultados para los filtros aplicados.' 
            : 'No results found for the applied filters.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <MediaList 
        mediaList={mediaList} 
        title={
          <div className="flex items-center">
            {dataSourceInfo.icon}
            <span>
              {language === 'es' ? dataSourceInfo.title : dataSourceInfo.titleEn || dataSourceInfo.title}
            </span>
            <span className="ml-2 text-sm text-gray-500 flex items-center gap-1">
              {filtersState.mediaType !== 'all' && (
                <span className="bg-blue-500/90 text-white text-xs px-1 rounded">
                  {filtersState.mediaType === 'movie' ? 'Película' : 'Serie'}
                </span>
              )}
              {filtersState.sortBy && (
                <span className="bg-gray-500/90 text-white text-xs px-1 rounded ml-1">
                  {filtersState.sortBy === 'rating' ? 
                    (language === 'es' ? 'Valoración' : 'Rating') : 
                    (language === 'es' ? 'Fecha' : 'Date')}
                </span>
              )}
            </span>
          </div>
        } 
      />
      
      {/* Loading reference for infinite scroll */}
      {hasMore && mediaList.length > 0 && (
        <div 
          ref={loadingRef} 
          className="py-4 flex justify-center"
        >
          <div className="w-8 h-8 border-t-2 border-primary rounded-full animate-spin"></div>
        </div>
      )}
    </>
  );
};

export default HomeContent;
