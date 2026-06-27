
import React from 'react';
import { CalendarIcon, Clock, Film, Tv, ShoppingCart, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Platform } from '@/types/media';
import { TMDB_CONFIG } from '@/config/tmdb.config';

interface MediaInfoProps {
  voteAverage: number;
  releaseDate?: string;
  runtime?: number | null;
  episodeRuntime?: number | null;
  numberOfSeasons?: number;
  numberOfEpisodes?: number | null;
  platform?: { 
    name: string;
  };
  platforms?: Platform[];
  type: 'movie' | 'tv';
  availableForRent?: boolean;
  availableForPurchase?: boolean;
}

const MediaInfo: React.FC<MediaInfoProps> = ({
  voteAverage,
  releaseDate,
  runtime,
  episodeRuntime,
  numberOfSeasons,
  numberOfEpisodes,
  platform,
  platforms,
  type,
  availableForRent,
  availableForPurchase
}) => {
  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'd MMMM yyyy', { locale: es });
    } catch (error) {
      return date;
    }
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  };
  
  // Para mostrar las plataformas disponibles con iconos
  const renderPlatforms = () => {
    if (platforms && platforms.length > 0) {
      return (
        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-2">Disponible en:</h3>
          <div className="flex flex-wrap gap-2">
            {platforms.map((p, index) => (
              <div 
                key={`${p.id}-${index}`} 
                className="flex items-center gap-1 text-xs bg-white/10 text-white rounded px-2 py-1"
              >
                {p.logoPath && (
                  <img 
                    src={`${TMDB_CONFIG.IMAGE_BASE_URL}/w45${p.logoPath}`}
                    alt={p.name}
                    className="w-4 h-4 object-contain rounded-sm"
                  />
                )}
                <span>{p.name}</span>
                {p.type && (
                  <span className="text-[10px] ml-1 flex items-center">
                    {p.type === 'subscription' ? '(Suscripción)' : 
                     p.type === 'rent' ? (<><CreditCard className="h-2 w-2 mr-1" />Alquiler</>) : 
                     p.type === 'buy' ? (<><ShoppingCart className="h-2 w-2 mr-1" />Compra</>) : ''}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    } 
    
    // Si no hay plataformas en el nuevo formato pero hay en el antiguo
    if (platform && platform.name && platform.name !== 'Varias plataformas') {
      return (
        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-2">Disponible en:</h3>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1 text-xs bg-white/10 text-white rounded px-2 py-1">
              <span>{platform.name}</span>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  const subscriptionPlatforms = platforms?.filter(p => p.type === 'subscription') ?? [];

  return (
    <div className="mb-6">
      {/* Rating + plataformas de suscripción */}
      <div className="flex items-center justify-between mb-4">
        <div className="bg-yellow-500/90 text-black font-bold text-sm px-2 py-1 rounded">
          {voteAverage.toFixed(1)}
        </div>
        {subscriptionPlatforms.length > 0 && (
          <div className="flex items-center gap-1.5">
            {subscriptionPlatforms.slice(0, 5).map((p, i) => (
              <img
                key={`${p.id}-${i}`}
                src={`${TMDB_CONFIG.IMAGE_BASE_URL}/w45${p.logoPath}`}
                alt={p.name}
                title={p.name}
                className="w-8 h-8 rounded-lg border border-white/20 object-cover"
              />
            ))}
          </div>
        )}
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {releaseDate && (
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{formatDate(releaseDate)}</span>
          </div>
        )}

        {type === 'movie' && runtime && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{formatRuntime(runtime)}</span>
          </div>
        )}

        {/* Solo mostrar duración de episodio si es mayor que 0 */}
        {type === 'tv' && episodeRuntime && episodeRuntime > 0 && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{formatRuntime(episodeRuntime)} / ep</span>
          </div>
        )}

        {type === 'tv' && numberOfEpisodes && (
          <div className="flex items-center gap-2">
            <Tv className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{numberOfEpisodes} episodios</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {type === 'movie' ? (
            <>
              <Film className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Película</span>
            </>
          ) : (
            <>
              <Tv className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Serie{numberOfSeasons ? ` · ${numberOfSeasons} temp.` : ''}</span>
            </>
          )}
        </div>
      </div>

      {/* Plataformas disponibles con iconos */}
      {renderPlatforms()}

      {/* Disponibilidad adicional */}
      {(availableForRent || availableForPurchase) && (
        <div className="mt-3 text-xs text-gray-500 flex flex-col gap-1">
          {availableForRent && (
            <div className="flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              <span>Disponible para alquilar</span>
            </div>
          )}
          {availableForPurchase && (
            <div className="flex items-center gap-1">
              <ShoppingCart className="h-3 w-3" />
              <span>Disponible para comprar</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaInfo;
