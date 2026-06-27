import React from 'react';
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
        <div key={actor.id} className="shrink-0 w-24">
          <div className="overflow-hidden rounded-md bg-muted aspect-[2/3]">
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
          </div>
          <h3 className="mt-2 text-sm font-medium truncate">{actor.name}</h3>
          <p className="text-xs text-muted-foreground truncate">{actor.character}</p>
        </div>
      ))}
    </div>
  );
};

export default MediaCastCarousel;
