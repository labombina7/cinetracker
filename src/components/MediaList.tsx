
import React, { memo, useEffect } from 'react';
import { Media } from '@/types/media';
import MediaCard from './MediaCard';
import { useNavigate } from 'react-router-dom';

interface MediaListProps {
  title?: React.ReactNode;
  mediaList: Media[];
}

const MediaList: React.FC<MediaListProps> = memo(({ title, mediaList }) => {
  const navigate = useNavigate();

  // Debug the mediaList contents to help identify problems
  useEffect(() => {
    if (mediaList.length > 0) {
      const sampleItems = mediaList.slice(0, 2).map(item => ({
        id: item.id,
        title: item.title,
        type: item.type,
        hasGenres: item.genres?.length > 0,
        hasGenreIds: item.genre_ids?.length > 0,
        genreIds: item.genre_ids,
      }));
      console.log('MediaList sample items:', sampleItems);
    }
  }, [mediaList]);

  const handleMediaClick = (media: Media) => {
    navigate(`/details/${media.type}/${media.id}`, { state: { from: 'home' } });
  };

  return (
    <div className="mb-8">
      {title && <h2 className="text-lg md:text-xl font-bold mb-4">{title}</h2>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {mediaList.map((media) => (
          <MediaCard 
            key={`${media.id}-${media.type}`} 
            media={media} 
            onClick={() => handleMediaClick(media)}
          />
        ))}
      </div>
    </div>
  );
});

MediaList.displayName = 'MediaList';

export default MediaList;
