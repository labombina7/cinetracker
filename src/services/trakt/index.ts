
// Re-export all the Trakt.tv API functionality

// Config exports
export { 
  TRAKT_API_URL,
  getClientId,
  getClientSecret,
  getRedirectUri,
  getTraktHeaders,
  isAuthenticated,
  hasClientCredentials
} from './config';

// Auth exports
export {
  getTraktAuthUrl,
  getAccessToken,
  logout
} from './auth';

// User exports
export {
  getUserInfo
} from './user';

// Watchlist exports
export {
  addToWatchlist
} from './watchlist';

// Search exports
export {
  searchTraktMedia
} from './search';

// Client management exports
export {
  saveClientCredentials,
  clearAllTraktData
} from './client';
