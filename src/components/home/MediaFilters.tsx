
import React, { useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Film, Tv, Layers, ArrowDown, Calendar, Globe, ListFilter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { Platform } from '@/types/media';
import { SpanishFilter } from '@/hooks/mediaFetch/types';
import { useGenres } from '@/hooks/useGenres';
import GenreChips from './GenreChips';

interface MediaFiltersProps {
  spanishFilter: SpanishFilter;
  setSpanishFilter: (value: SpanishFilter) => void;
  mediaType: 'all' | 'movie' | 'tv';
  setMediaType: (type: 'all' | 'movie' | 'tv') => void;
  sortBy: 'none' | 'rating' | 'date';
  setSortBy: (sort: 'none' | 'rating' | 'date') => void;
  selectedGenreId: number | null;
  setSelectedGenreId: (genreId: number | null) => void;
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
  sortBy,
  setSortBy,
  selectedGenreId,
  setSelectedGenreId,
  selectedPlatforms,
  onPlatformChange
}) => {
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  const { genres, loading: genresLoading } = useGenres(mediaType);

  // Reset genre when the new genre list doesn't include the current selection
  useEffect(() => {
    if (!genresLoading && selectedGenreId !== null) {
      const stillAvailable = genres.some(g => g.id === selectedGenreId);
      if (!stillAvailable) setSelectedGenreId(null);
    }
  }, [genres, genresLoading, selectedGenreId, setSelectedGenreId]);

  const translations = {
    es: {
      spanishOptions: {
        'off': 'Todo',
        'hispano': 'Hispano',
        'spain': 'España'
      },
      sortByOptions: {
        'none': 'Sin ordenar',
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
      spanishOptions: {
        'off': 'All',
        'hispano': 'Hispanic',
        'spain': 'Spain'
      },
      sortByOptions: {
        'none': 'Default',
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

  const sortIcons = {
    'none': <ListFilter size={16} />,
    'rating': <ArrowDown size={16} />,
    'date': <Calendar size={16} />
  };

  const isLangActive = spanishFilter !== 'off';
  const isSortActive = sortBy !== 'none';

  return (
    <div className="space-y-3 mb-6 rounded-xl px-3 py-2 bg-white/5 backdrop-blur-md border border-white/10">
      <div className="flex flex-wrap items-center gap-3">

        {/* Language icon button + dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-colors ${
                isLangActive
                  ? 'text-yellow-400'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title={language === 'es' ? 'Idioma' : 'Language'}
              aria-label={language === 'es' ? 'Filtro de idioma' : 'Language filter'}
            >
              <Globe size={16} />
              {isLangActive && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-yellow-400" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[140px]">
            {(Object.entries(t.spanishOptions) as [SpanishFilter, string][]).map(([key, label]) => (
              <DropdownMenuItem
                key={key}
                onSelect={() => setSpanishFilter(key)}
                className={`flex items-center gap-2 cursor-pointer ${spanishFilter === key ? 'font-semibold' : ''}`}
              >
                <Globe size={14} className={spanishFilter === key ? 'text-primary' : 'text-muted-foreground'} />
                <span>{label}</span>
                {spanishFilter === key && <span className="ml-auto text-primary">✓</span>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort icon button + dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-colors ${
                isSortActive
                  ? 'text-yellow-400'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title={language === 'es' ? 'Ordenar' : 'Sort'}
              aria-label={language === 'es' ? 'Ordenar resultados' : 'Sort results'}
            >
              <ListFilter size={16} />
              {isSortActive && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-yellow-400" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[150px]">
            {(Object.entries(t.sortByOptions) as [('none' | 'rating' | 'date'), string][]).map(([key, label]) => (
              <DropdownMenuItem
                key={key}
                onSelect={() => setSortBy(key)}
                className={`flex items-center gap-2 cursor-pointer ${sortBy === key ? 'font-semibold' : ''}`}
              >
                {React.cloneElement(sortIcons[key], {
                  size: 14,
                  className: sortBy === key ? 'text-primary' : 'text-muted-foreground'
                })}
                <span>{label}</span>
                {sortBy === key && <span className="ml-auto text-primary">✓</span>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Media type buttons */}
        <div className={`flex items-center gap-1 ${isMobile ? 'w-full justify-start mt-2' : 'ml-auto'}`}>
          {([
            { value: 'all' as const, icon: <Layers size={18} />, label: t.mediaTypeOptions.all },
            { value: 'movie' as const, icon: <Film size={18} />, label: t.mediaTypeOptions.movie },
            { value: 'tv' as const, icon: <Tv size={18} />, label: t.mediaTypeOptions.tv },
          ] as const).map(({ value, icon, label }) => (
            <button
              key={value}
              className={`relative flex items-center justify-center h-9 w-9 rounded-md transition-colors ${
                mediaType === value
                  ? 'text-yellow-400'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setMediaType(value)}
              title={label}
              aria-label={label}
            >
              {icon}
              {mediaType === value && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-yellow-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Genre chips row */}
      <GenreChips
        genres={genres}
        selectedGenreId={selectedGenreId}
        onSelect={setSelectedGenreId}
        loading={genresLoading}
      />
    </div>
  );
};

export default MediaFilters;
