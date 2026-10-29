import React from 'react';
import { Episode } from '@/types/media';
import { SeriesTranslations } from '@/utils/translations/series';
import { hasRating, ratingColor } from './formatters';

interface EpisodeRatingsChartProps {
  episodes: Episode[];
  t: SeriesTranslations;
  onSelect: (episode: Episode) => void;
}

const MIN_RATING_SHOWN = 5; // las barras arrancan en 5 para que las diferencias se vean
const MAX_LABELED = 30; // con más episodios los números no caben

const EpisodeRatingsChart: React.FC<EpisodeRatingsChartProps> = ({ episodes, t, onSelect }) => {
  const rated = episodes.filter(hasRating);
  if (rated.length < 2) return null;

  return (
    <div className="mb-6">
      <p className="text-xs text-muted-foreground mb-2">{t.ratingsByEpisode}</p>
      <div className="flex items-end gap-1 h-20">
        {episodes.map((e) => {
          const height = hasRating(e) ? Math.max(8, ((e.voteAverage - MIN_RATING_SHOWN) / (10 - MIN_RATING_SHOWN)) * 100) : 0;
          return (
            <button
              key={e.id}
              type="button"
              disabled={!hasRating(e)}
              onClick={() => onSelect(e)}
              title={`${e.episodeNumber}. ${e.name}${hasRating(e) ? ` · ${e.voteAverage.toFixed(1)}` : ''}`}
              aria-label={`${e.episodeNumber}. ${e.name}${hasRating(e) ? `: ${e.voteAverage.toFixed(1)}` : ''}`}
              className="flex-1 max-w-8 h-full flex items-end group disabled:cursor-default"
            >
              <span
                className={`w-full rounded-t ${hasRating(e) ? ratingColor(e.voteAverage) : ''} opacity-80 group-hover:opacity-100 transition-opacity`}
                style={{ height: `${height}%` }}
              />
            </button>
          );
        })}
      </div>
      {episodes.length <= MAX_LABELED && (
      <div className="flex gap-1 mt-1">
        {episodes.map((e) => (
          <span key={e.id} className="flex-1 max-w-8 text-center text-[10px] text-muted-foreground">
            {e.episodeNumber}
          </span>
        ))}
      </div>
      )}
    </div>
  );
};

export default EpisodeRatingsChart;
