import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Media } from '@/types/media';
import { useEditorialCarousel, CarouselConfig } from '@/hooks/useEditorialCarousel';
import { Skeleton } from '@/components/ui/skeleton';
import MediaCard from '@/components/MediaCard';
import { useLanguage } from '@/hooks/useLanguage';

interface EditorialSectionProps {
  config: CarouselConfig;
  overridePlatformIds?: number[];
  onShowMore?: () => void;
}

const CARD_WIDTH = 'w-[160px] sm:w-[180px] md:w-[200px]';
const SKELETON_COUNT = 5;

const EditorialSection: React.FC<EditorialSectionProps> = ({ config, overridePlatformIds, onShowMore }) => {
  const { media, loading, hasLoaded, sectionRef } = useEditorialCarousel(config, overridePlatformIds);
  const navigate = useNavigate();
  const { language } = useLanguage();

  const title = language === 'es' ? config.titleEs : config.titleEn;
  const isEmpty = hasLoaded && !loading && media.length === 0;

  const handleClick = (item: Media) => {
    navigate(`/details/${item.type}/${item.id}`, { state: { from: 'explore' } });
  };

  const handleShowMore = () => {
    onShowMore?.();
  };

  return (
    <div ref={sectionRef} className={`mb-10 ${isEmpty ? 'hidden' : ''}`}>
      <h2 className="text-lg md:text-xl font-bold mb-4">{title}</h2>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {loading
          ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <Skeleton
                key={i}
                className={`${CARD_WIDTH} aspect-[2/3] rounded-lg flex-shrink-0`}
              />
            ))
          : (
            <>
              {media.map(item => (
                <div
                  key={`${item.id}-${item.type}`}
                  className={`${CARD_WIDTH} flex-shrink-0`}
                >
                  <MediaCard media={item} onClick={() => handleClick(item)} />
                </div>
              ))}

              {/* Ver más */}
              {media.length > 0 && (
                <button
                  onClick={handleShowMore}
                  className="flex-shrink-0 w-[120px] flex flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-sm text-muted-foreground hover:text-foreground"
                  style={{ alignSelf: 'stretch' }}
                >
                  <ChevronRight className="h-6 w-6" />
                  <span className="text-xs font-medium">
                    {language === 'es' ? 'Ver más' : 'See more'}
                  </span>
                </button>
              )}
            </>
          )}
      </div>
    </div>
  );
};

export default EditorialSection;
