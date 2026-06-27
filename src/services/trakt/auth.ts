
import { TRAKT_API_URL, getClientId, getClientSecret, getRedirectUri } from './config';

export const getTraktAuthUrl = (): string => {
  const clientId = getClientId();

  if (!clientId) {
    throw new Error('No se ha configurado un Client ID para Trakt.tv');
  }

  const state = crypto.getRandomValues(new Uint8Array(16))
    .reduce((acc, b) => acc + b.toString(16).padStart(2, '0'), '');
  localStorage.setItem('trakt_auth_state', state);

  return `https://trakt.tv/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(getRedirectUri())}&state=${state}`;
};

export const getAccessToken = async (code: string): Promise<string | null> => {
  try {
    const clientId = getClientId();
    const clientSecret = getClientSecret();
    const redirectUri = getRedirectUri();

    if (!clientId) {
      throw new Error('No se ha configurado un Client ID para Trakt.tv');
    }

    const body: Record<string, string> = {
      code,
      client_id: clientId,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    };

    if (clientSecret) {
      body.client_secret = clientSecret;
    }

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
  }
};

export const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem('trakt_refresh_token');
  const clientId = getClientId();
  const clientSecret = getClientSecret();
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

    if (clientSecret) {
      body.client_secret = clientSecret;
    }

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
