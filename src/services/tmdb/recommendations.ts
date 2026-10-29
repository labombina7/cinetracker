import { Media } from '../../types/media';
import { buildApiUrl } from './config';
import { cachedFetch } from './apiCache';

const MAX_RECOMMENDATIONS = 20;

interface TMDBTitle {
  id: number;
  media_type?: 'movie' | 'tv';
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  original_language?: string;
}

const mapTitle = (item: TMDBTitle, type: 'movie' | 'tv'): Media => ({
  id: item.id,
  title: (type === 'movie' ? item.title : item.name) ?? '',
  posterPath: item.poster_path ?? '',
  backdropPath: item.backdrop_path ?? '',
  overview: item.overview,
  voteAverage: item.vote_average,
  releaseDate: (type === 'movie' ? item.release_date : item.first_air_date) || undefined,
  genres: [],
  genre_ids: item.genre_ids,
  type,
  country: item.original_language === 'es' ? 'ES' : undefined
});

const fetchList = async (path: string, type: 'movie' | 'tv', language: string): Promise<Media[]> => {
  const response = await cachedFetch(buildApiUrl(path, { language }));
  if (!response.ok) throw new Error(`Error fetching ${path}: ${response.status}`);
  const data: { results?: TMDBTitle[] } = await response.json();
  return (data.results ?? [])
    .filter((item) => item.poster_path)
    .slice(0, MAX_RECOMMENDATIONS)
    .map((item) => mapTitle(item, item.media_type ?? type));
};

// Recomendaciones de TMDB; si no hay, títulos similares
export const fetchRecommendations = async (id: number, type: 'movie' | 'tv', language: string = 'es'): Promise<Media[]> => {
  const recommendations = await fetchList(`/${type}/${id}/recommendations`, type, language);
  if (recommendations.length > 0) return recommendations;
  return fetchList(`/${type}/${id}/similar`, type, language);
};

export interface Collection {
  id: number;
  name: string;
  parts: Media[]; // en orden de estreno; las que no tienen fecha, al final
}

export const fetchCollection = async (id: number, language: string = 'es'): Promise<Collection> => {
  const response = await cachedFetch(buildApiUrl(`/collection/${id}`, { language }));
  if (!response.ok) throw new Error(`Error fetching collection ${id}: ${response.status}`);
  const data: { id: number; name: string; parts?: TMDBTitle[] } = await response.json();

  const parts = (data.parts ?? []).map((part) => mapTitle(part, 'movie'));
  parts.sort((a, b) => {
    if (!a.releaseDate) return 1;
    if (!b.releaseDate) return -1;
    return a.releaseDate.localeCompare(b.releaseDate);
  });

  return { id: data.id, name: data.name, parts };
};
