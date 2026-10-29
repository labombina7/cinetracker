import React, { useEffect, useRef } from 'react';
import { SeasonSummary } from '@/types/media';
import { TMDB_CONFIG } from '@/config/tmdb.config';
import { SeriesTranslations } from '@/utils/translations/series';

interface SeasonSelectorProps {
  seasons: SeasonSummary[];
  selected: number | null;
  onSelect: (seasonNumber: number) => void;
  t: SeriesTranslations;
}

const SeasonSelector: React.FC<SeasonSelectorProps> = ({ seasons, selected, onSelect, t }) => {
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [selected]);

  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2" role="tablist" aria-label={t.seasons}>
      {seasons.map((season) => {
        const active = season.seasonNumber === selected;
        return (
          <button
            key={season.seasonNumber}
            ref={active ? activeRef : undefined}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(season.seasonNumber)}
            className={`shrink-0 w-24 text-left rounded-md p-1 transition-colors ${
              active ? 'bg-yellow-400/15 ring-2 ring-yellow-400' : 'hover:bg-white/5'
            }`}
          >
            <div className="overflow-hidden rounded bg-muted aspect-[2/3]">
              {season.posterPath && (
                <img
                  src={`${TMDB_CONFIG.IMAGE_BASE_URL}/w185${season.posterPath}`}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              )}
            </div>
            <p className="mt-1 text-xs font-medium truncate">{season.seasonNumber === 0 ? t.specials : season.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {season.airDate?.slice(0, 4) ?? t.noDate} · {season.episodeCount} {t.episodes}
            </p>
          </button>
        );
      })}
    </div>
  );
};

export default SeasonSelector;
