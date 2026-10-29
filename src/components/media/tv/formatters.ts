import { differenceInCalendarDays, format } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { SeriesTranslations } from '@/utils/translations/series';

export const formatAirDate = (date: string, language: 'es' | 'en') =>
  format(new Date(date), language === 'es' ? "d MMM yyyy" : 'MMM d, yyyy', { locale: language === 'es' ? es : enUS });

export const isAired = (airDate: string | null) => !!airDate && airDate <= new Date().toISOString().slice(0, 10);

export const relativeDays = (date: string, t: SeriesTranslations) => {
  const days = differenceInCalendarDays(new Date(date), new Date());
  if (days <= 0) return t.today;
  if (days === 1) return t.tomorrow;
  return t.inDays(days);
};

export const ratingColor = (rating: number) =>
  rating >= 8.5 ? 'bg-emerald-400' : rating >= 7.5 ? 'bg-lime-400' : rating >= 6.5 ? 'bg-yellow-400' : 'bg-orange-400';

// Con uno o dos votos la nota no es representativa (p. ej. un 10 con 1 voto)
const MIN_VOTES = 3;
export const hasRating = (episode: { voteCount: number }) => episode.voteCount >= MIN_VOTES;
