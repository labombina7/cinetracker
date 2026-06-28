import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MediaCard from '@/components/MediaCard';
import { useFavorites } from '@/hooks/useFavorites';
import { useLanguage } from '@/hooks/useLanguage';
import type { FavoriteItem } from '@/contexts/FavoritesContext';
import type { Media } from '@/types/media';

const favoriteToMedia = (fav: FavoriteItem): Media => ({
  id: fav.id,
  type: fav.type,
  title: fav.title || String(fav.id),
  posterPath: fav.posterPath || '',
  overview: '',
  voteAverage: fav.voteAverage ?? 0,
  genres: [],
  releaseDate: fav.year ? `${fav.year}-01-01` : undefined,
  watchProviders: fav.watchProviders ? { flatrate: fav.watchProviders } : undefined,
});

interface CarouselSectionProps {
  title: string;
  items: FavoriteItem[];
  type: 'movie' | 'tv';
}

const CarouselSection: React.FC<CarouselSectionProps> = ({ title, items, type }) => {
  const navigate = useNavigate();
  const { language } = useLanguage();

  if (items.length === 0) return null;

  const seeAllLabel = language === 'es' ? 'Ver todas' : 'See all';

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">
          {title} <span className="text-muted-foreground font-normal text-sm">({items.length})</span>
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/favorites/list?type=${type}`)}
          className="text-xs text-muted-foreground hover:text-white"
        >
          {seeAllLabel} →
        </Button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {items.map((fav) => (
          <div key={`${fav.id}-${fav.type}`} className="w-[140px] sm:w-[160px] md:w-[180px] flex-shrink-0">
            <MediaCard
              media={favoriteToMedia(fav)}
              onClick={() => navigate(`/details/${fav.type}/${fav.id}`)}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

const Favorites: React.FC = () => {
  const { favorites } = useFavorites();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const movies = favorites.filter((f) => f.type === 'movie');
  const shows = favorites.filter((f) => f.type === 'tv');

  const isEmpty = movies.length === 0 && shows.length === 0;

  const t = {
    title: language === 'es' ? 'Mis favoritos' : 'My Favorites',
    moviesTitle: language === 'es' ? 'Películas' : 'Movies',
    showsTitle: language === 'es' ? 'Series' : 'TV Shows',
    emptyMsg: language === 'es' ? 'Aún no tienes favoritos' : "You don't have any favorites yet",
    exploreCta: language === 'es' ? 'Explorar contenido' : 'Explore content',
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="h-5 w-5 text-red-400 fill-red-400" />
        <h1 className="text-2xl font-bold">{t.title}</h1>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center text-center gap-4 mt-16">
          <Heart className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">{t.emptyMsg}</p>
          <Button onClick={() => navigate('/explore')}>{t.exploreCta}</Button>
        </div>
      ) : (
        <>
          <CarouselSection title={t.moviesTitle} items={movies} type="movie" />
          <CarouselSection title={t.showsTitle} items={shows} type="tv" />
        </>
      )}
    </div>
  );
};

export default Favorites;
