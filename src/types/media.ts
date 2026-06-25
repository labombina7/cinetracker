
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

export interface MediaDetails extends Media {
  status?: string;
  tagline?: string;
  isFavorite: boolean;
}
