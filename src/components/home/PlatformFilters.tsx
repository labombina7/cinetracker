
import React from 'react';
import { Button } from '@/components/ui/button';
import { Monitor, Play, Video, Apple } from 'lucide-react';
import { Platform } from '@/types/media';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';

interface PlatformFiltersProps {
  platforms: Platform[];
  loading: boolean;
  selectedPlatformIds: number[];
  onPlatformChange: (platformId: number) => void;
}

// Map platform names to icons
const getIconForPlatform = (platformName: string): React.ReactNode => {
  const name = platformName?.toLowerCase() || '';
  if (name.includes('netflix')) return <Play className="h-5 w-5" />;
  if (name.includes('amazon') || name.includes('prime')) return <Video className="h-5 w-5" />;
  if (name.includes('disney')) return <Monitor className="h-5 w-5" />;
  if (name.includes('hbo') || name.includes('max')) return <Monitor className="h-5 w-5" />;
  if (name.includes('apple')) return <Apple className="h-5 w-5" />;
  if (name.includes('movistar')) return <Video className="h-5 w-5" />;
  // Default icon
  return <Monitor className="h-5 w-5" />;
};

const PlatformFilters: React.FC<PlatformFiltersProps> = ({ 
  platforms, 
  loading, 
  selectedPlatformIds, 
  onPlatformChange 
}) => {
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="flex gap-2 flex-wrap">
        {[1, 2, 3, 4, 5].map((item) => (
          <Skeleton key={item} className="h-10 w-20" />
        ))}
      </div>
    );
  }

  // Ensure platforms is always an array
  const safePlatforms = Array.isArray(platforms) ? platforms : [];
  
  // Filter out any platforms that don't have an id or name
  const validPlatforms = safePlatforms.filter(
    platform => platform && typeof platform === 'object' && platform.id && platform.name
  );

  return (
    <div className="flex gap-2 flex-wrap">
      {validPlatforms.map((platform) => (
        <Button
          key={platform.id}
          variant={selectedPlatformIds.includes(platform.id) ? "default" : "outline"}
          size="sm"
          onClick={() => onPlatformChange(platform.id)}
          className={`flex items-center gap-2 ${isMobile ? 'px-3 py-1' : ''}`}
        >
          {getIconForPlatform(platform.name)}
          <span className={isMobile ? "hidden" : "hidden sm:inline"}>{platform.name}</span>
        </Button>
      ))}
    </div>
  );
};

export default PlatformFilters;
