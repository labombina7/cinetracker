
// Client credentials management

// Save client credentials
export const saveClientCredentials = (clientId: string, clientSecret: string): void => {
  localStorage.setItem('trakt_client_id', clientId);
  if (clientSecret) {
    localStorage.setItem('trakt_client_secret', clientSecret);
  } else {
    localStorage.removeItem('trakt_client_secret');
  }
};

// Clear all Trakt related data
export const clearAllTraktData = (): void => {
  localStorage.removeItem('trakt_token');
  localStorage.removeItem('trakt_refresh_token');
  localStorage.removeItem('trakt_client_id');
  localStorage.removeItem('trakt_client_secret');
};
