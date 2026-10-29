import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Collection } from '@/services/tmdb/recommendations';
import { fetchCollection } from '@/services/tmdb/index';
import { TMDB_CONFIG } from '@/config/tmdb.config';
import { useInView } from '@/hooks/useInView';

interface MediaCollectionProps {
  collectionId: number;
  currentId: number;
  language: 'es' | 'en';
  labels: { saga: string; upcoming: string; current: string };
}

const today = new Date().toISOString().slice(0, 10);

const MediaCollection: React.FC<MediaCollectionProps> = ({ collectionId, currentId, language, labels }) => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref);
  const [collection, setCollection] = useState<Collection | null>(null);

  useEffect(() => {
    if (!inView) return;
    let cancelled = false;
    fetchCollection(collectionId, language)
      .then((result) => !cancelled && setCollection(result))
      .catch((error) => console.error('Error loading collection:', error));
    return () => {
      cancelled = true;
    };
  }, [inView, collectionId, language]);

  // Una "saga" de una sola película no aporta nada
  const show = collection && collection.parts.length > 1;

  return (
    <section ref={ref} className={show ? 'mb-10' : ''}>
      {show && (
        <>
          <h2 className="text-lg md:text-xl font-bold mb-4">
            {labels.saga}: {collection.name}
          </h2>
          <ol className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {collection.parts.map((part, i) => {
              const current = part.id === currentId;
              const upcoming = !part.releaseDate || part.releaseDate > today;
              return (
                <li key={part.id} className="shrink-0 w-28">
                  <Link
                    to={`/details/movie/${part.id}`}
                    aria-current={current ? 'page' : undefined}
                    className={`block rounded-md p-1 transition-colors ${current ? 'bg-yellow-400/15 ring-2 ring-yellow-400' : 'hover:bg-white/5'}`}
                  >
                    <div className="relative overflow-hidden rounded bg-muted aspect-[2/3]">
                      {part.posterPath && (
                        <img
                          src={`${TMDB_CONFIG.IMAGE_BASE_URL}/w185${part.posterPath}`}
                          alt=""
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      )}
                      <span className="absolute top-1 left-1 w-6 h-6 rounded-full bg-black/70 text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-medium line-clamp-2">{part.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {current ? labels.current : upcoming ? labels.upcoming : part.releaseDate?.slice(0, 4)}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </section>
  );
};

export default MediaCollection;
