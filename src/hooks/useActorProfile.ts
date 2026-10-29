import { useEffect, useMemo, useState } from 'react';
import { ActorDetails, CreditKind, FilmographyEntry } from '@/types/media';
import { fetchPersonProfile, pickKnownFor, KNOWN_FOR_DEPARTMENT_KIND } from '@/services/tmdb/index';

type Status = 'loading' | 'ready' | 'notFound' | 'error';

export const useActorProfile = (actorId: number, language: string) => {
  const [actor, setActor] = useState<ActorDetails | null>(null);
  const [filmography, setFilmography] = useState<FilmographyEntry[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    fetchPersonProfile(actorId, language)
      .then((profile) => {
        if (cancelled) return;
        if (!profile) {
          setStatus('notFound');
          return;
        }
        setActor(profile.details);
        setFilmography(profile.filmography);
        setStatus('ready');
      })
      .catch((error) => {
        console.error('Error loading actor profile:', error);
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [actorId, language, attempt]);

  const primaryKind: CreditKind = KNOWN_FOR_DEPARTMENT_KIND[actor?.knownForDepartment ?? ''] ?? 'acting';
  const knownFor = useMemo(() => pickKnownFor(filmography, primaryKind), [filmography, primaryKind]);

  return { actor, filmography, knownFor, primaryKind, status, retry: () => setAttempt((n) => n + 1) };
};
