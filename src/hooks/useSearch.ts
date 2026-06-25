
import { useState, useRef, useCallback, useEffect } from 'react';
import { Media } from '@/types/media';
import { searchMedia } from '@/services/tmdb/index';
import { toast } from '@/components/ui/use-toast';
import { translations } from '@/utils/translations/searchResults';
import { AppLanguage } from '@/hooks/useLanguage';
import { filterSpanishContent } from '@/hooks/mediaFetch/fetchMediaUtils';

export const useSearch = (query: string, language: AppLanguage, selectedPlatformIds: number[], showSpanishOnly: boolean) => {
  const [results, setResults] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const isSearching = useRef(false);
  const searchIdentifier = useRef('');
  const searchInitiated = useRef(false);

  const t = translations[language];

  const performSearch = useCallback(async () => {
    // Crear identificador único para esta búsqueda
    const currentIdentifier = `${query}-${showSpanishOnly}-${JSON.stringify(selectedPlatformIds.sort())}-${language}`;
    
    // Condiciones de salida temprana
    if (isSearching.current) return;
    if (currentIdentifier === searchIdentifier.current && searchInitiated.current) return;

    try {
      if (!query) {
        setResults([]);
        setLoading(false);
        setError('');
        return;
      }

      isSearching.current = true;
      searchIdentifier.current = currentIdentifier;
      searchInitiated.current = true;
      setLoading(true);
      
      console.log(`Searching: "${query}", platforms: ${selectedPlatformIds.join(',')}, spanish: ${showSpanishOnly}`);
      
      // Pasamos el parámetro de idioma español a la búsqueda
      const data = await searchMedia(query, language, showSpanishOnly);
      
      // Aplicar filtros de plataforma si es necesario
      let filteredData = data;
      
      if (selectedPlatformIds.length > 0) {
        console.log(`Filtering by platforms: ${selectedPlatformIds.join(',')}`);
        filteredData = data.filter(item => {
          // Comprobar en los proveedores del contenido
          if (item.watchProviders?.flatrate) {
            return item.watchProviders.flatrate.some(provider => 
              selectedPlatformIds.includes(provider.provider_id)
            );
          }
          return false;
        });
        
        console.log(`Platform filtering: ${data.length} → ${filteredData.length} items`);
      }
      
      // Ya no necesitamos filtrar por español aquí, ya que se hace en la API
      // Pero mantenemos el código por si acaso necesitamos filtrado adicional
      if (showSpanishOnly) {
        console.log(`Spanish only filtering: ON, results before: ${filteredData.length}`);
      }
      
      setResults(filteredData);
      setError('');
    } catch (err) {
      console.error('Error searching media:', err);
      setError(t.errorDesc);
      toast({
        variant: 'destructive',
        title: t.errorTitle,
        description: t.errorDesc,
      });
    } finally {
      setLoading(false);
      isSearching.current = false;
    }
  }, [query, language, selectedPlatformIds, showSpanishOnly, t]);

  // Ejecutar búsqueda cuando cambian los parámetros
  useEffect(() => {
    // Pequeño retraso para prevenir demasiadas búsquedas
    const timeoutId = setTimeout(() => {
      performSearch();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [performSearch]);

  return {
    results,
    loading,
    error,
    performSearch
  };
};
