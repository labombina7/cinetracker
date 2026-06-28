import React from 'react';
import { Film, Tv, Layers, Globe, ListFilter, ArrowDown, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getProviderLogoUrl } from '@/services/tmdb/index';
import { useLanguage } from '@/hooks/useLanguage';
import { SpanishFilter } from '@/hooks/mediaFetch/types';

export interface Platform {
  id: number;
  name: string;
  logoPath: string | null;
}

interface FilterBarProps {
  mediaType: 'all' | 'movie' | 'tv';
  onMediaTypeChange: (v: 'all' | 'movie' | 'tv') => void;
  spanishFilter: SpanishFilter;
  onSpanishFilterChange: (v: SpanishFilter) => void;
  sortBy: 'none' | 'rating' | 'date';
  onSortChange: (v: 'none' | 'rating' | 'date') => void;
  activePlatforms: Platform[];
  onPlatformClick: (id: number) => void;
  focusPlatformId?: number | null;
  showSortBy?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({
  mediaType,
  onMediaTypeChange,
  spanishFilter,
  onSpanishFilterChange,
  sortBy,
  onSortChange,
  activePlatforms,
  onPlatformClick,
  focusPlatformId,
  showSortBy = true,
}) => {
  const { language } = useLanguage();

  const spanishLabels: Record<SpanishFilter, string> = language === 'es'
    ? { off: 'Todo', hispano: 'Hispano', spain: 'España' }
    : { off: 'All', hispano: 'Hispanic', spain: 'Spain' };

  const sortLabels = language === 'es'
    ? { none: 'Popularidad', rating: 'Valoración', date: 'Fecha' }
    : { none: 'Popularity', rating: 'Rating', date: 'Date' };

  const sortIcon = sortBy === 'date'
    ? <Calendar size={13} />
    : sortBy === 'rating'
    ? <ArrowDown size={13} />
    : <ListFilter size={13} />;

  return (
    <div className="bg-background/95 backdrop-blur-sm border-b border-white/10 py-2">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row sm:flex-nowrap sm:items-center gap-y-2 sm:gap-y-0 gap-x-1.5">

      {/* Categories: type + idioma + sort */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {([
          { value: 'all' as const,   labelEs: 'Todo',      labelEn: 'All',    Icon: Layers },
          { value: 'movie' as const, labelEs: 'Películas', labelEn: 'Movies', Icon: Film },
          { value: 'tv' as const,    labelEs: 'Series',    labelEn: 'TV',     Icon: Tv },
        ] as const).map(({ value, labelEs, labelEn, Icon }) => (
          <Button
            key={value}
            size="sm"
            variant={mediaType === value ? 'default' : 'ghost'}
            onClick={() => onMediaTypeChange(value)}
            className="h-7 gap-1 text-xs px-2"
          >
            <Icon className="h-3 w-3" />
            {language === 'es' ? labelEs : labelEn}
          </Button>
        ))}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={`flex items-center gap-1 h-7 px-2 rounded-md text-xs transition-colors ${
              spanishFilter !== 'off' ? 'text-yellow-400' : 'text-muted-foreground hover:text-foreground'
            }`}>
              <Globe size={13} />
              {spanishFilter !== 'off'
                ? spanishLabels[spanishFilter]
                : (language === 'es' ? 'Idioma' : 'Language')}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {(Object.entries(spanishLabels) as [SpanishFilter, string][]).map(([key, label]) => (
              <DropdownMenuItem key={key} onSelect={() => onSpanishFilterChange(key)}
                className={spanishFilter === key ? 'font-semibold' : ''}>
                {label} {spanishFilter === key && '✓'}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {showSortBy && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`flex items-center gap-1 h-7 px-2 rounded-md text-xs transition-colors ${
                sortBy !== 'none' ? 'text-yellow-400' : 'text-muted-foreground hover:text-foreground'
              }`}>
                {sortIcon}
                {sortBy !== 'none'
                  ? sortLabels[sortBy]
                  : (language === 'es' ? 'Ordenar' : 'Sort')}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {(Object.entries(sortLabels) as [('none' | 'rating' | 'date'), string][]).map(([key, label]) => (
                <DropdownMenuItem key={key} onSelect={() => onSortChange(key)}
                  className={sortBy === key ? 'font-semibold' : ''}>
                  {label} {sortBy === key && '✓'}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Spacer desktop */}
      <div className="hidden sm:block flex-1" />

      {/* Platform chips */}
      {activePlatforms.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pt-1 sm:pt-0 border-t border-white/5 sm:border-0">
          {activePlatforms.map(p => {
            const isFocused = focusPlatformId === p.id;
            const hasFocus = focusPlatformId !== null;
            return (
              <button
                key={p.id}
                onClick={() => onPlatformClick(p.id)}
                title={p.name}
                className={`shrink-0 h-7 w-7 rounded-lg overflow-hidden transition-all ring-2 ${
                  isFocused
                    ? 'ring-white scale-110'
                    : hasFocus
                    ? 'ring-transparent opacity-35'
                    : 'ring-transparent opacity-80 hover:opacity-100 hover:ring-white/30'
                }`}
              >
                {p.logoPath
                  ? <img src={getProviderLogoUrl(p.logoPath)} alt={p.name} className="w-full h-full object-cover" />
                  : <span className="text-xs font-bold">{p.name[0]}</span>
                }
              </button>
            );
          })}
        </div>
      )}
      </div>
    </div>
  );
};

export default FilterBar;
