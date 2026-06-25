
import { Media } from '@/types/media';

// Función para ordenar por fecha de lanzamiento (más reciente primero)
export const sortByReleaseDate = (results: Media[]): Media[] => {
  console.log(`Sorting ${results.length} items by release date`);
  return [...results].sort((a, b) => {
    // Mover ítems sin fecha al final
    if (!a.releaseDate) return 1;
    if (!b.releaseDate) return -1;
    
    // Ordenar por fecha descendente
    const dateA = new Date(a.releaseDate).getTime();
    const dateB = new Date(b.releaseDate).getTime();
    return dateB - dateA;
  });
};

// Función para ordenar por puntuación (de mayor a menor)
export const sortByVoteAverage = (results: Media[]): Media[] => {
  console.log(`Sorting ${results.length} items by vote average`);
  return [...results].sort((a, b) => {
    // Ordenar primero por puntuación
    const ratingDiff = b.voteAverage - a.voteAverage;
    if (ratingDiff !== 0) return ratingDiff;
    
    // Si la puntuación es igual, ordenar por fecha
    if (a.releaseDate && b.releaseDate) {
      return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
    }
    return 0;
  });
};
