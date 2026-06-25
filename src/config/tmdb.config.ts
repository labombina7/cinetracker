
// Configuración para la API de TMDB
export const TMDB_CONFIG = {
  // La API key se proporcionará posteriormente
  API_KEY: import.meta.env.VITE_TMDB_API_KEY || "",
  
  // URL base de la API
  BASE_URL: "https://api.themoviedb.org/3",
  
  // URL base para imágenes
  IMAGE_BASE_URL: "https://image.tmdb.org/t/p",
  
  // Idiomas permitidos
  ALLOWED_LANGUAGES: ["es", "en", "fr"],
  
  // Tipos de medios
  MEDIA_TYPES: {
    MOVIE: "movie",
    TV: "tv",
    ALL: "all"
  },
  
  // Tamaños de imagen predefinidos
  POSTER_SIZES: {
    SMALL: "w185",
    MEDIUM: "w342",
    LARGE: "w500"
  },
  
  BACKDROP_SIZES: {
    SMALL: "w300",
    MEDIUM: "w780",
    LARGE: "w1280"
  }
};

// Constantes para los providers
// Estas son las plataformas de streaming con tarifa regular
export const STREAMING_PROVIDERS = [
  8,    // Netflix
  9,    // Amazon Prime
  119,  // Amazon Prime
  337,  // Disney Plus
  2,    // Apple TV
  350,  // Apple TV Plus
  3,    // Google Play
  384,  // HBO Max
  15,   // Hulu
  283,  // Crunchyroll
  531,  // Paramount Plus
  619,  // Movistar Plus
  1771, // Movistar Plus Ficción (añadido nuevo)
  521,  // Filmin (añadido nuevo)
  134,  // Atres Player (A3Player) (añadido nuevo)
  551,  // FlixOlé (añadido nuevo)
  149,  // Canal+
  29,   // Sky
  // Se pueden añadir más cuando sea necesario
];
