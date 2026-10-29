

import { Media, Video } from '../../types/media';
import { buildApiUrl } from './config';
import { cachedFetch } from './apiCache';

interface TMDBVideo {
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  iso_639_1: string;
  published_at?: string;
}

const mapVideos = (results: TMDBVideo[] = []): Video[] =>
  results
    .filter((v) => v.site === 'YouTube' && v.key)
    .map((v) => ({
      key: v.key,
      name: v.name,
      type: v.type,
      official: v.official,
      language: v.iso_639_1,
      publishedAt: v.published_at
    }));

// Vídeos de una temporada concreta (los tráileres de series suelen colgarse aquí)
export const fetchSeasonVideos = async (tvId: number, seasonNumber: number, language: string = 'es'): Promise<Video[]> => {
  try {
    const url = buildApiUrl(`/tv/${tvId}/season/${seasonNumber}/videos`, {
      language,
      include_video_language: `${language},en,null`
    });
    const response = await cachedFetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return mapVideos(data.results);
  } catch (error) {
    console.error('Error fetching season videos:', error);
    return [];
  }
};

// Función para obtener detalles de un medio específico
export const fetchMediaDetails = async (id: number, type: 'movie' | 'tv', language: string = 'es'): Promise<Media | null> => {
  try {
    const params = {
      append_to_response: 'watch/providers,videos',
      include_video_language: `${language},en,null`,
      language: language
    };

    const url = buildApiUrl(`/${type}/${id}`, params);
    console.log(`Fetching ${type} details:`, url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error fetching ${type} details: ${response.status}`);
    }
    
    const item = await response.json();
    
    // Adaptar el formato
    const mediaType = type;
    const watchProviders = item['watch/providers'] || null;
    
    // Convertir géneros
    const genres = item.genres.map((g: any) => ({
      id: g.id,
      name: g.name
    }));
    
    const media: Media = {
      id: item.id,
      title: type === 'movie' ? item.title : item.name,
      posterPath: item.poster_path || '',
      backdropPath: item.backdrop_path || '',
      overview: item.overview,
      voteAverage: item.vote_average,
      releaseDate: type === 'movie' ? item.release_date : item.first_air_date,
      genres: genres,
      platforms: [], // Array para almacenar múltiples plataformas
      type: mediaType,
      country: item.original_language === 'es' ? 'ES' : null,
      runtime: type === 'movie' ? item.runtime : null,
      episodeRuntime: type === 'tv' ? (item.episode_run_time?.[0] || null) : null,
      numberOfEpisodes: type === 'tv' ? item.number_of_episodes : null,
      numberOfSeasons: type === 'tv' ? item.number_of_seasons : null,
      availableForRent: false,
      availableForPurchase: false,
      videos: mapVideos(item.videos?.results),
      lastAiredSeason: type === 'tv' ? (item.last_episode_to_air?.season_number ?? null) : null,
      creators: type === 'tv' ? (item.created_by ?? []).map((c: { id: number; name: string }) => ({ id: c.id, name: c.name })) : []
    };
    
    // Si hay datos de proveedores, recopilar todas las plataformas
    if (watchProviders && watchProviders.results) {
      // Preferimos datos de España, si están disponibles
      const countryData = watchProviders.results['ES'] || 
                          watchProviders.results[Object.keys(watchProviders.results)[0]];
      
      if (countryData) {
        const allPlatforms = [];
        
        // Recopilar plataformas de suscripción
        if (countryData.flatrate && countryData.flatrate.length > 0) {
          countryData.flatrate.forEach(provider => {
            allPlatforms.push({
              id: provider.provider_id,
              name: provider.provider_name,
              logoPath: provider.logo_path,
              type: 'subscription'
            });
          });
        }
        
        // Recopilar plataformas de alquiler
        if (countryData.rent && countryData.rent.length > 0) {
          media.availableForRent = true;
          countryData.rent.forEach(provider => {
            // Verificar si esta plataforma ya está en la lista
            if (!allPlatforms.some(p => p.id === provider.provider_id)) {
              allPlatforms.push({
                id: provider.provider_id,
                name: provider.provider_name,
                logoPath: provider.logo_path,
                type: 'rent'
              });
            }
          });
        }
        
        // Recopilar plataformas de compra
        if (countryData.buy && countryData.buy.length > 0) {
          media.availableForPurchase = true;
          countryData.buy.forEach(provider => {
            // Verificar si esta plataforma ya está en la lista
            if (!allPlatforms.some(p => p.id === provider.provider_id)) {
              allPlatforms.push({
                id: provider.provider_id,
                name: provider.provider_name,
                logoPath: provider.logo_path,
                type: 'buy'
              });
            }
          });
        }
        
        // Asignar todas las plataformas recopiladas
        media.platforms = allPlatforms;
      }
    }
    
    return media;
  } catch (error) {
    console.error(`Error fetching ${type} details:`, error);
    return null;
  }
};

