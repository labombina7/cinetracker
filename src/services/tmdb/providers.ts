
import { TMDBWatchProviders } from '../../types/tmdb';
import { STREAMING_PROVIDERS } from '../../config/tmdb.config';
import { buildApiUrl } from './config';
import { cachedFetch } from './apiCache';

// Función para conseguir los proveedores de streaming de un título
export const fetchWatchProviders = async (id: number, type: 'movie' | 'tv'): Promise<TMDBWatchProviders | null> => {
  try {
    const response = await cachedFetch(buildApiUrl(`/${type}/${id}/watch/providers`));
    
    if (!response.ok) {
      throw new Error(`Error fetching watch providers: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching watch providers:', error);
    return null;
  }
};

// Función para comprobar si un título está disponible en plataformas de streaming o alquiler/compra
export const isAvailableOnStreaming = (providers: TMDBWatchProviders | null): boolean => {
  if (!providers || !providers.results) return true;
  
  // Prioridad para España, luego otros países
  const priorityCountries = ['ES', 'MX', 'AR', 'CO', 'CL'];
  const countries = Object.keys(providers.results);
  
  // Primero comprobamos los países prioritarios
  for (const priorityCountry of priorityCountries) {
    if (countries.includes(priorityCountry)) {
      const countryProviders = providers.results[priorityCountry];
      
      // Verificar si hay proveedores de streaming (flatrate, rent o buy)
      const hasValidProvider = (providerList: any[] | undefined) => {
        if (!providerList) return false;
        return providerList.some(provider => 
          STREAMING_PROVIDERS.includes(provider.provider_id)
        );
      };
      
      // Comprobar en cada tipo: flatrate (suscripción), rent (alquiler) y buy (compra)
      if (
        hasValidProvider(countryProviders.flatrate) || 
        hasValidProvider(countryProviders.rent) || 
        hasValidProvider(countryProviders.buy)
      ) {
        return true;
      }
    }
  }
  
  // Si no hay resultados en los países prioritarios, comprobar el resto
  for (const country of countries) {
    if (!priorityCountries.includes(country)) {
      const countryProviders = providers.results[country];
      
      const hasValidProvider = (providerList: any[] | undefined) => {
        if (!providerList) return false;
        return providerList.some(provider => 
          STREAMING_PROVIDERS.includes(provider.provider_id)
        );
      };
      
      if (
        hasValidProvider(countryProviders.flatrate) || 
        hasValidProvider(countryProviders.rent) || 
        hasValidProvider(countryProviders.buy)
      ) {
        return true;
      }
    }
  }
  
  return false;
};
