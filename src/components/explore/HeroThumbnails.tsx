import React, { useRef } from 'react';
import { Media } from '@/types/media';
import { getPosterUrl } from '@/services/tmdb/utils';

interface HeroThumbnailsProps {
  items: Media[];
  activeIndex: number;
  onSelect: (index: number) => void;
}

const HeroThumbnails: React.FC<HeroThumbnailsProps> = ({ items, activeIndex, onSelect }) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(index);
    }
  };

  // Touch swipe support
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      const next = diff > 0
        ? Math.min(activeIndex + 1, items.length - 1)
        : Math.max(activeIndex - 1, 0);
      onSelect(next);
    }
  };

  return (
    <div
      ref={rowRef}
      className="flex gap-3 overflow-x-auto scrollbar-hide pb-1"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="listbox"
      aria-label="Seleccionar estreno"
    >
      {items.map((item, i) => (
        <button
          key={item.id}
          role="option"
          aria-selected={i === activeIndex}
          tabIndex={0}
          onClick={() => onSelect(i)}
          onKeyDown={e => handleKeyDown(e, i)}
          className={`shrink-0 w-12 h-18 rounded overflow-hidden transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white ${
            i === activeIndex
              ? 'ring-2 ring-white scale-105'
              : 'opacity-60 hover:opacity-90'
          }`}
          style={{ height: '72px' }}
        >
          <img
            src={getPosterUrl(item.posterPath, 'small')}
            alt={item.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </button>
      ))}
    </div>
  );
};

export default HeroThumbnails;
