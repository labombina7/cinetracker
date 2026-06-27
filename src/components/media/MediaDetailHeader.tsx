import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getBackdropUrl } from '@/services/tmdb/index';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/hooks/useLanguage';

interface MediaDetailHeaderProps {
  backdropPath: string;
}

const MediaDetailHeader: React.FC<MediaDetailHeaderProps> = ({ backdropPath }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { language } = useLanguage();

  const backLabel = language === 'es' ? 'Volver' : 'Go back';

  return (
    <>
      {/* Full-viewport backdrop — shared by mobile and desktop */}
      {backdropPath && (
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-top"
            style={{ backgroundImage: `url(${getBackdropUrl(backdropPath)})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-background/85 to-background" />
        </div>
      )}

      {isMobile ? (
        <div className="fixed top-20 left-4 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label={backLabel}
            className="rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/15 text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="relative pt-6 ml-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full bg-black/25 hover:bg-black/45 backdrop-blur-sm border border-white/15"
            aria-label={backLabel}
          >
            <ArrowLeft className="h-4 w-4 text-white" />
          </Button>
        </div>
      )}

      {!isMobile && <div className="h-4" />}
    </>
  );
};

export default MediaDetailHeader;
