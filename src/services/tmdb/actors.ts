import { ActorDetails, CreditKind, FilmographyEntry, Media } from '../../types/media';
import { buildApiUrl } from './config';
import { cachedFetch } from './apiCache';

const MAX_KNOWN_FOR = 20;
const MAX_PHOTOS = 10;
// Talk shows, noticias y realities: la persona aparece como invitada y no es parte de su filmografía
const EXCLUDED_GENRES = new Set([10767, 10763, 10764]);
const SELF_ROLE = /\b(self|himself|herself|themselves)\b/i;

interface TMDBPersonCredit {
  id: number;
  media_type: 'movie' | 'tv';
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  vote_count: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  original_language?: string;
  episode_count?: number;
  character?: string; // cast
  department?: string; // crew
  job?: string; // crew
}

export interface PersonProfile {
  details: ActorDetails;
  filmography: FilmographyEntry[];
}

const DEPARTMENT_KIND: Record<string, CreditKind> = {
  Directing: 'directing',
  Writing: 'writing',
  Creator: 'writing',
  Production: 'production'
};

export const KNOWN_FOR_DEPARTMENT_KIND: Record<string, CreditKind> = {
  Acting: 'acting',
  ...DEPARTMENT_KIND
};

const isRelevant = (c: TMDBPersonCredit) =>
  (c.media_type === 'movie' || c.media_type === 'tv') &&
  !c.genre_ids?.some((g) => EXCLUDED_GENRES.has(g)) &&
  !SELF_ROLE.test(c.character ?? '') &&
  c.job !== 'Thanks';

// Une cast y crew en una entrada por título, juntando todos los roles de la persona en él
const buildFilmography = (cast: TMDBPersonCredit[], crew: TMDBPersonCredit[]): FilmographyEntry[] => {
  const entries = new Map<string, FilmographyEntry>();

  const add = (c: TMDBPersonCredit, kind: CreditKind, label: string) => {
    const key = `${c.media_type}-${c.id}`;
    let entry = entries.get(key);
    if (!entry) {
      entry = {
        id: c.id,
        type: c.media_type,
        title: (c.media_type === 'movie' ? c.title : c.name) ?? '',
        posterPath: c.poster_path ?? '',
        backdropPath: c.backdrop_path ?? '',
        overview: c.overview,
        voteAverage: c.vote_average,
        voteCount: c.vote_count,
        releaseDate: (c.media_type === 'movie' ? c.release_date : c.first_air_date) || null,
        genreIds: c.genre_ids ?? [],
        originalLanguage: c.original_language,
        roles: [],
        episodeCount: null
      };
      entries.set(key, entry);
    }
    // Un rol sin etiqueta (personaje vacío) solo se guarda si no hay otro del mismo tipo
    if (!entry.roles.some((r) => r.kind === kind && (r.label === label || !label))) {
      entry.roles.push({ kind, label });
    }
    if (kind === 'acting' && c.episode_count) {
      entry.episodeCount = Math.max(entry.episodeCount ?? 0, c.episode_count);
    }
  };

  cast.filter(isRelevant).forEach((c) => add(c, 'acting', c.character ?? ''));
  crew.filter(isRelevant).forEach((c) => add(c, DEPARTMENT_KIND[c.department ?? ''] ?? 'other', c.job ?? ''));

  // Más reciente primero; los títulos sin fecha (anunciados) van al principio
  return [...entries.values()].sort((a, b) => {
    if (!a.releaseDate) return b.releaseDate ? -1 : b.voteCount - a.voteCount;
    if (!b.releaseDate) return 1;
    return b.releaseDate.localeCompare(a.releaseDate);
  });
};

export const filmographyEntryToMedia = (e: FilmographyEntry): Media => ({
  id: e.id,
  title: e.title,
  posterPath: e.posterPath,
  backdropPath: e.backdropPath,
  overview: e.overview,
  voteAverage: e.voteAverage,
  releaseDate: e.releaseDate ?? undefined,
  genres: [],
  genre_ids: e.genreIds,
  type: e.type,
  country: e.originalLanguage === 'es' ? 'ES' : undefined
});

// "Conocido por": los títulos más votados en el rol principal de la persona.
// Se ordena por vote_count y no por popularity: popularity premia cameos en series de moda
export const pickKnownFor = (filmography: FilmographyEntry[], primaryKind: CreditKind): Media[] => {
  const withPoster = filmography.filter((e) => e.posterPath);
  const inPrimaryRole = withPoster.filter((e) => e.roles.some((r) => r.kind === primaryKind));
  return (inPrimaryRole.length > 0 ? inPrimaryRole : withPoster)
    .slice()
    .sort((a, b) => b.voteCount - a.voteCount)
    .slice(0, MAX_KNOWN_FOR)
    .map(filmographyEntryToMedia);
};

// Devuelve null si TMDB responde 404 (la persona no existe)
export const fetchPersonProfile = async (id: number, language: string = 'es'): Promise<PersonProfile | null> => {
  const response = await cachedFetch(
    buildApiUrl(`/person/${id}`, { language, append_to_response: 'combined_credits,external_ids,images' })
  );
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Error fetching person ${id}: ${response.status}`);

  const person = await response.json();
  let biography: string = person.biography ?? '';

  // Muchas biografías no están traducidas: fallback al inglés
  if (!biography && language !== 'en') {
    const fallback = await cachedFetch(buildApiUrl(`/person/${id}`, { language: 'en' }));
    if (fallback.ok) biography = (await fallback.json()).biography ?? '';
  }

  return {
    details: {
      id: person.id,
      name: person.name,
      biography,
      profilePath: person.profile_path,
      birthday: person.birthday,
      deathday: person.deathday,
      placeOfBirth: person.place_of_birth,
      knownForDepartment: person.known_for_department,
      imdbId: person.external_ids?.imdb_id ?? null,
      instagramId: person.external_ids?.instagram_id ?? null,
      photos: (person.images?.profiles ?? [])
        .map((img: { file_path: string }) => img.file_path)
        .filter((path: string) => path !== person.profile_path)
        .slice(0, MAX_PHOTOS)
    },
    filmography: buildFilmography(person.combined_credits?.cast ?? [], person.combined_credits?.crew ?? [])
  };
};
