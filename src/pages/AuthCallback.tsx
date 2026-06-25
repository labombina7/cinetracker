
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAccessToken } from '@/services/trakt';
import { toast } from '@/components/ui/use-toast';

const AuthCallback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Processing auth callback with query: ', location.search);
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        // Check for error
        if (error) {
          throw new Error(`Authorization error: ${error}${errorDescription ? ` - ${errorDescription}` : ''}`);
        }
        
        if (!code) {
          throw new Error('No authorization code found in response');
        }
        
        // Verify state (security measure)
        const savedState = localStorage.getItem('trakt_auth_state');
        if (!state || !savedState || state !== savedState) {
          throw new Error('State verification failed');
        }
        
        // Exchange code for token
        console.log('Exchanging code for token:', code);
        const token = await getAccessToken(code);
        
        if (token) {
          toast({
            title: "Conexión exitosa",
            description: "Tu cuenta de Trakt.tv ha sido conectada correctamente.",
          });
          navigate('/auth/trakt');
        } else {
          throw new Error('Failed to get access token');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setError((error as Error).message || 'Error de autenticación desconocido');
        toast({
          title: "Error de autenticación",
          description: "No se pudo completar la autenticación con Trakt.tv. Por favor, intenta de nuevo.",
          variant: "destructive",
        });
        // Still navigate back, but after a delay
        setTimeout(() => {
          navigate('/auth/trakt');
        }, 3000);
      } finally {
        localStorage.removeItem('trakt_auth_state'); // Clean up
        setLoading(false);
      }
    };
    
    handleCallback();
  }, [location, navigate]);

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[300px]">
      {loading ? (
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p>Conectando con Trakt.tv...</p>
        </div>
      ) : error ? (
        <div className="text-center">
          <p className="text-destructive mb-3">{error}</p>
          <p>Redirigiéndote...</p>
        </div>
      ) : (
        <p>Redirigiéndote...</p>
      )}
    </div>
  );
};

export default AuthCallback;
