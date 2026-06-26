
import { buildApiUrl } from '../config';
import { Platform } from '../../../types/media';

const TOP_PROVIDERS_LIMIT = 20;

export interface TMDBProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority: number;
}

export interface TMDBProvidersResponse {
  results: TMDBProvider[];
}

// Función para obtener todos los proveedores disponibles
export const fetchProvidersList = async (type: 'movie' | 'tv' = 'movie', region: string = 'ES'): Promise<Platform[]> => {
  try {
    const url = buildApiUrl(`/watch/providers/${type}`, {
      watch_region: region,
    });
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Error fetching providers: ${response.status}`);
    }
    
    const data: TMDBProvidersResponse = await response.json();
    console.log(`Fetched ${data.results.length} streaming providers for ${type} in ${region}`);
    
    // TMDB returns results already sorted by display_priority (lower = more relevant)
    return data.results.map(provider => ({
      id: provider.provider_id,
      name: provider.provider_name,
      logoPath: provider.logo_path,
    }));
  } catch (error) {
    console.error('Error fetching streaming providers list:', error);
    return [];
  }
};

// Función para obtener proveedores populares
export const fetchPopularProviders = async (region: string = 'ES'): Promise<Platform[]> => {
  try {
    // Obtenemos proveedores de películas y series
    const movieProviders = await fetchProvidersList('movie', region);
    const tvProviders = await fetchProvidersList('tv', region);
    
    // Combinamos los resultados y eliminamos duplicados
    const combinedProviders = [...movieProviders];
    
    // Add TV providers not already in the list (preserving display_priority order)
    tvProviders.forEach(tvProvider => {
      if (!combinedProviders.some(p => p.id === tvProvider.id)) {
        combinedProviders.push(tvProvider);
      }
    });

    return combinedProviders.slice(0, TOP_PROVIDERS_LIMIT);
  } catch (error) {
    console.error('Error fetching popular streaming providers:', error);
    return [];
  }
};
