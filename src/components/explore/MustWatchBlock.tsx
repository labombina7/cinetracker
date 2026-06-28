import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useMustWatch } from '@/hooks/useMustWatch';
import { useLanguage } from '@/hooks/useLanguage';
import { Skeleton } from '@/components/ui/skeleton';
import MediaCard from '@/components/MediaCard';

interface MustWatchBlockProps {
  mediaType: 'all' | 'movie' | 'tv';
}

const SKELETON_COUNT = 4;

const MustWatchBlock: React.FC<MustWatchBlockProps> = ({ mediaType }) => {
  const { media, loading } = useMustWatch(mediaType);
  const navigate = useNavigate();
  const { language } = useLanguage();

  if (!loading && media.length === 0) return null;

  const title = language === 'es' ? 'No te puedes perder' : 'Must Watch';
  const subtitle = language === 'es'
    ? 'Lo mejor valorado de todos los tiempos'
    : 'The highest-rated of all time';

  return (
    <div className="my-10 rounded-2xl overflow-hidden border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 via-background to-background">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center gap-2">
        <Star size={18} className="text-yellow-400 fill-yellow-400" />
        <div>
          <h2 className="text-lg md:text-xl font-bold text-white leading-tight">{title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Cards */}
      <div className="px-5 pb-5">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {loading
            ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="w-[160px] sm:w-[180px] md:w-[200px] aspect-[2/3] rounded-lg flex-shrink-0"
                />
              ))
            : media.map(item => (
                <div
                  key={`${item.id}-${item.type}`}
                  className="w-[160px] sm:w-[180px] md:w-[200px] flex-shrink-0"
                >
                  <MediaCard
                    media={item}
                    onClick={() => navigate(`/details/${item.type}/${item.id}`, { state: { from: 'explore' } })}
                  />
                </div>
              ))
          }
        </div>
      </div>
    </div>
  );
};

export default MustWatchBlock;
