import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from "@/components/ui/carousel";
import { CastMember } from '@/types/media';
import { TMDB_CONFIG } from '@/config/tmdb.config';

interface MediaCastCarouselProps {
  cast: CastMember[];
  language: 'en' | 'es';
}

const MediaCastCarousel: React.FC<MediaCastCarouselProps> = ({ cast, language }) => {
  return (
    <Carousel className="w-full max-w-full">
      <CarouselContent className="-ml-2 md:-ml-4">
        {cast.map((actor) => (
          <CarouselItem key={actor.id} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
            <div className="p-1">
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
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden sm:flex" />
      <CarouselNext className="hidden sm:flex" />
    </Carousel>
  );
};

export default MediaCastCarousel;
