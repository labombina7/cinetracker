import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Play } from 'lucide-react';
import { Media } from '@/types/media';
import { getBackdropUrl, getProviderLogoUrl } from '@/services/tmdb/utils';
import { fetchWatchProviders } from '@/services/tmdb/providers';
import { useFavorites } from '@/hooks/useFavorites';
import FavoriteButton from '@/components/media/FavoriteButton';
import HeroThumbnails from './HeroThumbnails';

interface HeroReleaseProps {
  items: Media[];
  loading: boolean;
}

interface Provider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

const isRecent = (dateStr?: string): boolean => {
  if (!dateStr) return false;
  return Date.now() - new Date(dateStr).getTime() < 7 * 24 * 60 * 60 * 1000;
};

const HeroRelease: React.FC<HeroReleaseProps> = ({ items, loading }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [providers, setProviders] = useState<Provider[]>([]);
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const prefersReduced = useRef(
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // Autoplay
  useEffect(() => {
    if (paused || prefersReduced.current || items.length <= 1) return;
    const id = setInterval(() => {
      setActiveIndex(i => (i + 1) % items.length);
    }, 8000);
    return () => clearInterval(id);
  }, [paused, items.length]);

  // Load providers for active item
  useEffect(() => {
    if (!items.length) return;
    const item = items[activeIndex];
    let cancelled = false;
    fetchWatchProviders(item.id, item.type).then(data => {
      if (cancelled) return;
      const esProviders: Provider[] = data?.results?.ES?.flatrate ?? [];
      setProviders(esProviders.slice(0, 4));
    });
    return () => { cancelled = true; };
  }, [activeIndex, items]);

  if (loading) {
    return (
      <div className="w-full bg-white/5 animate-pulse rounded-xl" style={{ height: '45vh', minHeight: 220 }} />
    );
  }

  if (!items.length) return null;

  const item = items[activeIndex];
  const backdropUrl = getBackdropUrl(item.backdropPath || null, 'large');
  const year = item.releaseDate ? new Date(item.releaseDate).getFullYear() : null;
  const typeLabel = item.type === 'movie' ? 'Película' : 'Serie';
  const fav = isFavorite(item.id, item.type);

  return (
    <div
      className="w-full relative overflow-hidden rounded-xl mb-8"
      style={{ height: '45vh', minHeight: 220 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Backdrop — object-position slightly above center so faces stay visible */}
      <img
        key={item.id}
        src={backdropUrl}
        alt=""
        aria-hidden
        style={{ objectPosition: '50% 20%' }}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6 gap-2">
        {/* Metadata row */}
        <div className="flex items-center gap-2 flex-wrap">
          {isRecent(item.releaseDate) && (
            <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-red-500 text-white">
              Estreno
            </span>
          )}
          <span className="text-xs text-white/60">{typeLabel}</span>
          {year && <span className="text-xs text-white/60">{year}</span>}
          <span className="flex items-center gap-1 text-xs text-yellow-400">
            <Star className="w-3 h-3 fill-yellow-400" />
            {item.voteAverage.toFixed(1)}
          </span>
          {providers.length > 0 && (
            <div className="flex items-center gap-1 ml-1">
              {providers.map(p => (
                <img
                  key={p.provider_id}
                  src={getProviderLogoUrl(p.logo_path)}
                  alt={p.provider_name}
                  title={p.provider_name}
                  className="w-5 h-5 rounded object-cover"
                />
              ))}
            </div>
          )}
        </div>

        {/* Title — posición fija: siempre justo encima de la sinopsis */}
        <h2 className="text-xl md:text-3xl font-bold text-white leading-tight line-clamp-2">
          {item.title}
        </h2>

        {/* Synopsis — altura fija para que el título no salte entre ítems */}
        <div className="h-10 hidden sm:block">
          <p className="text-sm text-white/70 line-clamp-2 max-w-xl">
            {item.overview}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 items-center">
          <button
            onClick={() => navigate(`/details/${item.type}/${item.id}`)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-semibold hover:bg-white/90 transition-colors"
          >
            <Play className="w-4 h-4 fill-black" />
            Ver detalles
          </button>
          <FavoriteButton
            isFavorite={fav}
            onToggle={() => toggleFavorite(item.id, item.type, item.title, item.releaseDate)}
            variant="icon"
            mediaTitle={item.title}
          />
        </div>

        {/* Thumbnails */}
        {items.length > 1 && (
          <div className="mt-2">
            <HeroThumbnails items={items} activeIndex={activeIndex} onSelect={setActiveIndex} />
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroRelease;
