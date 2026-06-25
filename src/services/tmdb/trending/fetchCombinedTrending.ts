
import { Media } from '../../../types/media';
import { TMDBDiscoverResponse } from '../../../types/tmdb';
import { buildApiUrl } from '../config';
import { convertToMedia } from '../utils';
import { fetchRealTrending } from './fetchRealTrending';

// Función para combinar tendencias reales con contenido español destacado
export const fetchCombinedTrending = async (type: 'all' | 'movie' | 'tv'): Promise<Media[]> => {
  try {
    // Obtenemos tendencias reales
    console.log("Fetching real trending for combined mode");
    const realTrending = await fetchRealTrending(type);
    console.log(`Combined mode: Got ${realTrending.length} real trending items`);
    
    if (realTrending.length === 0) {
      console.warn("No trending results found for combined mode. Falling back to discover.");
      // Implementamos un fallback para evitar pantallas vacías
      const spanishMediaParams: Record<string, string | number | boolean> = {
        sort_by: 'popularity.desc',
        page: 1,
        include_adult: false,
        'vote_count.gte': 10
      };
      
      let fallbackMedia: Media[] = [];
      if (type !== 'all') {
        const url = buildApiUrl(`/discover/${type}`, spanishMediaParams);
        console.log(`Fallback: Fetching popular ${type}:`, url);
        
        const response = await fetch(url);
        
        if (response.ok) {
          const data: TMDBDiscoverResponse = await response.json();
          
          const mediaPromises = data.results.map(async item => {
            const media = await convertToMedia({...item, media_type: type}, type);
            return media;
          });
          
          fallbackMedia = (await Promise.all(mediaPromises)).filter((item): item is Media => item !== null);
          console.log(`Fallback: Fetched ${fallbackMedia.length} popular ${type} items`);
          return fallbackMedia;
        }
      }
    }
    
    // También obtenemos algunos resultados específicos de España del endpoint discover
    // para asegurar que tenemos contenido español en los resultados
    const spanishMediaParams: Record<string, string | number | boolean> = {
      sort_by: 'popularity.desc',
      page: 1,
      with_origin_country: 'ES',
      include_adult: false,
      'vote_count.gte': 20
    };
    
    let spanishMedia: Media[] = [];
    if (type !== 'all') {
      const url = buildApiUrl(`/discover/${type}`, spanishMediaParams);
      console.log(`Fetching Spanish ${type}:`, url);
      
      const response = await fetch(url);
      
      if (response.ok) {
        const data: TMDBDiscoverResponse = await response.json();
        
        const spanishMediaPromises = data.results.map(async item => {
          const media = await convertToMedia({...item, media_type: type}, type);
          return media;
        });
        
        spanishMedia = (await Promise.all(spanishMediaPromises)).filter((item): item is Media => item !== null);
        console.log(`Fetched ${spanishMedia.length} Spanish ${type} items`);
      }
    } else {
      // Para 'all', obtenemos tanto películas como series españolas
      const movieUrl = buildApiUrl(`/discover/movie`, spanishMediaParams);
      const tvUrl = buildApiUrl(`/discover/tv`, spanishMediaParams);
      
      const [movieResponse, tvResponse] = await Promise.all([
        fetch(movieUrl),
        fetch(tvUrl)
      ]);
      
      const moviePromises = movieResponse.ok ? 
        (await movieResponse.json()).results.map(async (item: any) => 
          await convertToMedia({...item, media_type: 'movie'}, 'movie')) : [];
        
      const tvPromises = tvResponse.ok ? 
        (await tvResponse.json()).results.map(async (item: any) => 
          await convertToMedia({...item, media_type: 'tv'}, 'tv')) : [];
      
      const allSpanishMedia = await Promise.all([...moviePromises, ...tvPromises]);
      spanishMedia = allSpanishMedia.filter((item): item is Media => item !== null);
    }
    
    // Combinamos las tendencias globales con el contenido español
    // Primero añadimos el contenido español que no está ya en las tendencias
    const allIds = new Set(realTrending.map(item => item.id));
    const uniqueSpanishMedia = spanishMedia.filter(item => !allIds.has(item.id));
    
    // Combinamos: primero algunas tendencias, luego algunos contenidos españoles, y el resto de tendencias
    const combined = [
      ...realTrending.slice(0, 5),
      ...uniqueSpanishMedia.slice(0, 5),
      ...realTrending.slice(5)
    ];
    
    console.log(`Combined: ${combined.length} total items`);
    console.log(`Combined Spanish content: ${combined.filter(item => item.country === 'ES').length}`);
    
    return combined;
  } catch (error) {
    console.error('Error fetching combined trending:', error);
    return [];
  }
};
