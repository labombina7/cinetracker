import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Video } from '@/types/media';
import VideoPlayerDialog from './VideoPlayerDialog';

interface TrailerButtonProps {
  trailer: Video;
  label: string;
}

const TrailerButton: React.FC<TrailerButtonProps> = ({ trailer, label }) => {
  const [playing, setPlaying] = useState<Video | null>(null);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full backdrop-blur-sm border border-white/15 h-10 w-10 bg-black/30 hover:bg-black/50 text-white"
        onClick={() => setPlaying(trailer)}
        aria-label={label}
        title={label}
      >
        <Play className="h-5 w-5 fill-white" />
      </Button>
      <VideoPlayerDialog video={playing} onClose={() => setPlaying(null)} />
    </>
  );
};

export default TrailerButton;
