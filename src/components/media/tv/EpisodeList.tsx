import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Episode } from '@/types/media';
import { TMDB_CONFIG } from '@/config/tmdb.config';
import { SeriesTranslations } from '@/utils/translations/series';
import { formatAirDate, hasRating, isAired } from './formatters';

interface EpisodeListProps {
  episodes: Episode[];
  t: SeriesTranslations;
  language: 'es' | 'en';
  hideSpoilers: boolean;
  onSelect: (episode: Episode) => void;
}

const EpisodeList: React.FC<EpisodeListProps> = ({ episodes, t, language, hideSpoilers, onSelect }) => {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const reveal = (id: number) => setRevealed((prev) => new Set(prev).add(id));

  return (
    <ul className="flex flex-col divide-y divide-white/10">
      {episodes.map((episode) => {
        const aired = isAired(episode.airDate);
        const blurred = hideSpoilers && aired && !revealed.has(episode.id);
        const meta = [
          episode.airDate ? formatAirDate(episode.airDate, language) : t.noDate,
          episode.runtime ? `${episode.runtime} ${t.minutes}` : null
        ].filter(Boolean);

        return (
          <li
            key={episode.id}
            id={`episode-${episode.episodeNumber}`}
            className={`flex gap-3 py-3 rounded-md ${aired ? 'cursor-pointer hover:bg-white/5' : ''}`}
            onClick={aired ? () => onSelect(episode) : undefined}
          >
            <div className="relative w-28 sm:w-36 shrink-0 aspect-video rounded overflow-hidden bg-muted">
              {episode.stillPath && (
                <img
                  src={`${TMDB_CONFIG.IMAGE_BASE_URL}/w300${episode.stillPath}`}
                  alt=""
                  className={`w-full h-full object-cover transition-[filter] ${blurred ? 'blur-md scale-110' : ''}`}
                  loading="lazy"
                  decoding="async"
                />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2">
                {aired ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(episode);
                    }}
                    className="text-sm font-medium text-left hover:underline"
                  >
                    {episode.episodeNumber}. {episode.name}
                  </button>
                ) : (
                  <p className="text-sm font-medium">{episode.episodeNumber}. {episode.name}</p>
                )}
                {!aired && (
                  <span className="shrink-0 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-yellow-400/15 text-yellow-400">
                    {t.upcoming}
                  </span>
                )}
              </div>

              <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground mt-0.5">
                <span>{meta.join(' · ')}</span>
                {aired && hasRating(episode) && (
                  <span className="flex items-center gap-0.5 text-yellow-400">
                    <Star className="h-3 w-3 fill-yellow-400" />
                    {episode.voteAverage.toFixed(1)}
                  </span>
                )}
              </p>

              {aired && episode.overview && (
                blurred ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      reveal(episode.id);
                    }}
                    className="relative mt-1 block w-full text-left"
                    aria-label={t.tapToReveal}
                  >
                    <span className="block text-xs text-gray-300 line-clamp-2 blur-sm select-none" aria-hidden>
                      {episode.overview}
                    </span>
                    <span className="absolute inset-0 flex items-center text-xs font-medium text-white">{t.tapToReveal}</span>
                  </button>
                ) : (
                  <p className="mt-1 text-xs text-gray-300 line-clamp-2">{episode.overview}</p>
                )
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default EpisodeList;
