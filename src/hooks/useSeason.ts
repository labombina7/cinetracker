import { useEffect, useState } from 'react';
import { Episode } from '@/types/media';
import { fetchSeasonEpisodes } from '@/services/tmdb/index';

type Status = 'idle' | 'loading' | 'ready' | 'error';

export const useSeason = (tvId: number, seasonNumber: number | null, language: string) => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (seasonNumber === null) return;
    let cancelled = false;
    setStatus('loading');

    fetchSeasonEpisodes(tvId, seasonNumber, language)
      .then((result) => {
        if (cancelled) return;
        setEpisodes(result);
        setStatus('ready');
      })
      .catch((error) => {
        console.error('Error loading season:', error);
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [tvId, seasonNumber, language, attempt]);

  return { episodes, status, retry: () => setAttempt((n) => n + 1) };
};

const SPOILERS_KEY = 'hideSpoilers';

export const useHideSpoilers = () => {
  const [hideSpoilers, setHideSpoilers] = useState(() => {
    try {
      return localStorage.getItem(SPOILERS_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const update = (value: boolean) => {
    setHideSpoilers(value);
    try {
      localStorage.setItem(SPOILERS_KEY, String(value));
    } catch {
      // Sin localStorage la preferencia solo dura la sesión
    }
  };

  return [hideSpoilers, update] as const;
};
