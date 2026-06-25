
import { useState, useEffect } from 'react';
import { TMDB_CONFIG } from '@/config/tmdb.config';
import { toast } from '@/components/ui/use-toast';

export const useApiKey = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Intentar recuperar la API key de localStorage
    const storedApiKey = localStorage.getItem('tmdb_api_key');
    
    // También verificamos si hay una API key en las variables de entorno
    const envApiKey = import.meta.env.VITE_TMDB_API_KEY;
    
    if (storedApiKey && storedApiKey.trim() !== '') {
      // Si existe en localStorage, actualizamos el estado
      setApiKey(storedApiKey);
      setIsConfigured(true);
      
      // También actualizamos la configuración global
      (TMDB_CONFIG as any).API_KEY = storedApiKey;
      console.log('API Key loaded from localStorage');
    } else if (envApiKey && envApiKey.trim() !== '') {
      // Si hay una API key en las variables de entorno, la usamos
      setApiKey(envApiKey);
      setIsConfigured(true);
      
      // También actualizamos la configuración global
      (TMDB_CONFIG as any).API_KEY = envApiKey;
      console.log('API Key loaded from environment variables');
    } else {
      console.log('No API Key found');
      setIsConfigured(false);
    }
    
    setIsLoading(false);
  }, []);

  const configureApiKey = (key: string) => {
    if (!key || key.trim() === '') {
      toast({
        title: "Error",
        description: "La API key no puede estar vacía",
        variant: "destructive",
      });
      return;
    }
    
    setApiKey(key);
    setIsConfigured(true);
    
    // Actualizar la configuración global
    (TMDB_CONFIG as any).API_KEY = key;
    console.log('API Key configured:', key.substring(0, 4) + '...');
    
    // Guardar en localStorage para futuras sesiones
    localStorage.setItem('tmdb_api_key', key);
  };

  return {
    apiKey,
    isConfigured,
    isLoading,
    configureApiKey
  };
};
