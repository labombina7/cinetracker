
// Tipos específicos para la API de TMDB

// Tipo para manejar la respuesta de Discover
export interface TMDBDiscoverResponse {
  page: number;
  results: TMDBMediaItem[];
  total_results: number;
  total_pages: number;
}

// Estructura de un ítem de medio (película o serie)
export interface TMDBMediaItem {
  id: number;
  title?: string;
  name?: string; // Para series TV
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string; // Para películas
  first_air_date?: string; // Para series
  genre_ids: number[];
  original_language: string;
  original_title?: string; // Para películas - título original
  original_name?: string; // Para series - nombre original
  origin_country?: string[]; // País de origen
  media_type: 'movie' | 'tv';
  watch_providers?: TMDBWatchProviders;
}

// Estructura para los proveedores de streaming
export interface TMDBWatchProviders {
  results: {
    [country: string]: {
      flatrate?: Provider[];
      rent?: Provider[];
      buy?: Provider[];
    };
  };
}

// Estructura para un proveedor individual
export interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

// Estructura para los géneros
export interface TMDBGenre {
  id: number;
  name: string;
}

// Respuesta de la API de géneros
export interface TMDBGenresResponse {
  genres: TMDBGenre[];
}
