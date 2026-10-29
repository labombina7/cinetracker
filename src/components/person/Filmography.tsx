import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Tv } from 'lucide-react';
import { FilmographyEntry, Platform } from '@/types/media';
import { FilmographyGroup } from '@/hooks/usePersonFilmography';
import { TMDB_CONFIG } from '@/config/tmdb.config';
import { actorProfileTranslations } from '@/utils/translations/actorProfile';

type Translations = (typeof actorProfileTranslations)['es'];

interface FilmographyProps {
  groups: FilmographyGroup[];
  t: Translations;
  platformsFor: (entry: FilmographyEntry) => Platform[];
}

const today = new Date().toISOString().slice(0, 10);

const rolesLine = (entry: FilmographyEntry, t: Translations) =>
  entry.roles
    .map((r) => (r.kind === 'acting' ? r.label : t.jobs[r.label] ?? (r.label || t.roles[r.kind])))
    .filter((label, i, all) => label && all.indexOf(label) === i)
    .join(' · ');

const Filmography: React.FC<FilmographyProps> = ({ groups, t, platformsFor }) => (
  <div className="flex flex-col gap-6">
    {groups.map((group) => (
      <div key={group.year ?? 'no-date'} className="flex gap-4">
        <div className="w-14 shrink-0 text-sm font-bold text-yellow-400 pt-2">{group.year ?? '—'}</div>
        <ul className="flex-1 flex flex-col divide-y divide-white/10 border-l border-white/10 pl-4">
          {group.year === null && <li className="text-xs text-muted-foreground pb-2">{t.noDate}</li>}
          {group.entries.map((entry) => {
            const roles = rolesLine(entry, t);
            const upcoming = !entry.releaseDate || entry.releaseDate > today;
            const platforms = platformsFor(entry);
            return (
              <li key={`${entry.type}-${entry.id}`}>
                <Link
                  to={`/details/${entry.type}/${entry.id}`}
                  className="flex items-center gap-3 py-2 rounded-md hover:bg-white/5 transition-colors"
                >
                  <div className="w-10 shrink-0 aspect-[2/3] rounded overflow-hidden bg-muted">
                    {entry.posterPath && (
                      <img
                        src={`${TMDB_CONFIG.IMAGE_BASE_URL}/w92${entry.posterPath}`}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{entry.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {entry.type === 'movie' ? (
                        <Film className="inline h-3 w-3 mr-1 -mt-0.5" aria-label={t.movie} />
                      ) : (
                        <Tv className="inline h-3 w-3 mr-1 -mt-0.5" aria-label={t.tv} />
                      )}
                      {roles}
                      {entry.episodeCount ? ` (${entry.episodeCount} ${t.episodes})` : ''}
                    </p>
                  </div>
                  {platforms.length > 0 && (
                    <div className="flex gap-1 shrink-0">
                      {platforms.map((p) => (
                        <img
                          key={p.id}
                          src={`${TMDB_CONFIG.IMAGE_BASE_URL}/w45${p.logoPath}`}
                          alt={p.name}
                          title={p.name}
                          className="w-5 h-5 rounded-sm"
                        />
                      ))}
                    </div>
                  )}
                  {upcoming && (
                    <span className="shrink-0 text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-yellow-400/15 text-yellow-400">
                      {t.upcoming}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    ))}
  </div>
);

export default Filmography;
