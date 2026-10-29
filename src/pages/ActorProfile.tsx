import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { differenceInYears, format } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { AlertTriangle, CalendarIcon, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import MediaCard from '@/components/MediaCard';
import MediaDetailHeader from '@/components/media/MediaDetailHeader';
import { TMDB_CONFIG } from '@/config/tmdb.config';
import { useActorProfile } from '@/hooks/useActorProfile';
import { useLanguage } from '@/hooks/useLanguage';
import { actorProfileTranslations } from '@/utils/translations/actorProfile';

const ActorProfileSkeleton = () => (
  <div className="container mx-auto px-4 py-6">
    <div className="flex flex-col md:flex-row gap-8 mt-10">
      <Skeleton className="w-[200px] md:w-[260px] aspect-[2/3] shrink-0 rounded-lg mx-auto md:mx-0" />
      <div className="flex-1 space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-28 w-full" />
      </div>
    </div>
    <Skeleton className="h-7 w-40 mt-10 mb-4" />
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="w-[160px] h-[240px] rounded-lg flex-shrink-0" />
      ))}
    </div>
  </div>
);

const ActorProfile = () => {
  const { actorId } = useParams<{ actorId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = actorProfileTranslations[language];
  const { actor, credits, status, retry } = useActorProfile(Number(actorId), language);

  const [bioExpanded, setBioExpanded] = useState(false);
  const [bioOverflows, setBioOverflows] = useState(false);
  const bioRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setBioExpanded(false);
  }, [actorId]);

  // Solo se ofrece "Leer más" si el texto realmente no cabe en 4 líneas
  useLayoutEffect(() => {
    const el = bioRef.current;
    if (el && !bioExpanded) setBioOverflows(el.scrollHeight > el.clientHeight + 1);
  }, [actor, bioExpanded]);

  if (status === 'loading') return <ActorProfileSkeleton />;

  if (status === 'notFound' || status === 'error' || !actor) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center gap-4">
          <AlertTriangle size={48} className="text-red-500" />
          <p className="font-medium">{status === 'error' ? t.errorLoading : t.notFound}</p>
          <div className="flex gap-2">
            {status === 'error' && <Button onClick={retry}>{t.retry}</Button>}
            <Button variant="outline" onClick={() => navigate(-1)}>{t.back}</Button>
          </div>
        </div>
      </div>
    );
  }

  const locale = language === 'es' ? es : enUS;
  const formatDate = (date: string) => format(new Date(date), language === 'es' ? "d 'de' MMMM 'de' yyyy" : 'MMMM d, yyyy', { locale });
  const age = actor.birthday
    ? differenceInYears(actor.deathday ? new Date(actor.deathday) : new Date(), new Date(actor.birthday))
    : null;

  return (
    <div className="container mx-auto px-4 py-0">
      <div className="relative mb-6">
        <MediaDetailHeader backdropPath={credits[0]?.backdropPath ?? ''} />
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/4 shrink-0">
          <div className="w-[200px] md:w-full mx-auto overflow-hidden rounded-lg bg-muted aspect-[2/3] shadow-lg">
            {actor.profilePath ? (
              <img
                src={`${TMDB_CONFIG.IMAGE_BASE_URL}/h632${actor.profilePath}`}
                alt={actor.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        <div className="md:w-3/4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{actor.name}</h1>

          <div className="flex flex-col gap-2 mb-6 text-sm">
            {actor.birthday && (
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <span>
                  {t.born}: {formatDate(actor.birthday)}
                  {!actor.deathday && age !== null && ` (${age} ${t.years})`}
                </span>
              </div>
            )}
            {actor.deathday && (
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <span>
                  {t.died}: {formatDate(actor.deathday)}
                  {age !== null && ` (${age} ${t.years})`}
                </span>
              </div>
            )}
            {actor.placeOfBirth && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{actor.placeOfBirth}</span>
              </div>
            )}
          </div>

          <h2 className="text-xl font-semibold mb-2">{t.biography}</h2>
          {actor.biography ? (
            <>
              <p
                ref={bioRef}
                className={`text-sm leading-relaxed whitespace-pre-line text-gray-300 ${bioExpanded ? '' : 'line-clamp-4'}`}
              >
                {actor.biography}
              </p>
              {(bioOverflows || bioExpanded) && (
                <button
                  type="button"
                  onClick={() => setBioExpanded((v) => !v)}
                  className="mt-2 text-sm font-medium text-primary hover:underline"
                  aria-expanded={bioExpanded}
                >
                  {bioExpanded ? t.readLess : t.readMore}
                </button>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{t.noBiography}</p>
          )}
        </div>
      </div>

      <section className="mt-10 mb-10">
        <h2 className="text-lg md:text-xl font-bold mb-4">{t.knownFor}</h2>
        {credits.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.noCredits}</p>
        ) : (
          <Carousel opts={{ align: 'start', dragFree: true }} className="w-full">
            <CarouselContent className="-ml-3">
              {credits.map((item) => (
                <CarouselItem
                  key={`${item.type}-${item.id}`}
                  className="pl-3 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
                >
                  <MediaCard media={item} onClick={() => navigate(`/details/${item.type}/${item.id}`)} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex -left-4" />
            <CarouselNext className="hidden md:flex -right-4" />
          </Carousel>
        )}
      </section>
    </div>
  );
};

export default ActorProfile;
