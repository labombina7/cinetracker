import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Media, Platform } from '@/types/media';
import { getProviderLogoUrl } from '@/services/tmdb/index';
import { usePlatformCarousel } from '@/hooks/usePlatformCarousel';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import MediaCard from '@/components/MediaCard';
import { useLanguage } from '@/hooks/useLanguage';

interface PlatformSectionProps {
  platform: Platform;
}

const PlatformSection: React.FC<PlatformSectionProps> = ({ platform }) => {
  const { media, loading, hasLoaded, sectionRef } = usePlatformCarousel(platform.id);
  const navigate = useNavigate();
  const { language } = useLanguage();

  const handleClick = (item: Media) => {
    navigate(`/details/${item.type}/${item.id}`, { state: { from: 'explore' } });
  };

  const showEmpty = hasLoaded && !loading && media.length === 0;

  return (
    <div ref={sectionRef} className={`mb-10 ${showEmpty ? 'hidden' : ''}`}>
      <div className="flex items-center gap-3 mb-4">
        {platform.logoPath && (
          <img
            src={getProviderLogoUrl(platform.logoPath)}
            alt={platform.name}
            className="h-8 w-8 rounded-lg object-cover"
          />
        )}
        <h2 className="text-lg md:text-xl font-bold">{platform.name}</h2>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="w-[160px] h-[240px] rounded-lg flex-shrink-0" />
          ))}
        </div>
      ) : (
        <Carousel opts={{ align: 'start', dragFree: true }} className="w-full">
          <CarouselContent className="-ml-3">
            {media.map(item => (
              <CarouselItem
                key={`${item.id}-${item.type}`}
                className="pl-3 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
              >
                <MediaCard media={item} onClick={() => handleClick(item)} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4" />
          <CarouselNext className="hidden md:flex -right-4" />
        </Carousel>
      )}
    </div>
  );
};

export default PlatformSection;
