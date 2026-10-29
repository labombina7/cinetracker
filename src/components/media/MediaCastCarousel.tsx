import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { CastMember } from '@/types/media';
import { TMDB_CONFIG } from '@/config/tmdb.config';

interface MediaCastCarouselProps {
  cast: CastMember[];
  language: 'en' | 'es';
}

const MediaCastCarousel: React.FC<MediaCastCarouselProps> = ({ cast, language }) => {
  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
      {cast.map((actor) => (
        <Link
          key={actor.id}
          to={`/actor/${actor.id}`}
          className="shrink-0 w-24 group rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={language === 'es' ? `Ver perfil de ${actor.name}` : `View ${actor.name}'s profile`}
        >
          <div className="relative overflow-hidden rounded-md bg-muted aspect-[2/3]">
            {actor.profile_path ? (
              <img
                src={`${TMDB_CONFIG.IMAGE_BASE_URL}/w185${actor.profile_path}`}
                alt={language === 'es'
                  ? `Foto de ${actor.name} como ${actor.character}`
                  : `Photo of ${actor.name} as ${actor.character}`}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <span className="text-muted-foreground text-xs">{actor.name}</span>
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/50 transition-colors">
              <User className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <h3 className="mt-2 text-sm font-medium truncate group-hover:underline">{actor.name}</h3>
          <p className="text-xs text-muted-foreground truncate">{actor.character}</p>
        </Link>
      ))}
    </div>
  );
};

export default MediaCastCarousel;
