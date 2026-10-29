
import { TRAKT_API_URL, getClientId, getRedirectUri } from './config';

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

    const data = await response.json();

    if (data.access_token) {
      localStorage.setItem('trakt_token', data.access_token);
      localStorage.setItem('trakt_token_created_at', new Date().toISOString());
      if (data.refresh_token) {
        localStorage.setItem('trakt_refresh_token', data.refresh_token);
      }
      return data.access_token;
    }
    return null;
  } catch (error) {
    console.error('Error getting Trakt access token:', error);
    return null;
  } finally {
    localStorage.removeItem('trakt_code_verifier');
  }
};

export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('trakt_refresh_token');
  const clientId = getClientId();
  const redirectUri = getRedirectUri();

  if (!refreshToken || !clientId) {
    return null;
  }

  try {
    const body: Record<string, string> = {
      refresh_token: refreshToken,
      client_id: clientId,
      redirect_uri: redirectUri,
      grant_type: 'refresh_token',
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
      return null;
    }

    const data = await response.json();

    if (data.access_token) {
      localStorage.setItem('trakt_token', data.access_token);
      localStorage.setItem('trakt_token_created_at', new Date().toISOString());
      if (data.refresh_token) {
        localStorage.setItem('trakt_refresh_token', data.refresh_token);
      }
      return data.access_token;
    }

    return null;
  } catch {
    return null;
  }
};

export const logout = (): void => {
  localStorage.removeItem('trakt_token');
  localStorage.removeItem('trakt_refresh_token');
  localStorage.removeItem('trakt_token_created_at');
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
