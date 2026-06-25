
import { Media, Genre } from '../../types/media';
import { TMDB_CONFIG } from '../../config/tmdb.config';

// Obtener URL de poster
export const getPosterUrl = (path: string | null, size: 'small' | 'medium' | 'large' = 'medium'): string => {
  if (!path) return '/placeholder.svg';
  
  let sizeStr;
  switch (size) {
    case 'small':
      sizeStr = TMDB_CONFIG.POSTER_SIZES.SMALL;
      break;
    case 'large':
      sizeStr = TMDB_CONFIG.POSTER_SIZES.LARGE;
      break;
    case 'medium':
    default:
      sizeStr = TMDB_CONFIG.POSTER_SIZES.MEDIUM;
  }
  
  return `${TMDB_CONFIG.IMAGE_BASE_URL}/${sizeStr}${path}`;
};

// Obtener URL de backdrop
export const getBackdropUrl = (path: string | null, size: 'small' | 'medium' | 'large' = 'medium'): string => {
  if (!path) return '';
  
  let sizeStr;
  switch (size) {
    case 'small':
      sizeStr = TMDB_CONFIG.BACKDROP_SIZES.SMALL;
      break;
    case 'large':
      sizeStr = TMDB_CONFIG.BACKDROP_SIZES.LARGE;
      break;
    case 'medium':
    default:
      sizeStr = TMDB_CONFIG.BACKDROP_SIZES.MEDIUM;
  }
  
  return `${TMDB_CONFIG.IMAGE_BASE_URL}/${sizeStr}${path}`;
};

// Convertir un ítem de TMDB a nuestro formato estándar Media
export const convertToMedia = async (item: any, type: 'movie' | 'tv' | 'all'): Promise<Media | null> => {
  // Si no hay item válido, devolver null
  if (!item || !item.id) return null;

  // Determinar tipo real
  const mediaType = type === 'all' ? item.media_type || 'movie' : type;

  // Crear objeto Media común
  const media: Media = {
    id: item.id,
    title: mediaType === 'movie' ? item.title : item.name,
    posterPath: item.poster_path || '',
    backdropPath: item.backdrop_path || '',
    overview: item.overview || '',
    voteAverage: item.vote_average || 0,
    releaseDate: mediaType === 'movie' ? item.release_date : item.first_air_date,
    genres: item.genre_ids 
      ? item.genre_ids.map((id: number) => ({ id, name: '' }))
      : (item.genres || []),
    platform: { id: 0, name: 'Por determinar' },
    type: mediaType,
    country: item.origin_country?.[0] || null,
    original_language: item.original_language || null  // Preservamos el idioma original
  };

  // Verificar que el ítem cumple con los requisitos mínimos
  if (!media.title || (!media.posterPath && !media.backdropPath)) {
    return null;
  }

  return media;
};
