
import React from 'react';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/hooks/useLanguage';
import { Film, Tv, Layers, TrendingUp, Compass, ArrowDown, Calendar, Globe } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import { Platform } from '@/types/media';
import { SpanishFilter } from '@/hooks/mediaFetch/types';

interface MediaFiltersProps {
  spanishFilter: SpanishFilter;
  setSpanishFilter: (value: SpanishFilter) => void;
  mediaType: 'all' | 'movie' | 'tv';
  setMediaType: (type: 'all' | 'movie' | 'tv') => void;
  dataSource: 'discover' | 'trending';
  setDataSource: (source: 'discover' | 'trending') => void;
  sortBy: 'rating' | 'date';
  setSortBy: (sort: 'rating' | 'date') => void;
  selectedPlatforms: number[];
  setSelectedPlatforms: (platforms: number[]) => void;
  platforms?: Platform[];
  onPlatformChange: (platformId: number) => void;
}

const MediaFilters: React.FC<MediaFiltersProps> = ({
  spanishFilter,
  setSpanishFilter,
  mediaType,
  setMediaType,
  dataSource,
  setDataSource,
  sortBy,
  setSortBy,
  selectedPlatforms,
  onPlatformChange
}) => {
  const { language } = useLanguage();
  const isMobile = useIsMobile();

  const translations = {
    es: {
      spanishFilter: 'Idioma:',
      dataSource: 'Fuente:',
      sortBy: 'Ordenar:',
      spanishOptions: {
        'off': 'Todo',
        'hispano': 'Hispano',
        'spain': 'España'
      },
      dataSourceOptions: {
        'trending': 'Tendencias',
        'discover': 'Descubrir'
      },
      sortByOptions: {
        'rating': 'Valoración',
        'date': 'Fecha'
      },
      mediaTypeOptions: {
        'all': 'Todos',
        'movie': 'Películas',
        'tv': 'Series'
      }
    },
    en: {
      spanishFilter: 'Language:',
      dataSource: 'Source:',
      sortBy: 'Sort:',
      spanishOptions: {
        'off': 'All',
        'hispano': 'Hispanic',
        'spain': 'Spain'
      },
      dataSourceOptions: {
        'trending': 'Trending',
        'discover': 'Discover'
      },
      sortByOptions: {
        'rating': 'Rating',
        'date': 'Release date'
      },
      mediaTypeOptions: {
        'all': 'All',
        'movie': 'Movies',
        'tv': 'TV Shows'
      }
    }
  };

  const t = translations[language === 'es' ? 'es' : 'en'];

  const dataSourceIcons = {
    'trending': <TrendingUp size={16} />,
    'discover': <Compass size={16} />
  };

  const sortIcons = {
    'rating': <ArrowDown size={16} />,
    'date': <Calendar size={16} />
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm whitespace-nowrap">{t.spanishFilter}</span>
          <Select
            value={spanishFilter}
            onValueChange={(value) => setSpanishFilter(value as SpanishFilter)}
          >
            <SelectTrigger className="w-[130px] h-9 bg-background">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <Globe size={16} />
                  <span>{t.spanishOptions[spanishFilter]}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(t.spanishOptions) as [SpanishFilter, string][]).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <Globe size={16} />
                    <span>{label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm whitespace-nowrap">{t.dataSource}</span>
          <Select
            value={dataSource}
            onValueChange={(value) => setDataSource(value as 'discover' | 'trending')}
          >
            <SelectTrigger className="w-[140px] h-9 bg-background">
              <SelectValue>
                <div className="flex items-center gap-2">
                  {dataSourceIcons[dataSource]}
                  <span>{t.dataSourceOptions[dataSource]}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(t.dataSourceOptions).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    {dataSourceIcons[key as keyof typeof dataSourceIcons]}
                    <span>{value}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm whitespace-nowrap">{t.sortBy}</span>
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as 'rating' | 'date')}
          >
            <SelectTrigger className="w-[140px] h-9 bg-background">
              <SelectValue>
                <div className="flex items-center gap-2">
                  {sortIcons[sortBy]}
                  <span>{t.sortByOptions[sortBy]}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(t.sortByOptions).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    {sortIcons[key as keyof typeof sortIcons]}
                    <span>{value}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className={`flex items-center gap-2 ${isMobile ? 'w-full justify-start mt-2' : 'ml-auto'}`}>
          <button
            className={`px-4 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              mediaType === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
            }`}
            onClick={() => setMediaType('all')}
          >
            <Layers size={16} />
            <span>{t.mediaTypeOptions.all}</span>
          </button>
          <button
            className={`px-4 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              mediaType === 'movie'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
            }`}
            onClick={() => setMediaType('movie')}
          >
            <Film size={16} />
            <span>{t.mediaTypeOptions.movie}</span>
          </button>
          <button
            className={`px-4 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
              mediaType === 'tv'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
            }`}
            onClick={() => setMediaType('tv')}
          >
            <Tv size={16} />
            <span>{t.mediaTypeOptions.tv}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaFilters;
