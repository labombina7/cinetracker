
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getBackdropUrl } from '@/services/tmdb/index';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MediaDetailHeaderProps {
  backdropPath: string;
}

const MediaDetailHeader: React.FC<MediaDetailHeaderProps> = ({ backdropPath }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (isMobile) {
    return null;
  }

  return (
    <div className="relative">
      <div className="absolute top-0 left-0 right-0 h-[300px] overflow-hidden rounded-xl">
        {backdropPath && (
          <div 
            className="bg-cover bg-center h-full w-full"
            style={{ backgroundImage: `url(${getBackdropUrl(backdropPath)})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background"></div>
          </div>
        )}
      </div>
      
      <div className="relative z-10 pt-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate(-1)}
          className="mb-4 bg-transparent hover:bg-white/10 backdrop-blur-sm"
        >
          <ArrowLeft className="h-4 w-4 text-white" />
        </Button>
      </div>
      
      <div className="h-[250px]"></div>
    </div>
  );
};

export default MediaDetailHeader;
