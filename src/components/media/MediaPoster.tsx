
import React from 'react';
import { getPosterUrl } from '@/services/tmdb/index';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface MediaPosterProps {
  posterPath: string;
  title: string;
}

const MediaPoster: React.FC<MediaPosterProps> = ({ posterPath, title }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="w-full relative">
      <AspectRatio ratio={2/3} className="overflow-hidden rounded-lg shadow-lg">
        <img 
          src={getPosterUrl(posterPath, 'large')}
          alt={title}
          className="w-full h-full object-cover"
        />
      </AspectRatio>
      
      {isMobile && (
        <div className="absolute top-4 left-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-transparent"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default MediaPoster;
