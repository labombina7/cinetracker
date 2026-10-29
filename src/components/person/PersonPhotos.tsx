import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { TMDB_CONFIG } from '@/config/tmdb.config';

interface PersonPhotosProps {
  photos: string[];
  name: string;
  title: string;
}

const PersonPhotos: React.FC<PersonPhotosProps> = ({ photos, name, title }) => {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section className="mt-10">
      <h2 className="text-lg md:text-xl font-bold mb-4">{title}</h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {photos.map((path, i) => (
          <button
            key={path}
            type="button"
            onClick={() => setOpen(path)}
            className="shrink-0 w-24 aspect-[2/3] rounded-md overflow-hidden bg-muted hover:opacity-80 transition-opacity"
            aria-label={`${name} — ${i + 1}`}
          >
            <img
              src={`${TMDB_CONFIG.IMAGE_BASE_URL}/w185${path}`}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </button>
        ))}
      </div>
      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-md p-0 overflow-hidden bg-black border-white/10 [&>button]:text-white">
          <DialogTitle className="sr-only">{name}</DialogTitle>
          {open && <img src={`${TMDB_CONFIG.IMAGE_BASE_URL}/h632${open}`} alt={name} className="w-full h-auto" />}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default PersonPhotos;
