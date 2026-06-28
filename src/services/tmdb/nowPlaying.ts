import { Media } from '@/types/media';
import { convertToMedia } from './utils';
import { buildApiUrl } from './config';
import { cachedFetch } from './apiCache';

const sevenDaysAgo = (): string => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().split('T')[0];
};

export const fetchTrendingMoviesWeek = async (): Promise<Media[]> => {
  try {
    const url = buildApiUrl('/trending/movie/week', { language: 'es-ES' });
    const response = await cachedFetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    const items = await Promise.all(
      (data.results || []).map((item: any) => convertToMedia(item, 'movie'))
    );
    return items.filter((m): m is Media => m !== null);
  } catch {
    return [];
  }
};

export const fetchTvOnTheAir = async (): Promise<Media[]> => {
  try {
    const url = buildApiUrl('/tv/on_the_air', {
      language: 'es-ES',
      'first_air_date.gte': sevenDaysAgo(),
      sort_by: 'popularity.desc',
      page: 1,
    });
    const response = await cachedFetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    const items = await Promise.all(
      (data.results || []).map((item: any) => convertToMedia(item, 'tv'))
    );
    return items.filter((m): m is Media => m !== null);
  } catch {
    return [];
  }
};
