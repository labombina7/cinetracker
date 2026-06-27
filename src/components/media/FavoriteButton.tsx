import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  variant?: 'icon' | 'full';
  mediaTitle?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  isFavorite,
  onToggle,
  variant = 'full',
  mediaTitle,
}) => {
  const actionText = isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos';
  const ariaLabel = mediaTitle
    ? `${actionText}: ${mediaTitle}`
    : actionText;

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={`rounded-full backdrop-blur-sm border border-white/15 h-10 w-10 ${
          isFavorite
            ? 'bg-red-500/30 hover:bg-red-500/40 text-red-400 border-red-500/30'
            : 'bg-black/30 hover:bg-black/50 text-white'
        }`}
        onClick={onToggle}
        aria-label={ariaLabel}
      >
        <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-400 text-red-400' : ''}`} />
      </Button>
    );
  }

  return (
    <Button
      onClick={onToggle}
      variant="outline"
      aria-label={ariaLabel}
      className={`w-full border-white/20 ${
        isFavorite
          ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30'
          : 'bg-white/10 hover:bg-white/20 text-white'
      }`}
    >
      <Heart className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
      {actionText}
    </Button>
  );
};

export default FavoriteButton;
