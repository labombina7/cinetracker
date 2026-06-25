
import { useState, useEffect } from 'react';
import { addToWatchlist } from '../services/trakt';
import { toast } from '@/components/ui/use-toast';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<number[]>([]);

  // Load favorites from localStorage on component mount
  useEffect(() => {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = async (id: number, mediaType: 'movie' | 'tv', title: string, releaseDate?: string) => {
    try {
      if (favorites.includes(id)) {
        // Remove from favorites
        setFavorites(favorites.filter(favId => favId !== id));
        toast({
          title: "Eliminado de favoritos",
          description: `"${title}" ha sido eliminado de tu lista de favoritos`,
        });
      } else {
        // Add to favorites
        setFavorites([...favorites, id]);
        
        // Add to Trakt watchlist if we're authenticated
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

  const isFavorite = (id: number) => favorites.includes(id);

  return { favorites, toggleFavorite, isFavorite };
};
