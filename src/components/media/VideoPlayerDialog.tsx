import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Video } from '@/types/media';
import { youtubeEmbedUrl } from '@/utils/pickTrailer';

interface VideoPlayerDialogProps {
  video: Video | null;
  onClose: () => void;
}

// El iframe solo existe mientras el diálogo está abierto: al cerrarlo se desmonta y el vídeo se detiene
const VideoPlayerDialog: React.FC<VideoPlayerDialogProps> = ({ video, onClose }) => (
  <Dialog open={video !== null} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="max-w-4xl w-[calc(100%-2rem)] p-0 overflow-hidden bg-black border-white/10 [&>button]:text-white [&>button]:opacity-90">
      <DialogTitle className="sr-only">{video?.name}</DialogTitle>
      {video && (
        <div className="aspect-video w-full">
          <iframe
            src={youtubeEmbedUrl(video.key)}
            title={video.name}
            className="w-full h-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      )}
    </DialogContent>
  </Dialog>
);

export default VideoPlayerDialog;
