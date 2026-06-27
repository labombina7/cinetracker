

import { Media } from '../../types/media';
import { buildApiUrl } from './config';

// Función para obtener detalles de un medio específico
export const fetchMediaDetails = async (id: number, type: 'movie' | 'tv', language: string = 'es'): Promise<Media | null> => {
  try {
    const params = {
      append_to_response: 'watch/providers',
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
      availableForPurchase: false
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

