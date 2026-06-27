import React, { useRef, useEffect } from 'react';
import { Genre } from '@/types/media';
import { useLanguage } from '@/hooks/useLanguage';

interface GenreChipsProps {
  genres: Genre[];
  selectedGenreId: number | null;
  onSelect: (genreId: number | null) => void;
  loading: boolean;
}

const SKELETON_COUNT = 6;

const GenreChips: React.FC<GenreChipsProps> = ({ genres, selectedGenreId, onSelect, loading }) => {
  const { language } = useLanguage();
  const rowRef = useRef<HTMLDivElement>(null);
  const activeChipRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to active chip when selection changes programmatically
  useEffect(() => {
    if (activeChipRef.current && rowRef.current) {
      activeChipRef.current.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    }
  }, [selectedGenreId]);

  const allLabel = language === 'es' ? 'Todos' : 'All';

  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <div
            key={i}
            className="h-8 rounded-full bg-muted animate-pulse shrink-0"
            style={{ width: `${60 + (i % 3) * 20}px` }}
          />
        ))}
      </div>
    );
  }

  if (genres.length === 0) return null;

  return (
    <div
      ref={rowRef}
      className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
    >
      <button
        ref={selectedGenreId === null ? activeChipRef : undefined}
        onClick={() => onSelect(null)}
        className={`shrink-0 px-3 h-8 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
          selectedGenreId === null
            ? 'bg-yellow-400 text-black'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        }`}
      >
        {allLabel}
      </button>

      {genres.map(genre => (
        <button
          key={genre.id}
          ref={selectedGenreId === genre.id ? activeChipRef : undefined}
          onClick={() => onSelect(genre.id)}
          className={`shrink-0 px-3 h-8 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
            selectedGenreId === genre.id
              ? 'bg-yellow-400 text-black'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          {genre.name}
        </button>
      ))}
    </div>
  );
};

export default GenreChips;
