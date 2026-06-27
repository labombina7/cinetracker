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
        variant="outline"
        className={`rounded-full p-2 h-10 w-10 ${isFavorite ? 'bg-red-500/10' : ''}`}
        onClick={onToggle}
        aria-label={ariaLabel}
      >
        <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
      </Button>
    );
  }

  return (
    <Button
      onClick={onToggle}
      variant="outline"
      aria-label={ariaLabel}
      className={`w-full ${
        isFavorite
          ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
          : 'bg-foreground hover:bg-foreground/90 text-background'
      }`}
    >
      <Heart className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
      {actionText}
    </Button>
  );
};

export default FavoriteButton;
