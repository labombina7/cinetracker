
import { TRAKT_API_URL, getClientId, getClientSecret, getRedirectUri, getTraktHeaders } from './config';

// Generate authentication URL with state parameter for security
export const getTraktAuthUrl = (): string => {
  const clientId = getClientId();
  
  if (!clientId) {
    throw new Error('No se ha configurado un Client ID para Trakt.tv');
  }
  
  const state = Math.random().toString(36).substring(2, 15);
  localStorage.setItem('trakt_auth_state', state);
  
  return `https://trakt.tv/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(getRedirectUri())}&state=${state}`;
};

// Exchange code for access token
export const getAccessToken = async (code: string): Promise<string | null> => {
  try {
    const clientId = getClientId();
    const clientSecret = getClientSecret();
    const redirectUri = getRedirectUri();
    
    if (!clientId) {
      throw new Error('No se ha configurado un Client ID para Trakt.tv');
    }
    
    console.log('Exchanging code for token with:', {
      code,
      clientId,
      redirectUri
    });
    
    // Prepare the request body
    const body: any = {
      code,
      client_id: clientId,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    };
    
    // Add client_secret if available
    if (clientSecret) {
      body.client_secret = clientSecret;
    }
    
    const response = await fetch(`${TRAKT_API_URL}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'trakt-api-version': '2',
        'trakt-api-key': clientId
      },
      body: JSON.stringify(body),
      credentials: 'omit'  // Añadido para evitar envío automático de cookies
    });

    if (!response.ok) {
      console.error('Error response from Trakt.tv:', response.status, response.statusText);
      const errorData = await response.text();
      console.error('Error data:', errorData);
      return null;
    }

    const data = await response.json();
    console.log('Token response:', data);
    
    if (data.access_token) {
      localStorage.setItem('trakt_token', data.access_token);
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

// Logout user
export const logout = (): void => {
  localStorage.removeItem('trakt_token');
  localStorage.removeItem('trakt_refresh_token');
};
