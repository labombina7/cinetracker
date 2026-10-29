
import { toast } from 'sonner';
import { RefreshResult, getTokenExpiry, logout, refreshAccessToken } from './auth';

export const saveClientCredentials = (clientId: string): void => {
  localStorage.setItem('trakt_client_id', clientId);
  // Trakt ya no emite Client Secret: limpiar el de configuraciones antiguas
  localStorage.removeItem('trakt_client_secret');
};

export const clearAllTraktData = (): void => {
  localStorage.removeItem('trakt_token');
  localStorage.removeItem('trakt_refresh_token');
  localStorage.removeItem('trakt_token_created_at');
  localStorage.removeItem('trakt_client_id');
  localStorage.removeItem('trakt_client_secret');
  localStorage.removeItem('trakt_code_verifier');
};

// Renovar si al token le queda menos de esto, para no esperar a que una petición falle
const REFRESH_MARGIN_MS = 24 * 60 * 60 * 1000;

// Una sola renovación en curso por pestaña (entre pestañas coordina refreshAccessToken)
let refreshPromise: Promise<RefreshResult> | null = null;

const refreshOnce = (staleToken: string | null): Promise<RefreshResult> => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken(staleToken).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

// Cierra la sesión pero conserva el Client ID: es configuración de la app, no de la sesión
const endSession = (): void => {
  logout();
  toast.error('Tu sesión de Trakt.tv ha expirado. Por favor, vuelve a conectarte.', {
    id: 'trakt-session-expired', // varias peticiones fallando a la vez muestran un solo aviso
    duration: 6000,
  });
};

const bearerOf = (options: RequestInit): string | null =>
  new Headers(options.headers as HeadersInit).get('Authorization')?.replace(/^Bearer\s+/i, '') ?? null;

const withToken = (options: RequestInit, token: string): RequestInit => {
  const headers = new Headers(options.headers as HeadersInit);
  headers.set('Authorization', `Bearer ${token}`);
  return { ...options, headers };
};

export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  let requestOptions = options;
  const usedToken = bearerOf(options);

  // Renovación preventiva: si falla por red, se sigue con el token actual
  const expiry = getTokenExpiry();
  if (usedToken && expiry !== null && expiry - Date.now() < REFRESH_MARGIN_MS) {
    const result = await refreshOnce(usedToken);
    if (result.status === 'ok') requestOptions = withToken(options, result.token);
  }

  const response = await fetch(url, requestOptions);
  if (response.status !== 401) {
    return response;
  }

  const result = await refreshOnce(bearerOf(requestOptions));

  if (result.status === 'invalid') {
    endSession();
    return response;
  }

  if (result.status === 'transient') {
    // No se cierra la sesión por un fallo de red o de Trakt; se reintentará en la próxima petición
    console.warn('Trakt token refresh failed temporarily; keeping the session');
    return response;
  }

  return fetch(url, withToken(requestOptions, result.token));
};
