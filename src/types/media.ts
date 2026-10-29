
export interface Media {
  id: number;
  title: string;
  posterPath: string;
  backdropPath?: string;
  overview: string;
  voteAverage: number;
  releaseDate?: string;
  genres: Genre[];
  genre_ids?: number[]; // Añadimos genre_ids para mapear desde la API
  platform?: Platform; // Mantener para compatibilidad con código existente
  platforms?: Platform[]; // Nueva propiedad para múltiples plataformas
  type: 'movie' | 'tv';
  country?: string;
  runtime?: number | null; // Duración de película en minutos
  episodeRuntime?: number | null; // Duración de episodio en minutos
  numberOfEpisodes?: number | null; // Número de episodios (solo para series)
  numberOfSeasons?: number | null; // Número de temporadas (solo para series)
  availableForRent?: boolean; // Disponible para alquilar
  availableForPurchase?: boolean; // Disponible para comprar
  original_language?: string; // Idioma original del contenido
  original_title?: string; // Título original del contenido - añadido para resolver el error
  videos?: Video[]; // Vídeos de YouTube (tráileres, teasers, clips)
  lastAiredSeason?: number | null; // Última temporada emitida (solo para series)
  creators?: { id: number; name: string }[]; // Creadores (solo para series)
  series?: SeriesInfo; // Estado, temporadas y emisión (solo para series)
  voteCount?: number;
  collection?: { id: number; name: string } | null; // Saga a la que pertenece (solo películas)
  watchProviders?: { // Nuevo campo para proveedores de streaming
    flatrate?: {
      provider_id: number;
      provider_name: string;
      logo_path: string;
    }[];
    rent?: {
      provider_id: number;
      provider_name: string;
      logo_path: string;
    }[];
    buy?: {
      provider_id: number;
      provider_name: string;
      logo_path: string;
    }[];
  };
}

export interface Video {
  key: string; // ID del vídeo en YouTube
  name: string;
  type: string; // 'Trailer' | 'Teaser' | 'Clip' | 'Featurette' | ...
  official: boolean;
  language: string; // iso_639_1
  publishedAt?: string;
}

export type SeriesStatus = 'returning' | 'ended' | 'canceled' | 'inProduction' | 'planned';

export interface EpisodeSummary {
  seasonNumber: number;
  episodeNumber: number;
  name: string;
  airDate: string | null;
}

export interface SeasonSummary {
  seasonNumber: number;
  name: string;
  episodeCount: number;
  airDate: string | null;
  posterPath: string | null;
}

export interface SeriesInfo {
  status: SeriesStatus | null;
  seasons: SeasonSummary[];
  nextEpisode: EpisodeSummary | null;
  lastEpisode: EpisodeSummary | null;
  networks: { id: number; name: string; logoPath: string | null }[];
}

export interface Episode {
  id: number;
  seasonNumber: number;
  episodeNumber: number;
  name: string;
  overview: string;
  airDate: string | null;
  runtime: number | null;
  stillPath: string | null;
  voteAverage: number;
  voteCount: number;
  directors: { id: number; name: string }[];
  writers: { id: number; name: string }[];
  guestStars: { id: number; name: string; character: string; profilePath: string | null }[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface Platform {
  id: number;
  name: string;
  logoPath?: string;
  type?: 'subscription' | 'rent' | 'buy'; // Tipo de disponibilidad
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface ActorDetails {
  id: number;
  name: string;
  biography: string;
  profilePath: string | null;
  birthday: string | null;
  deathday: string | null;
  placeOfBirth: string | null;
  knownForDepartment: string | null;
  imdbId: string | null;
  instagramId: string | null;
  photos: string[]; // profile_path de la galería de fotos
}

export type CreditKind = 'acting' | 'directing' | 'writing' | 'production' | 'other';

export interface FilmographyEntry {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  posterPath: string;
  backdropPath: string;
  overview: string;
  voteAverage: number;
  voteCount: number;
  releaseDate: string | null;
  genreIds: number[];
  originalLanguage?: string;
  roles: { kind: CreditKind; label: string }[]; // personaje (acting) o cargo (crew)
  episodeCount: number | null; // solo series, en las que aparece
}

export interface MediaDetails extends Media {
  status?: string;
  tagline?: string;
  isFavorite: boolean;
}
