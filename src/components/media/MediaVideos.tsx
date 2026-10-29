import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { Video } from '@/types/media';
import { youtubeThumbnail } from '@/utils/pickTrailer';
import VideoPlayerDialog from './VideoPlayerDialog';

interface MediaVideosProps {
  videos: Video[];
  title: string;
  typeLabels: Record<string, string>;
}

const MediaVideos: React.FC<MediaVideosProps> = ({ videos, title, typeLabels }) => {
  const [playing, setPlaying] = useState<Video | null>(null);

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {videos.map((video) => (
          <button
            key={video.key}
            type="button"
            onClick={() => setPlaying(video)}
            className="shrink-0 w-56 text-left group"
            aria-label={video.name}
          >
            <div className="relative overflow-hidden rounded-md bg-muted aspect-video">
              <img
                src={youtubeThumbnail(video.key)}
                alt=""
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                <Play className="h-8 w-8 text-white fill-white" />
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{typeLabels[video.type] ?? video.type}</p>
            <p className="text-sm font-medium line-clamp-2">{video.name}</p>
          </button>
        ))}
      </div>
      <VideoPlayerDialog video={playing} onClose={() => setPlaying(null)} />
    </div>
  );
};

export default MediaVideos;
