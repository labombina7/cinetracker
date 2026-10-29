import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Episode, SeriesInfo } from '@/types/media';
import { useHideSpoilers, useSeason } from '@/hooks/useSeason';
import { SeriesTranslations } from '@/utils/translations/series';
import SeasonSelector from './SeasonSelector';
import EpisodeRatingsChart from './EpisodeRatingsChart';
import EpisodeList from './EpisodeList';
import EpisodeSheet from './EpisodeSheet';

interface SeasonsSectionProps {
  tvId: number;
  series: SeriesInfo;
  t: SeriesTranslations;
  language: 'es' | 'en';
}

// Temporada en emisión, o la última emitida si la serie ya no emite
const defaultSeason = (series: SeriesInfo): number | null => {
  const available = new Set(series.seasons.map((s) => s.seasonNumber));
  const candidate = series.nextEpisode?.seasonNumber ?? series.lastEpisode?.seasonNumber;
  if (candidate !== undefined && available.has(candidate)) return candidate;
  const regular = series.seasons.filter((s) => s.seasonNumber > 0);
  return (regular[regular.length - 1] ?? series.seasons[0])?.seasonNumber ?? null;
};

const SeasonsSection: React.FC<SeasonsSectionProps> = ({ tvId, series, t, language }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hideSpoilers, setHideSpoilers] = useHideSpoilers();
  const [openEpisode, setOpenEpisode] = useState<Episode | null>(null);

  const param = Number(searchParams.get('season'));
  const selected = searchParams.has('season') && series.seasons.some((s) => s.seasonNumber === param)
    ? param
    : defaultSeason(series);

  const { episodes, status, retry } = useSeason(tvId, selected, language);

  const selectSeason = (seasonNumber: number) =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('season', String(seasonNumber));
        return next;
      },
      { replace: true }
    );

  if (series.seasons.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-semibold">{t.seasons}</h2>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <Switch checked={hideSpoilers} onCheckedChange={setHideSpoilers} />
          {t.hideSpoilers}
        </label>
      </div>

      <SeasonSelector seasons={series.seasons} selected={selected} onSelect={selectSeason} t={t} />

      <div className="mt-4">
        {status === 'loading' && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-28 sm:w-36 aspect-video rounded shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {t.loadError}
            <Button size="sm" variant="outline" onClick={retry}>{t.retry}</Button>
          </div>
        )}

        {status === 'ready' && (
          <>
            <EpisodeRatingsChart episodes={episodes} t={t} onSelect={setOpenEpisode} />
            <EpisodeList
              key={selected}
              episodes={episodes}
              t={t}
              language={language}
              hideSpoilers={hideSpoilers}
              onSelect={setOpenEpisode}
            />
          </>
        )}
      </div>

      <EpisodeSheet episode={openEpisode} onClose={() => setOpenEpisode(null)} t={t} language={language} />
    </section>
  );
};

export default SeasonsSection;
