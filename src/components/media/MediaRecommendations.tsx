import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import MediaCard from '@/components/MediaCard';
import { Media } from '@/types/media';
import { fetchRecommendations } from '@/services/tmdb/index';
import { useInView } from '@/hooks/useInView';
import { useMyPlatformsLookup } from '@/hooks/useMyPlatformsLookup';

interface MediaRecommendationsProps {
  id: number;
  type: 'movie' | 'tv';
  language: 'es' | 'en';
  labels: { title: string; onlyMine: string; noneOnMine: string; checking: string };
}

const MediaRecommendations: React.FC<MediaRecommendationsProps> = ({ id, type, language, labels }) => {
  const navigate = useNavigate();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref);
  const [items, setItems] = useState<Media[] | null>(null);
  const [onlyMine, setOnlyMine] = useState(false);
  const list = useMemo(() => items ?? [], [items]);
  const lookup = useMyPlatformsLookup(list, onlyMine);

  useEffect(() => {
    if (!inView) return;
    let cancelled = false;
    setItems(null);
    fetchRecommendations(id, type, language)
      .then((result) => !cancelled && setItems(result))
      .catch((error) => {
        console.error('Error loading recommendations:', error);
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [inView, id, type, language]);

  const visible = useMemo(
    () => (onlyMine ? list.filter(lookup.isOnMyPlatforms) : list),
    [list, onlyMine, lookup.isOnMyPlatforms]
  );

  if (items && items.length === 0) return <section ref={ref} />;

  return (
    <section ref={ref} className="mb-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-lg md:text-xl font-bold">{labels.title}</h2>
        {lookup.hasPlatforms && (
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Switch checked={onlyMine} onCheckedChange={setOnlyMine} />
            {labels.onlyMine}
          </label>
        )}
      </div>

      {items === null ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="w-[160px] h-[240px] rounded-lg flex-shrink-0" />
          ))}
        </div>
      ) : onlyMine && lookup.loading && visible.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> {labels.checking}
        </p>
      ) : visible.length === 0 ? (
        <p className="text-sm text-muted-foreground">{labels.noneOnMine}</p>
      ) : (
        <Carousel opts={{ align: 'start', dragFree: true }} className="w-full">
          <CarouselContent className="-ml-3">
            {visible.map((item) => (
              <CarouselItem key={`${item.type}-${item.id}`} className="pl-3 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                <MediaCard media={item} onClick={() => navigate(`/details/${item.type}/${item.id}`)} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4" />
          <CarouselNext className="hidden md:flex -right-4" />
        </Carousel>
      )}
    </section>
  );
};

export default MediaRecommendations;
