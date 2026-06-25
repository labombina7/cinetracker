
import React from 'react';
import { Badge } from '@/components/ui/badge';
import MediaInfo from './MediaInfo';
import { Genre, Platform } from '@/types/media';

interface MediaContentProps {
  title: string;
  tagline?: string;
  genres: Genre[];
  overview: string;
  voteAverage: number;
  releaseDate?: string;
  runtime?: number | null;
  episodeRuntime?: number | null;
  numberOfSeasons?: number;
  numberOfEpisodes?: number | null;
  platform?: {
    name: string;
  };
  platforms?: Platform[];
  country?: string;
  type: 'movie' | 'tv';
  availableForRent?: boolean;
  availableForPurchase?: boolean;
}

const MediaContent: React.FC<MediaContentProps> = ({
  title,
  tagline,
  genres,
  overview,
  voteAverage,
  releaseDate,
  runtime,
  episodeRuntime,
  numberOfSeasons,
  numberOfEpisodes,
  platform,
  platforms,
  country,
  type,
  availableForRent,
  availableForPurchase
}) => {
  // Filter out any invalid or empty genres
  const validGenres = genres.filter(genre => genre && genre.id && genre.name);
  
  return (
    <div className="flex-1">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{title}</h1>
        {tagline && (
          <p className="text-muted-foreground italic mb-3">{tagline}</p>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Only render valid genres with names */}
        {validGenres.length > 0 && validGenres.map((genre) => (
          <Badge key={genre.id} variant="secondary" className="text-xs">
            {genre.name}
          </Badge>
        ))}
        {country === 'ES' && (
          <Badge variant="outline" className="text-xs bg-red-500/90 text-white">
            ES
          </Badge>
        )}
      </div>
      
      <MediaInfo
        voteAverage={voteAverage}
        releaseDate={releaseDate}
        runtime={runtime}
        episodeRuntime={episodeRuntime}
        numberOfSeasons={numberOfSeasons}
        numberOfEpisodes={numberOfEpisodes}
        platform={platform}
        platforms={platforms}
        type={type}
        availableForRent={availableForRent}
        availableForPurchase={availableForPurchase}
      />
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Sinopsis</h2>
        <p className="text-sm md:text-base">{overview || 'No hay sinopsis disponible.'}</p>
      </div>
    </div>
  );
};

export default MediaContent;
