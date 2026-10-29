
import { TRAKT_API_URL, getClientId, getRedirectUri } from './config';

// Trakt emite tokens de acceso de 7 días; se usa si no tenemos expires_in guardado (tokens antiguos)
const DEFAULT_TOKEN_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

interface TraktTokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number; // segundos
  created_at?: number; // epoch en segundos
}

// Guarda el par de tokens. El refresh token es de un solo uso: hay que guardar siempre el nuevo
const saveTokens = (data: TraktTokenResponse): string | null => {
  if (!data.access_token) return null;
  const createdAt = data.created_at ? data.created_at * 1000 : Date.now();
  const lifetime = data.expires_in ? data.expires_in * 1000 : DEFAULT_TOKEN_LIFETIME_MS;

  localStorage.setItem('trakt_token', data.access_token);
  localStorage.setItem('trakt_token_created_at', new Date(createdAt).toISOString());
  localStorage.setItem('trakt_token_expires_at', new Date(createdAt + lifetime).toISOString());
  if (data.refresh_token) {
    localStorage.setItem('trakt_refresh_token', data.refresh_token);
  }
  return data.access_token;
};

export const getTokenExpiry = (): number | null => {
  const expiresAt = localStorage.getItem('trakt_token_expires_at');
  if (expiresAt) return new Date(expiresAt).getTime();
  const createdAt = localStorage.getItem('trakt_token_created_at');
  return createdAt ? new Date(createdAt).getTime() + DEFAULT_TOKEN_LIFETIME_MS : null;
};

const toBase64Url = (bytes: Uint8Array): string =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

// PKCE: random verifier, sent at token exchange; its SHA-256 (base64url) goes in the authorize URL
const createPkcePair = async (): Promise<{ verifier: string; challenge: string }> => {
  const verifier = toBase64Url(crypto.getRandomValues(new Uint8Array(64)));
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return { verifier, challenge: toBase64Url(new Uint8Array(digest)) };
};

export const getTraktAuthUrl = async (): Promise<string> => {
  const clientId = getClientId();

  if (!clientId) {
    throw new Error('No se ha configurado un Client ID para Trakt.tv');
  }

  const state = crypto.getRandomValues(new Uint8Array(16))
    .reduce((acc, b) => acc + b.toString(16).padStart(2, '0'), '');
  localStorage.setItem('trakt_auth_state', state);

  const { verifier, challenge } = await createPkcePair();
  localStorage.setItem('trakt_code_verifier', verifier);

  return `https://trakt.tv/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(getRedirectUri())}&state=${state}&code_challenge=${challenge}&code_challenge_method=S256`;
};

export const getAccessToken = async (code: string): Promise<string | null> => {
  try {
    const clientId = getClientId();
    const redirectUri = getRedirectUri();
    const codeVerifier = localStorage.getItem('trakt_code_verifier');

    if (!clientId) {
      throw new Error('No se ha configurado un Client ID para Trakt.tv');
    }

    if (!codeVerifier) {
      throw new Error('Falta el code_verifier de PKCE; vuelve a iniciar sesión');
    }

    const body: Record<string, string> = {
      code,
      client_id: clientId,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      code_verifier: codeVerifier,
    };

    const response = await fetch(`${TRAKT_API_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'trakt-api-version': '2',
        'trakt-api-key': clientId,
      },
      body: JSON.stringify(body),
      credentials: 'omit',
    });

    if (!response.ok) {
      console.error('Error response from Trakt.tv:', response.status, response.statusText);
      return null;
    }

    return saveTokens(await response.json());
  } catch (error) {
    console.error('Error getting Trakt access token:', error);
    return null;
  } finally {
    localStorage.removeItem('trakt_code_verifier');
  }
};

export type RefreshResult =
  | { status: 'ok'; token: string }
  | { status: 'invalid' } // Trakt rechaza el refresh token: hay que volver a conectar
  | { status: 'transient' }; // red caída o error de Trakt: se puede reintentar más tarde

// Otra pestaña puede haber renovado ya el token (y gastado el refresh token que teníamos)
const tokenRotatedSince = (staleToken: string | null): string | null => {
  const current = localStorage.getItem('trakt_token');
  return current && current !== staleToken ? current : null;
};

const requestRefresh = async (staleToken: string | null): Promise<RefreshResult> => {
  const rotated = tokenRotatedSince(staleToken);
  if (rotated) return { status: 'ok', token: rotated };

  const refreshToken = localStorage.getItem('trakt_refresh_token');
  const clientId = getClientId();
  if (!refreshToken || !clientId) return { status: 'invalid' };

  try {
    // Apps PKCE: sin client_secret ni code_verifier
    const response = await fetch(`${TRAKT_API_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'trakt-api-version': '2',
        'trakt-api-key': clientId,
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
        client_id: clientId,
        redirect_uri: getRedirectUri(),
        grant_type: 'refresh_token',
      }),
      credentials: 'omit',
    });

    if (response.ok) {
      const token = saveTokens(await response.json());
      return token ? { status: 'ok', token } : { status: 'transient' };
    }

    // 400 invalid_grant: refresh token gastado, revocado o anterior a la migración de Trakt
    if (response.status === 400 || response.status === 401) {
      const rotatedMeanwhile = tokenRotatedSince(staleToken);
      if (rotatedMeanwhile) return { status: 'ok', token: rotatedMeanwhile };
      console.error('Trakt rejected the refresh token:', response.status, await response.text().catch(() => ''));
      return { status: 'invalid' };
    }

    return { status: 'transient' };
  } catch {
    return { status: 'transient' };
  }
};

// `staleToken` es el token que ha fallado o va a caducar. Con Web Locks solo una pestaña
// renueva a la vez; las demás esperan y reutilizan el token nuevo
export const refreshAccessToken = (staleToken: string | null): Promise<RefreshResult> => {
  if (typeof navigator !== 'undefined' && navigator.locks) {
    return navigator.locks.request('trakt-token-refresh', () => requestRefresh(staleToken));
  }
  return requestRefresh(staleToken);
};

export const logout = (): void => {
  localStorage.removeItem('trakt_token');
  localStorage.removeItem('trakt_refresh_token');
  localStorage.removeItem('trakt_token_created_at');
  localStorage.removeItem('trakt_token_expires_at');
};

export const hasPendingAuth = (): boolean => {
  return !!localStorage.getItem('trakt_code_verifier');
};

// Acepta la URL completa de redirección, su query string o solo el código
export const parseAuthResponse = (input: string): { code: string | null; state: string | null } => {
  const trimmed = input.trim();
  const query = trimmed.includes('?') ? trimmed.slice(trimmed.indexOf('?') + 1) : trimmed;
  if (!query.includes('=')) {
    return { code: trimmed || null, state: null };
  }
  const params = new URLSearchParams(query);
  return { code: params.get('code'), state: params.get('state') };
};

// Valida el state (si viene) y canjea el código por un token
export const completeTraktLogin = async (code: string, state: string | null): Promise<string | null> => {
  const savedState = localStorage.getItem('trakt_auth_state');
  if (state !== null && state !== savedState) {
    throw new Error('State verification failed');
  }

  const token = await getAccessToken(code);
  localStorage.removeItem('trakt_auth_state');
  return token;
};
