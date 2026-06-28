import { Media } from '../../types/media';
import { buildApiUrl } from './config';
import { cachedFetch } from './apiCache';

interface TMDBTopRatedResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  overview: string;
  vote_average: number;
  vote_count: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  original_language?: string;
}

interface TMDBTopRatedResponse {
  results: TMDBTopRatedResult[];
}

const mapResult = (item: TMDBTopRatedResult, type: 'movie' | 'tv'): Media => ({
  id: item.id,
  title: item.title ?? item.name ?? '',
  posterPath: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '',
  backdropPath: item.backdrop_path ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` : undefined,
  overview: item.overview,
  voteAverage: item.vote_average,
  releaseDate: item.release_date ?? item.first_air_date,
  genres: [],
  genre_ids: item.genre_ids,
  original_language: item.original_language,
  type,
});

export const fetchTopRated = async (
  type: 'movie' | 'tv',
  language = 'es-ES'
): Promise<Media[]> => {
  const url = buildApiUrl(`/${type}/top_rated`, { language, page: 1 });
  const res = await cachedFetch(url);
  if (!res.ok) return [];
  const data: TMDBTopRatedResponse = await res.json();
  return (data.results ?? []).map(item => mapResult(item, type));
};
