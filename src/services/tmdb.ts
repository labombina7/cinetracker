
import { 
  fetchTrending, 
  searchMedia, 
  fetchMediaDetails,
  getPosterUrl,
  getBackdropUrl
} from './tmdb/index';

import { Media, MediaDetails, Genre, Platform } from '../types/media';

// Mantener algunas funciones mockup para compatibilidad hasta la migración completa
const mockPlatforms: Platform[] = [
  { id: 1, name: "Netflix", logoPath: "/t2yyOv40HZeVlLjYsCsPHnWLk4W.jpg" },
  { id: 2, name: "Prime Video", logoPath: "/68MNrwlkpF7WnmNPXLah69CR5cb.jpg" },
  { id: 3, name: "Disney+", logoPath: "/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg" },
  { id: 4, name: "HBO Max", logoPath: "/aS2zvJWn9mwiCOeaaCkIh4wleZS.jpg" },
  { id: 5, name: "Movistar+", logoPath: "/6IPjvnYl6WWkIwN158qBFXCr2Ne.jpg" }
];

// Re-exportar las funciones de la nueva API
export const fetchTrendingMedia = fetchTrending;
export const searchMediaFromTmdb = searchMedia;
export const fetchMediaDetailsFromTmdb = fetchMediaDetails;

// Get platforms (streaming services)
export const fetchPlatforms = async (): Promise<Platform[]> => {
  // Return mock platforms (hasta que implementemos una función real)
  return Promise.resolve(mockPlatforms);
};

// Keep the old function for backwards compatibility if needed
export const fetchTrendingByPlatform = async (type: string = 'all'): Promise<Record<string, Media[]>> => {
  // Esta función se mantiene temporalmente para compatibilidad, pero ahora
  // llama a nuestra nueva función de API y luego agrupa los resultados
  const mediaList = await fetchTrending(type as 'all' | 'movie' | 'tv');
  
  // Group by platform
  const groupedByPlatform: Record<string, Media[]> = {};
  
  mediaList.forEach((media) => {
    const platform = media.platform.name;
    if (!groupedByPlatform[platform]) {
      groupedByPlatform[platform] = [];
    }
    groupedByPlatform[platform].push(media);
  });
  
  return Promise.resolve(groupedByPlatform);
};

// Re-exportar las funciones auxiliares
export { getPosterUrl, getBackdropUrl };
