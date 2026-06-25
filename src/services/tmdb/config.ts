
import { TMDB_CONFIG } from '../../config/tmdb.config';

// Función para construir la URL base con autenticación
export const buildApiUrl = (endpoint: string, params: Record<string, string | number | boolean> = {}) => {
  const url = new URL(`${TMDB_CONFIG.BASE_URL}${endpoint}`);
  
  // Añadir API key - Verificamos que exista antes de añadirla
  if (!TMDB_CONFIG.API_KEY) {
    console.error('Error: API key not found. Please configure your TMDB API key.');
    throw new Error('API key not configured');
  }
  
  url.searchParams.append('api_key', TMDB_CONFIG.API_KEY);
  
  // Añadir parámetros adicionales
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value.toString());
  });
  
  return url.toString();
};
