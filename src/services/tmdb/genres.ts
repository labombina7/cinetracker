
import { Genre } from '../../types/media';
import { TMDBGenresResponse } from '../../types/tmdb';
import { buildApiUrl } from './config';

// Cache per language
const cache: Record<string, Genre[]> = {};

export const fetchGenres = async (type: 'movie' | 'tv', language = 'en'): Promise<Genre[]> => {
  if (type !== 'movie' && type !== 'tv') {
    console.error(`Invalid media type for fetchGenres: ${type}`);
    return [];
  }

  const key = `${type}-${language}`;
  if (cache[key]?.length) return cache[key];

  try {
    const response = await fetch(buildApiUrl(`/genre/${type}/list`, { language }));
    if (!response.ok) throw new Error(`Error fetching ${type} genres: ${response.status}`);
    const data: TMDBGenresResponse = await response.json();
    cache[key] = data.genres;
    return cache[key];
  } catch (error) {
    console.error(`Error fetching ${type} genres:`, error);
    return [];
  }
};
