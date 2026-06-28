import React, { useEffect, useState } from 'react';
import { Heart, Clapperboard, Star } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Media, Genre } from '@/types/media';
import { getPosterUrl, getProviderLogoUrl } from '@/services/tmdb/index';
import { useFavorites } from '@/hooks/useFavorites';
import { fetchGenres } from '@/services/tmdb/genres';

interface MediaCardProps {
  media: Media;
  onClick: () => void;
}

const MediaCard: React.FC<MediaCardProps> = ({ media, onClick }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(media.id, media.type);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [genresLoaded, setGenresLoaded] = useState(false);

  useEffect(() => {
    if (media.genres && media.genres.length > 0) {
      setGenres(media.genres.slice(0, 3));
      setGenresLoaded(true);
      return;
    }

    if (!media.genre_ids || media.genre_ids.length === 0) {
      setGenresLoaded(true);
      return;
    }

    const loadGenres = async () => {
      try {
        if (!media.type) {
          setGenresLoaded(true);
          return;
        }

        const genresList = await fetchGenres(media.type);

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

  const isSpanishContent = media.original_language === 'es';
  const favoriteLabel = favorite
    ? `Quitar ${media.title} de favoritos`
    : `Añadir ${media.title} a favoritos`;

  return (
    <Card
      className="overflow-hidden transition-transform hover:scale-105 hover:shadow-lg cursor-pointer border border-white/10"
      onClick={onClick}
    >
      <div className="relative">
        <img
          src={getPosterUrl(media.posterPath)}
          alt={media.title}
          className="w-full aspect-[2/3] object-cover"
          loading="lazy"
        />
        <button
          className="absolute top-2 right-2 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50"
          onClick={handleFavoriteClick}
          aria-label={favoriteLabel}
        >
          <Heart
            className={`h-5 w-5 ${favorite ? 'fill-red-500 text-red-500' : 'text-white'}`}
          />
        </button>
        {isSpanishContent && (
          <div className="absolute bottom-2 right-2">
            <Badge variant="outline" className="bg-red-500/90 text-white" title="Producción en español">
              ES
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <h3 className="font-semibold text-base truncate">{media.title}</h3>
        <div className="flex items-center justify-between mt-1.5">
          <span className="flex items-center gap-1 text-xs text-yellow-400">
            <Star className="w-3 h-3 fill-yellow-400" />
            {displayRating}
          </span>
          {(() => {
            const flatrate = media.watchProviders?.flatrate ?? [];
            const visible = flatrate.slice(0, 3);
            const extra = flatrate.length - visible.length;
            const inTheaters = media.type === 'movie'
              && media.watchProviders !== undefined
              && flatrate.length === 0;

            if (inTheaters) {
              return (
                <span className="flex items-center gap-1 text-yellow-400/80 text-xs" title="En cines">
                  <Clapperboard className="h-3.5 w-3.5" />
                  <span>Cines</span>
                </span>
              );
            }

            if (visible.length === 0) return null;
            return (
              <div className="flex items-center gap-1">
                {visible.map((p) => (
                  <img
                    key={p.provider_id}
                    src={getProviderLogoUrl(p.logo_path)}
                    alt={p.provider_name}
                    title={p.provider_name}
                    className="w-5 h-5 rounded-md border border-white/20 object-cover"
                    loading="lazy"
                  />
                ))}
                {extra > 0 && (
                  <span className="text-muted-foreground text-xs">+{extra}</span>
                )}
              </div>
            );
          })()}
        </div>
      </CardContent>
    </Card>
  );
};

export default MediaCard;
