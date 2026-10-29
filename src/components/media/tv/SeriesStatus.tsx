import React from 'react';
import { CalendarClock } from 'lucide-react';
import { SeriesInfo } from '@/types/media';
import { TMDB_CONFIG } from '@/config/tmdb.config';
import { SeriesTranslations } from '@/utils/translations/series';
import { formatAirDate, relativeDays } from './formatters';

interface SeriesStatusProps {
  series: SeriesInfo;
  t: SeriesTranslations;
  language: 'es' | 'en';
}

const STATUS_STYLE: Record<string, string> = {
  returning: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  inProduction: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  planned: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  ended: 'bg-white/10 text-white/80 border-white/20',
  canceled: 'bg-red-500/20 text-red-300 border-red-500/30'
};

const SeriesStatus: React.FC<SeriesStatusProps> = ({ series, t, language }) => {
  const { status, nextEpisode, lastEpisode, networks } = series;
  const episode = nextEpisode ?? lastEpisode;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6 text-sm">
      {status && (
        <span className={`px-2.5 py-0.5 rounded-full border text-xs font-medium ${STATUS_STYLE[status]}`}>
          {t.status[status]}
        </span>
      )}

      {episode && (
        <span className="flex items-center gap-1.5 text-white/80">
          <CalendarClock className="h-4 w-4 text-gray-500" />
          <span>
            {nextEpisode ? t.nextEpisode : t.lastEpisode}: {t.episodeLabel(episode.seasonNumber, episode.episodeNumber)}
            {episode.airDate && (
              <>
                {' · '}
                {formatAirDate(episode.airDate, language)}
                {nextEpisode && <strong className="text-yellow-400"> ({relativeDays(episode.airDate, t)})</strong>}
              </>
            )}
          </span>
        </span>
      )}

      {networks.length > 0 && (
        <span className="flex items-center gap-2">
          {networks.map((n) =>
            n.logoPath ? (
              <span key={n.id} className="bg-white rounded px-1.5 py-0.5" title={n.name}>
                <img src={`${TMDB_CONFIG.IMAGE_BASE_URL}/w92${n.logoPath}`} alt={n.name} className="h-4 w-auto object-contain" />
              </span>
            ) : (
              <span key={n.id} className="text-white/70">{n.name}</span>
            )
          )}
        </span>
      )}
    </div>
  );
};

export default SeriesStatus;
