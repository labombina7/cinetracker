import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { fetchTraktRatings } from '@/services/trakt/index';
import { TraktRatings } from '@/services/trakt/ratings';

interface MediaRatingsProps {
  tmdbId: number;
  type: 'movie' | 'tv';
  voteAverage: number;
  voteCount?: number;
  language: 'es' | 'en';
  labels: { votes: string; yourRating: string };
}

const formatVotes = (votes: number, language: 'es' | 'en') =>
  new Intl.NumberFormat(language === 'es' ? 'es-ES' : 'en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(votes);

const Rating: React.FC<{ source: string; value: number; votes?: number; language: 'es' | 'en'; votesLabel: string }> = ({
  source,
  value,
  votes,
  language,
  votesLabel
}) => (
  <span className="flex items-center gap-1.5 text-sm">
    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
    <span className="font-semibold text-yellow-400">{value.toFixed(1)}</span>
    <span className="text-xs text-muted-foreground">
      {source}
      {votes ? ` · ${formatVotes(votes, language)} ${votesLabel}` : ''}
    </span>
  </span>
);

const MediaRatings: React.FC<MediaRatingsProps> = ({ tmdbId, type, voteAverage, voteCount, language, labels }) => {
  const [trakt, setTrakt] = useState<TraktRatings | null>(null);

  useEffect(() => {
    let cancelled = false;
    setTrakt(null);
    fetchTraktRatings(tmdbId, type).then((result) => {
      if (!cancelled) setTrakt(result);
    });
    return () => {
      cancelled = true;
    };
  }, [tmdbId, type]);

  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4">
      {voteCount ? (
        <Rating source="TMDB" value={voteAverage} votes={voteCount} language={language} votesLabel={labels.votes} />
      ) : null}
      {trakt?.community && (
        <Rating
          source="Trakt"
          value={trakt.community.rating}
          votes={trakt.community.votes}
          language={language}
          votesLabel={labels.votes}
        />
      )}
      {trakt?.user != null && (
        <span className="text-sm px-2.5 py-0.5 rounded-full bg-yellow-400/15 text-yellow-400 font-medium">
          {labels.yourRating}: {trakt.user}/10
        </span>
      )}
    </div>
  );
};

export default MediaRatings;
