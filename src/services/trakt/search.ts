
import { TRAKT_API_URL, getTraktHeaders } from './config';

// Search for media in Trakt
export const searchTraktMedia = async (title: string, type: 'movie' | 'show' | 'all' = 'all'): Promise<any> => {
  const token = localStorage.getItem('trakt_token');
  if (!token) return null;

  try {
    // Construir la URL base de búsqueda
    let searchUrl = `${TRAKT_API_URL}/search`;
    
    // Si se especifica un tipo, lo añadimos a la URL
    if (type !== 'all') {
      searchUrl += `/${type}`;
    }
    
    // Añadir el parámetro de búsqueda
    searchUrl += `?query=${encodeURIComponent(title)}`;
    
    // Para series en español podemos usar fields=translations
    searchUrl += '&fields=translations';
    
    console.log('Buscando en Trakt:', searchUrl);
    
    const response = await fetch(searchUrl, {
      headers: getTraktHeaders(),
      credentials: 'omit'  // Añadido para evitar envío automático de cookies
    });

    if (!response.ok) {
      console.error('Error en búsqueda de Trakt:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    console.log('Resultados de búsqueda Trakt:', data);
    return data;
  } catch (error) {
    console.error('Error searching Trakt media:', error);
    return null;
  }
};
