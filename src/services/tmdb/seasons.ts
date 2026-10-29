import { EpisodeSummary, Episode, SeasonSummary, SeriesInfo, SeriesStatus } from '../../types/media';
import { buildApiUrl } from './config';
import { cachedFetch } from './apiCache';

const STATUS: Record<string, SeriesStatus> = {
  'Returning Series': 'returning',
  Ended: 'ended',
  Canceled: 'canceled',
  'In Production': 'inProduction',
  Planned: 'planned'
};

// TMDB pone "Episodio N" / "Episode N" cuando el título no está traducido
const GENERIC_EPISODE_NAME = /^(episodio|episode|capítulo)\s+\d+$/i;

interface TMDBEpisodeSummary {
  season_number: number;
  episode_number: number;
  name: string;
  air_date: string | null;
}

interface TMDBPerson {
  id: number;
  name: string;
  job?: string;
  character?: string;
  profile_path?: string | null;
}

interface TMDBEpisode extends TMDBEpisodeSummary {
  id: number;
  overview: string;
  runtime: number | null;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
  crew?: TMDBPerson[];
  guest_stars?: TMDBPerson[];
}

const mapEpisodeSummary = (e: TMDBEpisodeSummary | null | undefined): EpisodeSummary | null =>
  e ? { seasonNumber: e.season_number, episodeNumber: e.episode_number, name: e.name, airDate: e.air_date || null } : null;

// Se aplica a la respuesta de /tv/:id (fetchMediaDetails)
export const mapSeriesInfo = (item: {
  status?: string;
  seasons?: { season_number: number; name: string; episode_count: number; air_date: string | null; poster_path: string | null }[];
  next_episode_to_air?: TMDBEpisodeSummary | null;
  last_episode_to_air?: TMDBEpisodeSummary | null;
  networks?: { id: number; name: string; logo_path: string | null }[];
}): SeriesInfo => {
  const seasons: SeasonSummary[] = (item.seasons ?? [])
    .filter((s) => s.episode_count > 0)
    .map((s) => ({
      seasonNumber: s.season_number,
      name: s.name,
      episodeCount: s.episode_count,
      airDate: s.air_date || null,
      posterPath: s.poster_path
    }));

  // Los especiales (temporada 0) van al final
  seasons.sort((a, b) => (a.seasonNumber === 0 ? 1 : b.seasonNumber === 0 ? -1 : a.seasonNumber - b.seasonNumber));

  return {
    status: STATUS[item.status ?? ''] ?? null,
    seasons,
    nextEpisode: mapEpisodeSummary(item.next_episode_to_air),
    lastEpisode: mapEpisodeSummary(item.last_episode_to_air),
    networks: (item.networks ?? []).map((n) => ({ id: n.id, name: n.name, logoPath: n.logo_path }))
  };
};

const fetchSeasonRaw = async (tvId: number, seasonNumber: number, language: string): Promise<TMDBEpisode[]> => {
  const response = await cachedFetch(buildApiUrl(`/tv/${tvId}/season/${seasonNumber}`, { language }));
  if (!response.ok) throw new Error(`Error fetching season ${seasonNumber} of ${tvId}: ${response.status}`);
  return (await response.json()).episodes ?? [];
};

const people = (crew: TMDBPerson[] = [], jobs: string[]) => {
  const seen = new Set<number>();
  return crew
    .filter((c) => c.job && jobs.includes(c.job) && !seen.has(c.id) && seen.add(c.id))
    .map((c) => ({ id: c.id, name: c.name }));
};

export const fetchSeasonEpisodes = async (tvId: number, seasonNumber: number, language: string = 'es'): Promise<Episode[]> => {
  const episodes = await fetchSeasonRaw(tvId, seasonNumber, language);

  // Muchas sinopsis y títulos no están traducidos: se completan con la versión en inglés
  const needsFallback =
    language !== 'en' && episodes.some((e) => !e.overview || GENERIC_EPISODE_NAME.test(e.name));
  const fallback = needsFallback ? await fetchSeasonRaw(tvId, seasonNumber, 'en').catch(() => []) : [];
  const fallbackByNumber = new Map(fallback.map((e) => [e.episode_number, e]));

  return episodes.map((e) => {
    const en = fallbackByNumber.get(e.episode_number);
    const name = GENERIC_EPISODE_NAME.test(e.name) && en?.name && !GENERIC_EPISODE_NAME.test(en.name) ? en.name : e.name;
    return {
      id: e.id,
      seasonNumber: e.season_number,
      episodeNumber: e.episode_number,
      name,
      overview: e.overview || en?.overview || '',
      airDate: e.air_date || null,
      runtime: e.runtime,
      stillPath: e.still_path,
      voteAverage: e.vote_average,
      voteCount: e.vote_count,
      directors: people(e.crew, ['Director']),
      writers: people(e.crew, ['Writer', 'Teleplay', 'Story']),
      guestStars: (e.guest_stars ?? []).map((g) => ({
        id: g.id,
        name: g.name,
        character: g.character ?? '',
        profilePath: g.profile_path ?? null
      }))
    };
  });
};
