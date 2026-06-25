
import React from 'react';
import { Media } from '@/types/media';
import { mediaDetailTranslations } from '@/utils/translations/mediaDetail';
import { MonitorPlay } from 'lucide-react';

interface MediaAdditionalInfoProps {
  media: Media;
  language: 'en' | 'es';
}

const MediaAdditionalInfo: React.FC<MediaAdditionalInfoProps> = ({ media, language }) => {
  const t = mediaDetailTranslations[language];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">{t.additionalInfo}</h2>
      <p>
        <strong>{t.type[media.type as 'movie' | 'tv']}:</strong> {t.type[media.type as 'movie' | 'tv']}
      </p>
      {media.releaseDate && (
        <p>
          <strong>{t.releaseDate}:</strong> {media.releaseDate}
        </p>
      )}
      {media.runtime && media.type === 'movie' && (
        <p>
          <strong>{t.runtime}:</strong> {media.runtime} {t.minutes}
        </p>
      )}
      {media.episodeRuntime && media.type === 'tv' && (
        <p>
          <strong>{t.episodeRuntime}:</strong> {media.episodeRuntime} {t.minutes}
        </p>
      )}
      {media.numberOfEpisodes && media.type === 'tv' && (
        <p>
          <strong>{t.episodes}:</strong> {media.numberOfEpisodes}
        </p>
      )}
      {media.platform && media.platform.name !== 'Unknown' && (
        <p className="flex items-center">
          <strong>{t.platform}:</strong> 
          <span className="ml-2 flex items-center">
            <MonitorPlay className="h-4 w-4 mr-1" />
            {media.platform.name}
          </span>
        </p>
      )}
      {media.availableForRent && (
        <p>
          <strong>{t.availableForRent}</strong>
        </p>
      )}
      {media.availableForPurchase && (
        <p>
          <strong>{t.availableForPurchase}</strong>
        </p>
      )}
    </div>
  );
};

export default MediaAdditionalInfo;
