import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Heart, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

type TabType = 'all' | 'movie' | 'tv';

const FavoritesList: React.FC = () => {
  const { favorites } = useFavorites();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { language } = useLanguage();

  const typeParam = searchParams.get('type') as 'movie' | 'tv' | null;
  const activeTab: TabType = typeParam === 'movie' || typeParam === 'tv' ? typeParam : 'all';
  const [query, setQuery] = useState('');

  const setTab = (tab: TabType) => {
    if (tab === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ type: tab });
    }
  };

  const filtered = favorites
    .filter((f) => activeTab === 'all' || f.type === activeTab)
    .filter((f) => !query || f.title.toLowerCase().includes(query.toLowerCase()));

  const t = {
    back: language === 'es' ? 'Volver' : 'Back',
    all: language === 'es' ? 'Todas' : 'All',
    movies: language === 'es' ? 'Películas' : 'Movies',
    shows: language === 'es' ? 'Series' : 'TV Shows',
    searchPlaceholder: language === 'es' ? 'Buscar en favoritos...' : 'Search favorites...',
    emptySearch: language === 'es' ? 'Ningún favorito coincide con tu búsqueda' : 'No favorites match your search',
    emptyType: language === 'es' ? 'No tienes favoritos de este tipo' : 'No favorites of this type',
    exploreCta: language === 'es' ? 'Explorar contenido' : 'Explore content',
    titles: {
      all: language === 'es' ? 'Todos los favoritos' : 'All Favorites',
      movie: language === 'es' ? 'Películas favoritas' : 'Favorite Movies',
      tv: language === 'es' ? 'Series favoritas' : 'Favorite Shows',
    },
  };

  const pageTitle = t.titles[activeTab];

  const tabClass = (tab: TabType) =>
    `px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
      activeTab === tab
        ? 'bg-white text-black'
        : 'bg-white/10 text-white/70 hover:bg-white/20'
    }`;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">{pageTitle}</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button className={tabClass('all')} onClick={() => setTab('all')}>{t.all}</button>
        <button className={tabClass('movie')} onClick={() => setTab('movie')}>{t.movies}</button>
        <button className={tabClass('tv')} onClick={() => setTab('tv')}>{t.shows}</button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder={t.searchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center text-center gap-4 mt-12">
          <Heart className="h-10 w-10 text-muted-foreground" />
          <p className="text-muted-foreground">{query ? t.emptySearch : t.emptyType}</p>
          {!query && (
            <Button onClick={() => navigate('/explore')}>{t.exploreCta}</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map((fav) => (
            <MediaCard
              key={`${fav.id}-${fav.type}`}
              media={favoriteToMedia(fav)}
              onClick={() => navigate(`/details/${fav.type}/${fav.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesList;
