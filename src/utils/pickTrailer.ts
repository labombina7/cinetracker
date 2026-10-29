import { Video } from '@/types/media';

// Prioridad: tráiler oficial en el idioma de la app > tráiler en el idioma > tráiler oficial en inglés
// > cualquier tráiler > teaser (mismo orden de idioma)
const score = (video: Video, language: string): number => {
  const typeScore = video.type === 'Trailer' ? 100 : video.type === 'Teaser' ? 10 : 0;
  if (typeScore === 0) return 0;
  const languageScore = video.language === language ? 4 : video.language === 'en' ? 2 : 0;
  return typeScore + languageScore + (video.official ? 1 : 0);
};

export const pickTrailer = (videos: Video[], language: string): Video | null => {
  let best: Video | null = null;
  let bestScore = 0;
  for (const video of videos) {
    const s = score(video, language);
    if (s > bestScore) {
      best = video;
      bestScore = s;
    }
  }
  return best;
};

export const youtubeThumbnail = (key: string) => `https://img.youtube.com/vi/${key}/mqdefault.jpg`;

export const youtubeEmbedUrl = (key: string) =>
  `https://www.youtube-nocookie.com/embed/${key}?autoplay=1&rel=0`;
