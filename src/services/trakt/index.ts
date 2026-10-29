
// Re-export all the Trakt.tv API functionality

// Config exports
export { 
  TRAKT_API_URL,
  getClientId,
  getRedirectUri,
  isManualAuthFlow,
  getTraktHeaders,
  isAuthenticated,
  hasClientCredentials
} from './config';

// Auth exports
export {
  getTraktAuthUrl,
  getAccessToken,
  hasPendingAuth,
  parseAuthResponse,
  completeTraktLogin,
  logout
} from './auth';

// User exports
export {
  getUserInfo
} from './user';

// Watchlist exports
export {
  getWatchlist,
  addToWatchlist,
  addManyToWatchlist,
  removeFromWatchlist,
} from './watchlist';

// Ratings exports
export { fetchTraktRatings } from './ratings';

// Search exports
export {
  searchTraktMedia
} from './search';

// Client management exports
export {
  saveClientCredentials,
  clearAllTraktData
} from './client';
