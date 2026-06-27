
import React from 'react';
import { getPosterUrl } from '@/services/tmdb/index';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface MediaPosterProps {
  posterPath: string;
  title: string;
}

const MediaPoster: React.FC<MediaPosterProps> = ({ posterPath, title }) => {
  return (
    <div className="w-full">
      <AspectRatio ratio={2/3} className="overflow-hidden rounded-lg shadow-lg">
        <img
          src={getPosterUrl(posterPath, 'large')}
          alt={title}
          className="w-full h-full object-cover"
        />
      </AspectRatio>
    </div>
  );
};

export default MediaPoster;
