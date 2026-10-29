import { ActorDetails, Media } from '../../types/media';
import { buildApiUrl } from './config';
import { cachedFetch } from './apiCache';

const MAX_CREDITS = 20;
// Talk shows, noticias y realities: el actor aparece como invitado y no aporta a "Conocido por"
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
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  vote_count: number;
  character?: string;
  original_language?: string;
}

// Devuelve null si TMDB responde 404 (la persona no existe)
export const fetchActorDetails = async (id: number, language: string = 'es'): Promise<ActorDetails | null> => {
  const response = await cachedFetch(buildApiUrl(`/person/${id}`, { language }));
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
    id: person.id,
    name: person.name,
    biography,
    profilePath: person.profile_path,
    birthday: person.birthday,
    deathday: person.deathday,
    placeOfBirth: person.place_of_birth,
    knownForDepartment: person.known_for_department
  };
};

// Créditos de reparto (películas + series) más votados, sin duplicados.
// Se ordena por vote_count y no por popularity: popularity premia cameos en series de moda
export const fetchActorCredits = async (id: number, language: string = 'es'): Promise<Media[]> => {
  const response = await cachedFetch(buildApiUrl(`/person/${id}/combined_credits`, { language }));
  if (!response.ok) throw new Error(`Error fetching credits for person ${id}: ${response.status}`);

  const data: { cast: TMDBPersonCredit[] } = await response.json();
  const seen = new Set<string>();

  return data.cast
    .filter((c) => c.poster_path && (c.media_type === 'movie' || c.media_type === 'tv'))
    .filter((c) => !c.genre_ids?.some((g) => EXCLUDED_GENRES.has(g)) && !SELF_ROLE.test(c.character ?? ''))
    .sort((a, b) => b.vote_count - a.vote_count)
    .filter((c) => {
      const key = `${c.media_type}-${c.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, MAX_CREDITS)
    .map((c) => ({
      id: c.id,
      title: (c.media_type === 'movie' ? c.title : c.name) ?? '',
      posterPath: c.poster_path ?? '',
      backdropPath: c.backdrop_path ?? '',
      overview: c.overview,
      voteAverage: c.vote_average,
      releaseDate: c.media_type === 'movie' ? c.release_date : c.first_air_date,
      genres: [],
      genre_ids: c.genre_ids,
      type: c.media_type,
      country: c.original_language === 'es' ? 'ES' : undefined
    }));
};
