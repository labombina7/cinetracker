
// Exportar todas las funciones públicas
export { fetchTrending } from './trending';
export { searchMedia } from './search';
export { fetchMediaDetails } from './details';
export { discoverMedia, discoverSpanishMedia, fetchMediaByPlatforms } from './discover/index';
export { fetchGenres } from './genres';
export { fetchWatchProviders, isAvailableOnStreaming } from './providers';
export { fetchProvidersList, fetchPopularProviders } from './providers/index';
export { getPosterUrl, getBackdropUrl } from './utils';
export { buildApiUrl } from './config';
export { 
  fetchRealTrending, 
  fetchCombinedTrending, 
  fetchNewAdditions 
} from './trending/index';
