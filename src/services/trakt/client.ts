
import { toast } from 'sonner';
import { refreshAccessToken } from './auth';
import { getTraktHeaders } from './config';

export const saveClientCredentials = (clientId: string, clientSecret: string): void => {
  localStorage.setItem('trakt_client_id', clientId);
  if (clientSecret) {
    localStorage.setItem('trakt_client_secret', clientSecret);
  } else {
    localStorage.removeItem('trakt_client_secret');
  }
};

export const clearAllTraktData = (): void => {
  localStorage.removeItem('trakt_token');
  localStorage.removeItem('trakt_refresh_token');
  localStorage.removeItem('trakt_token_created_at');
  localStorage.removeItem('trakt_client_id');
  localStorage.removeItem('trakt_client_secret');
};

// Shared refresh promise to avoid race conditions when multiple requests expire simultaneously
let refreshPromise: Promise<string | null> | null = null;

export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const response = await fetch(url, options);

  if (response.status !== 401) {
    return response;
  }

  // Token expired — attempt refresh once
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  const newToken = await refreshPromise;

  if (!newToken) {
    clearAllTraktData();
    toast.error('Tu sesión de Trakt.tv ha expirado. Por favor, vuelve a conectarte.', {
      duration: 6000,
    });
    return response;
  }

  // Retry with the new token
  const newHeaders = new Headers(options.headers as HeadersInit);
  newHeaders.set('Authorization', `Bearer ${newToken}`);

  return fetch(url, { ...options, headers: newHeaders });
};
