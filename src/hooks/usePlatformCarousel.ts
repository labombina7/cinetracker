import { useState, useEffect, useRef } from 'react';
import { Media } from '@/types/media';
import { fetchMediaByPlatforms } from '@/services/tmdb/index';
import { useMediaFilters } from '@/contexts/MediaFiltersContext';

export const usePlatformCarousel = (platformId: number) => {
  const { filtersState } = useMediaFilters();
  const { mediaType, spanishFilter, sortBy, selectedGenreId } = filtersState;

  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [triggered, setTriggered] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTriggered(true);
          observer.disconnect();
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!triggered) return;

    let cancelled = false;
    setLoading(true);
    setMedia([]);

    fetchMediaByPlatforms(mediaType, [platformId], 1, spanishFilter, sortBy, selectedGenreId)
      .then(results => {
        if (!cancelled) {
          setMedia(results.slice(0, 15));
          setLoading(false);
          setHasLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false);
          setHasLoaded(true);
        }
      });

    return () => { cancelled = true; };
  }, [triggered, platformId, mediaType, spanishFilter, sortBy, selectedGenreId]);

  return { media, loading, hasLoaded, sectionRef };
};
