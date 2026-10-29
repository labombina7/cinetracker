import React from 'react';
import { Link } from 'react-router-dom';
import { Star, User } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { Episode } from '@/types/media';
import { TMDB_CONFIG } from '@/config/tmdb.config';
import { SeriesTranslations } from '@/utils/translations/series';
import { formatAirDate, hasRating } from './formatters';

interface EpisodeSheetProps {
  episode: Episode | null;
  onClose: () => void;
  t: SeriesTranslations;
  language: 'es' | 'en';
}

const PeopleLine: React.FC<{ label: string; people: { id: number; name: string }[] }> = ({ label, people }) =>
  people.length === 0 ? null : (
    <p className="text-sm">
      <span className="text-muted-foreground">{label}: </span>
      {people.map((p, i) => (
        <React.Fragment key={p.id}>
          {i > 0 && ', '}
          <Link to={`/actor/${p.id}`} className="font-medium hover:underline">{p.name}</Link>
        </React.Fragment>
      ))}
    </p>
  );

const EpisodeSheet: React.FC<EpisodeSheetProps> = ({ episode, onClose, t, language }) => (
  <Sheet open={episode !== null} onOpenChange={(open) => !open && onClose()}>
    <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
      {episode && (
        <>
          <div className="aspect-video bg-muted">
            {episode.stillPath && (
              <img
                src={`${TMDB_CONFIG.IMAGE_BASE_URL}/w780${episode.stillPath}`}
                alt=""
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="p-5 flex flex-col gap-4">
            <div>
              <p className="text-xs font-medium text-yellow-400">{t.episodeLabel(episode.seasonNumber, episode.episodeNumber)}</p>
              <SheetTitle className="text-xl">{episode.name}</SheetTitle>
              <p className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                {episode.airDate && <span>{formatAirDate(episode.airDate, language)}</span>}
                {episode.runtime && <span>· {episode.runtime} {t.minutes}</span>}
                {hasRating(episode) && (
                  <span className="flex items-center gap-0.5 text-yellow-400">
                    · <Star className="h-3 w-3 fill-yellow-400" /> {episode.voteAverage.toFixed(1)}
                  </span>
                )}
              </p>
            </div>

            <SheetDescription className="text-sm leading-relaxed text-gray-300">
              {episode.overview || t.noOverview}
            </SheetDescription>

            <div className="flex flex-col gap-1">
              <PeopleLine label={t.directedBy} people={episode.directors} />
              <PeopleLine label={t.writtenBy} people={episode.writers} />
            </div>

            {episode.guestStars.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-2">{t.guestStars}</h3>
                <ul className="flex flex-col gap-2">
                  {episode.guestStars.map((g) => (
                    <li key={`${g.id}-${g.character}`}>
                      <Link to={`/actor/${g.id}`} className="flex items-center gap-3 group">
                        <span className="w-10 h-10 rounded-full overflow-hidden bg-muted shrink-0 flex items-center justify-center">
                          {g.profilePath ? (
                            <img src={`${TMDB_CONFIG.IMAGE_BASE_URL}/w92${g.profilePath}`} alt="" className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-medium truncate group-hover:underline">{g.name}</span>
                          <span className="block text-xs text-muted-foreground truncate">{g.character}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </SheetContent>
  </Sheet>
);

export default EpisodeSheet;
