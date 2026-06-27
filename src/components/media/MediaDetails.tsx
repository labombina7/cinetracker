import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Media, CastMember } from '@/types/media';
import { fetchMediaDetails } from '@/services/tmdb/index';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { TMDB_CONFIG } from '@/config/tmdb.config';
import { useLanguage } from '@/hooks/useLanguage';
import { useFavorites } from '@/hooks/useFavorites';
import { mediaDetailTranslations } from '@/utils/translations/mediaDetail';
import MediaDetailHeader from './MediaDetailHeader';
import MediaContent from './MediaContent';
import MediaCastCarousel from './MediaCastCarousel';
import MediaDetailSkeleton from './MediaDetailSkeleton';
import MediaPoster from './MediaPoster';
import FavoriteButton from './FavoriteButton';

const MediaDetails = () => {
  const { id, type } = useParams<{ id: string; type: string }>();
  const [media, setMedia] = useState<Media | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { favorites, isFavorite: checkIsFavorite, toggleFavorite } = useFavorites();
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [cast, setCast] = useState<CastMember[]>([]);
  const [loadingCast, setLoadingCast] = useState(true);
  const t = mediaDetailTranslations[language];

  const fetchCast = async (mediaId: number, mediaType: 'movie' | 'tv') => {
    try {
      setLoadingCast(true);
      const url = `https://api.themoviedb.org/3/${mediaType}/${mediaId}/credits?api_key=${TMDB_CONFIG.API_KEY}&language=${language}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error fetching cast: ${response.status}`);
      }
      
      const data = await response.json();
      setCast(data.cast.slice(0, 20));
    } catch (error) {
      console.error('Error fetching cast:', error);
      setCast([]);
    } finally {
      setLoadingCast(false);
    }
  };

  const fetchData = async () => {
    if (!id || !type) return;
    
    try {
      setLoading(true);
      
      if (!TMDB_CONFIG.API_KEY) {
        console.error('Error: API key not found');
        toast({
          title: t.errorTitle,
          description: t.errorDescription,
          variant: "destructive",
        });
        setError(t.errorDescription);
        setLoading(false);
        navigate('/');
        return;
      }
      
      const mediaDetails = await fetchMediaDetails(Number(id), type as 'movie' | 'tv', language);
      
      if (!mediaDetails) {
        setError(t.notFound);
        setLoading(false);
        return;
      }
      
      setMedia(mediaDetails);
      setIsFavorite(checkIsFavorite(Number(id), type as 'movie' | 'tv'));

      fetchCast(Number(id), type as 'movie' | 'tv');
    } catch (err) {
      console.error('Error fetching media details:', err);
      
      if (err instanceof Error && err.message === 'API key not configured') {
        toast({
          title: t.errorTitle,
          description: t.errorDescription,
          variant: "destructive",
        });
        navigate('/');
      } else {
        setError(t.errorLoading);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    console.log('Opening media details, preserving search results in session');
  }, [id, type, favorites, language]);

  const handleFavoriteClick = () => {
    if (!media) return;
    toggleFavorite(media.id, media.type, media.title, media.releaseDate);
    setIsFavorite(!isFavorite);
  };

  if (loading) {
    return <MediaDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center text-center gap-4">
          <AlertTriangle size={48} className="text-red-500" />
          <div className="text-red-500 font-medium">{error}</div>
          <Button onClick={() => navigate('/')}>{t.back}</Button>
        </div>
      </div>
    );
  }

  if (!media) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">{t.notFound}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-0">
      <div className="relative mb-6">
        <MediaDetailHeader backdropPath={media.backdropPath} />
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <MediaPoster posterPath={media.posterPath} title={media.title} />
          <FavoriteButton
            isFavorite={isFavorite}
            onToggle={handleFavoriteClick}
            variant="full"
            mediaTitle={media.title}
          />
        </div>
        
        <div className="md:w-2/3">
          <MediaContent
            title={media.title}
            genres={media.genres}
            overview={media.overview}
            voteAverage={media.voteAverage}
            releaseDate={media.releaseDate}
            runtime={media.runtime}
            episodeRuntime={media.episodeRuntime}
            numberOfSeasons={media.numberOfSeasons}
            numberOfEpisodes={media.numberOfEpisodes}
            platform={media.platform}
            platforms={media.platforms}
            country={media.country}
            type={media.type}
            availableForRent={media.availableForRent}
            availableForPurchase={media.availableForPurchase}
          />
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">{t.actors}</h2>
            {loadingCast ? (
              <div className="text-gray-500">{t.loadingCast}</div>
            ) : cast.length > 0 ? (
              <MediaCastCarousel cast={cast} language={language} />
            ) : (
              <div className="text-gray-500">
                {language === 'es' 
                  ? 'No hay información disponible sobre el reparto.' 
                  : 'No cast information available.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaDetails;
