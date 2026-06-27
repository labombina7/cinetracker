import React, { useState } from 'react';
import { Monitor, Play, Video, Apple } from 'lucide-react';
import { Platform } from '@/types/media';
import { TMDB_CONFIG } from '@/config/tmdb.config';
import { useLanguage } from '@/hooks/useLanguage';

interface PlatformFiltersProps {
  platforms: Platform[];
  loading: boolean;
  selectedPlatformIds: number[];
  onPlatformChange: (platformId: number) => void;
}

const getFallbackIcon = (platformName: string): React.ReactNode => {
  const name = platformName?.toLowerCase() || '';
  if (name.includes('netflix')) return <Play className="h-3 w-3" />;
  if (name.includes('amazon') || name.includes('prime')) return <Video className="h-3 w-3" />;
  if (name.includes('disney')) return <Monitor className="h-3 w-3" />;
  if (name.includes('hbo') || name.includes('max')) return <Monitor className="h-3 w-3" />;
  if (name.includes('apple')) return <Apple className="h-3 w-3" />;
  return <Monitor className="h-3 w-3" />;
};

const PlatformFilters: React.FC<PlatformFiltersProps> = ({
  platforms,
  loading,
  selectedPlatformIds,
}) => {
  const { language } = useLanguage();
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  if (loading || selectedPlatformIds.length === 0) return null;

  const activePlatforms = platforms.filter(
    p => p && p.id && selectedPlatformIds.includes(p.id)
  );

  if (activePlatforms.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground">
        {language === 'es' ? 'Plataformas activas' : 'Active platforms'}
      </span>
      {activePlatforms.map((platform) => {
        const hasLogo = !!platform.logoPath && !imageErrors.has(platform.id);
        const logoUrl = `${TMDB_CONFIG.IMAGE_BASE_URL}/w45${platform.logoPath}`;

        return (
          <div
            key={platform.id}
            title={platform.name}
            className="flex items-center justify-center h-6 w-6 rounded-sm bg-muted overflow-hidden"
          >
            {hasLogo ? (
              <img
                src={logoUrl}
                alt={platform.name}
                className="h-5 w-5 object-contain"
                loading="lazy"
                onError={() => setImageErrors(prev => new Set([...prev, platform.id]))}
              />
            ) : (
              <span className="text-muted-foreground">
                {getFallbackIcon(platform.name)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PlatformFilters;
