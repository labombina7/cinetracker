import { useEffect, useState } from 'react';
import { ActorDetails, Media } from '@/types/media';
import { fetchActorDetails, fetchActorCredits } from '@/services/tmdb/index';

type Status = 'loading' | 'ready' | 'notFound' | 'error';

export const useActorProfile = (actorId: number, language: string) => {
  const [actor, setActor] = useState<ActorDetails | null>(null);
  const [credits, setCredits] = useState<Media[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    Promise.all([fetchActorDetails(actorId, language), fetchActorCredits(actorId, language)])
      .then(([details, knownFor]) => {
        if (cancelled) return;
        if (!details) {
          setStatus('notFound');
          return;
        }
        setActor(details);
        setCredits(knownFor);
        setStatus('ready');
      })
      .catch((error) => {
        console.error('Error loading actor profile:', error);
        // Un 404 en los créditos también significa que la persona no existe
        if (!cancelled) setStatus(String(error?.message).includes('404') ? 'notFound' : 'error');
      });

    return () => {
      cancelled = true;
    };
  }, [actorId, language, attempt]);

  return { actor, credits, status, retry: () => setAttempt((n) => n + 1) };
};
