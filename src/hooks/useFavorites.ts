import { useState, useEffect } from 'react';
import { addToWatchlist } from '../services/trakt';
import { toast } from '@/components/ui/use-toast';

export type FavoriteItem = { id: number; type: 'movie' | 'tv' };

const parseAndMigrate = (raw: string): FavoriteItem[] => {
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];
  // Migrate old format (number[]) — assume movie as fallback
  if (parsed.length > 0 && typeof parsed[0] === 'number') {
    return parsed.map((id: number) => ({ id, type: 'movie' as const }));
  }
  return parsed.filter(
    (item: unknown): item is FavoriteItem =>
      typeof (item as FavoriteItem)?.id === 'number' &&
      ((item as FavoriteItem)?.type === 'movie' || (item as FavoriteItem)?.type === 'tv')
  );
};

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      try {
        setFavorites(parseAndMigrate(storedFavorites));
      } catch {
        setFavorites([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = async (id: number, mediaType: 'movie' | 'tv', title: string, releaseDate?: string) => {
    try {
      const isCurrentlyFavorite = favorites.some(fav => fav.id === id && fav.type === mediaType);

      if (isCurrentlyFavorite) {
        setFavorites(favorites.filter(fav => !(fav.id === id && fav.type === mediaType)));
        toast({
          title: "Eliminado de favoritos",
          description: `"${title}" ha sido eliminado de tu lista de favoritos`,
        });
      } else {
        setFavorites([...favorites, { id, type: mediaType }]);

        try {
          const added = await addToWatchlist(id, mediaType, title, releaseDate);
          if (added) {
            toast({
              title: "Añadido a favoritos",
              description: `"${title}" ha sido añadido a tu lista de favoritos y a tu Watch List de Trakt.tv`,
            });
          } else {
            toast({
              title: "Añadido a favoritos",
              description: `"${title}" ha sido añadido a tus favoritos. Para sincronizar con Trakt.tv, inicia sesión primero.`,
            });
          }
        } catch (traktError) {
          console.error('Error with Trakt integration:', traktError);
          toast({
            title: "Añadido a favoritos",
            description: `"${title}" ha sido añadido a tus favoritos, pero hubo un problema al sincronizar con Trakt.tv.`,
          });
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Ha ocurrido un error. Inténtalo de nuevo más tarde.",
        variant: "destructive",
      });
    }
  };

  const isFavorite = (id: number, type: 'movie' | 'tv') =>
    favorites.some(fav => fav.id === id && fav.type === type);

  return { favorites, toggleFavorite, isFavorite };
};
