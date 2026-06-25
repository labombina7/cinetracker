
import { Genre } from '../../types/media';
import { TMDBGenresResponse } from '../../types/tmdb';
import { buildApiUrl } from './config';

// Géneros en caché para evitar llamadas repetidas
let movieGenres: Genre[] = [];
let tvGenres: Genre[] = [];

// Función para obtener los géneros
export const fetchGenres = async (type: 'movie' | 'tv'): Promise<Genre[]> => {
  // Validate the media type to prevent API errors
  if (type !== 'movie' && type !== 'tv') {
    console.error(`Invalid media type for fetchGenres: ${type}`);
    return [];
  }
  
  // Si ya tenemos los géneros en caché, devolvemos esos
  if (type === 'movie' && movieGenres.length > 0) return movieGenres;
  if (type === 'tv' && tvGenres.length > 0) return tvGenres;

  try {
    console.log(`Fetching ${type} genres from API`);
    const response = await fetch(buildApiUrl(`/genre/${type}/list`));
    
    if (!response.ok) {
      throw new Error(`Error fetching ${type} genres: ${response.status}`);
    }
    
    const data: TMDBGenresResponse = await response.json();
    console.log(`Retrieved ${data.genres.length} ${type} genres`);
    
    // Guardar en caché
    if (type === 'movie') {
      movieGenres = data.genres;
      return movieGenres;
    } else {
      tvGenres = data.genres;
      return tvGenres;
    }
  } catch (error) {
    console.error(`Error fetching ${type} genres:`, error);
    return [];
  }
};
