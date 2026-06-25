
import React, { useEffect, useState } from 'react';
import { Heart, ShoppingCart, CreditCard } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Media, Genre } from '@/types/media';
import { getPosterUrl } from '@/services/tmdb/index';
import { useFavorites } from '@/hooks/useFavorites';
import { fetchGenres } from '@/services/tmdb/genres';

interface MediaCardProps {
  media: Media;
  onClick: () => void;
}

const MediaCard: React.FC<MediaCardProps> = ({ media, onClick }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(media.id);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [genresLoaded, setGenresLoaded] = useState(false);

  useEffect(() => {
    // If we already have genres in the media object, use them directly
    if (media.genres && media.genres.length > 0) {
      setGenres(media.genres.slice(0, 3));
      setGenresLoaded(true);
      return;
    }

    // Only fetch genres if we have genre_ids
    if (!media.genre_ids || media.genre_ids.length === 0) {
      setGenresLoaded(true);
      return;
    }

    const loadGenres = async () => {
      try {
        if (!media.type) {
          console.error('Media type is undefined', media);
          setGenresLoaded(true);
          return;
        }
        
        const mediaType = media.type;
        const genresList = await fetchGenres(mediaType);
        
        // Map genre IDs to actual genre objects
        if (media.genre_ids && media.genre_ids.length > 0) {
          const mediaGenres = media.genre_ids
            .map(id => genresList.find(genre => genre.id === id))
            .filter((genre): genre is Genre => !!genre)
            .slice(0, 3);
          
          setGenres(mediaGenres);
        }
        setGenresLoaded(true);
      } catch (err) {
        console.error('Error loading genres for media card:', err);
        setGenresLoaded(true);
      }
    };

    loadGenres();
  }, [media]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(media.id, media.type, media.title, media.releaseDate);
  };

  const displayRating = media.voteAverage !== undefined && media.voteAverage !== null 
    ? media.voteAverage.toFixed(1) 
    : '-';
    
  // Determine if content is Spanish STRICTLY by original language only
  const isSpanishContent = media.original_language === 'es';

  return (
    <Card 
      className="overflow-hidden transition-transform hover:scale-105 hover:shadow-lg cursor-pointer"
      onClick={onClick}
    >
      <div className="relative">
        <img 
          src={getPosterUrl(media.posterPath)} 
          alt={media.title} 
          className="w-full h-[350px] object-cover"
        />
        <button 
          className="absolute top-2 right-2 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50"
          onClick={handleFavoriteClick}
        >
          <Heart 
            className={`h-5 w-5 ${favorite ? 'fill-red-500 text-red-500' : 'text-white'}`} 
          />
        </button>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="bg-yellow-500/90 text-black font-bold">
              {displayRating}
            </Badge>
            
            <div className="flex gap-1">
              {media.availableForRent && (
                <Badge variant="outline" className="bg-blue-500/90 text-white flex items-center gap-1 px-2">
                  <CreditCard className="h-3 w-3" />
                </Badge>
              )}
              {media.availableForPurchase && (
                <Badge variant="outline" className="bg-green-500/90 text-white flex items-center gap-1 px-2">
                  <ShoppingCart className="h-3 w-3" />
                </Badge>
              )}
              {isSpanishContent && (
                <Badge variant="outline" className="bg-red-500/90 text-white">
                  ES
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
      <CardContent className="p-3">
        <h3 className="font-semibold text-base truncate">{media.title}</h3>
        {genresLoaded && genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {genres.map((genre) => (
              genre && genre.id && genre.name ? (
                <Badge key={genre.id} variant="outline" className="text-xs font-normal">
                  {genre.name}
                </Badge>
              ) : null
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MediaCard;
