
import React, { useState, useEffect } from 'react';
import {
  getTraktAuthUrl, isAuthenticated, getUserInfo, logout,
  hasClientCredentials, saveClientCredentials, clearAllTraktData,
  isManualAuthFlow, hasPendingAuth, parseAuthResponse, completeTraktLogin
} from '@/services/trakt';
import { TraktUser } from '@/services/trakt/user';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { LogIn, LogOut, Settings } from 'lucide-react';
import TraktClientForm from '@/components/TraktClientForm';
import TraktUserProfile from '@/components/trakt/TraktUserProfile';
import TraktConnectionInstructions from '@/components/trakt/TraktConnectionInstructions';
import TraktErrorState from '@/components/trakt/TraktErrorState';
import TraktLoadingState from '@/components/trakt/TraktLoadingState';
import TraktConnectPrompt from '@/components/trakt/TraktConnectPrompt';
import TraktPasteCode from '@/components/trakt/TraktPasteCode';
import { useFavorites } from '@/hooks/useFavorites';

const TraktAuth = () => {
  const [userInfo, setUserInfo] = useState<TraktUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showClientForm, setShowClientForm] = useState(false);
  const [awaitingCode, setAwaitingCode] = useState(() => isManualAuthFlow() && hasPendingAuth());
  const [submittingCode, setSubmittingCode] = useState(false);
  const navigate = useNavigate();
  const { clearTraktFavorites } = useFavorites();

  const fetchUserInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const info = await getUserInfo();
      if (info) {
        setUserInfo(info);
        console.log('User info retrieved successfully:', info);
      } else {
        throw new Error('No se pudo obtener la información del usuario.');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
      setError('No se pudo obtener la información del usuario.');
      toast({
        title: "Error",
        description: "No se pudo obtener la información del usuario.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if client credentials are configured
    if (!hasClientCredentials()) {
      // Open the client form if no credentials are found
      setShowClientForm(true);
    } else if (isAuthenticated()) {
      fetchUserInfo();
    }
  }, []);

  const handleLogin = async () => {
    try {
      if (!hasClientCredentials()) {
        setShowClientForm(true);
        return;
      }
      
      if (!isManualAuthFlow()) {
        const authUrl = await getTraktAuthUrl();
        console.log('Redirecting to Trakt auth URL:', authUrl);
        window.location.href = authUrl;
        return;
      }

      // Abrir la pestaña antes del await para que el navegador no la bloquee como popup
      const authWindow = window.open('', '_blank');
      const authUrl = await getTraktAuthUrl();
      console.log('Opening Trakt auth URL for manual flow:', authUrl);
      setAwaitingCode(true);
      if (authWindow) {
        authWindow.location.href = authUrl;
      } else {
        window.location.href = authUrl;
      }
    } catch (error) {
      console.error('Error generating auth URL:', error);
      toast({
        title: "Error",
        description: "No se pudo iniciar el proceso de autenticación. Configura tus credenciales de Trakt.tv primero.",
        variant: "destructive",
      });
      setShowClientForm(true);
    }
  };

  const handlePasteCode = async (value: string) => {
    const { code, state } = parseAuthResponse(value);
    if (!code) {
      toast({
        title: "URL no válida",
        description: "No se encontró ningún código de autorización en lo que has pegado.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingCode(true);
    try {
      const token = await completeTraktLogin(code, state);
      if (!token) {
        throw new Error('Failed to get access token');
      }
      setAwaitingCode(false);
      toast({
        title: "Conexión exitosa",
        description: "Tu cuenta de Trakt.tv ha sido conectada correctamente.",
      });
      fetchUserInfo();
    } catch (error) {
      console.error('Manual auth error:', error);
      setAwaitingCode(hasPendingAuth());
      toast({
        title: "Error de autenticación",
        description: "No se pudo completar la conexión. Vuelve a pulsar \"Conectar con Trakt.tv\" e inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setSubmittingCode(false);
    }
  };

  const handleLogout = () => {
    clearTraktFavorites();
    logout();
    setUserInfo(null);
    setError(null);
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión en Trakt.tv correctamente.",
    });
  };

  const handleRetry = () => {
    if (isAuthenticated()) {
      fetchUserInfo();
    } else {
      handleLogin();
    }
  };

  const handleSaveCredentials = (clientId: string) => {
    saveClientCredentials(clientId);
    toast({
      title: "Credenciales guardadas",
      description: "Ahora puedes iniciar sesión en Trakt.tv",
    });
  };

  const handleClearAll = () => {
    clearTraktFavorites();
    clearAllTraktData();
    setUserInfo(null);
    setError(null);
    toast({
      title: "Datos borrados",
      description: "Se han borrado todas tus credenciales y tokens de Trakt.tv",
    });
    // Show the client form again
    setShowClientForm(true);
  };

  const renderCardContent = () => {
    if (!hasClientCredentials()) {
      return (
        <TraktConnectionInstructions onConfigureCredentials={() => setShowClientForm(true)} />
      );
    }
    
    if (isAuthenticated()) {
      if (loading) {
        return <TraktLoadingState />;
      }
      
      if (error) {
        return <TraktErrorState error={error} onRetry={handleRetry} />;
      }
      
      if (userInfo) {
        return (
          <TraktUserProfile 
            userInfo={userInfo} 
            onConfigureCredentials={() => setShowClientForm(true)} 
          />
        );
      }
      
      return <div className="text-center py-4"><p>Verificando estado de conexión...</p></div>;
    }
    
    return (
      <>
        <TraktConnectPrompt onConfigureCredentials={() => setShowClientForm(true)} />
        {awaitingCode && <TraktPasteCode onSubmit={handlePasteCode} submitting={submittingCode} />}
      </>
    );
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Conectar con Trakt.tv</h1>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Sincronización con Trakt.tv</CardTitle>
          <CardDescription>
            Conecta tu cuenta de Trakt.tv para sincronizar tus favoritos con tu Watch List.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {renderCardContent()}
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-2 justify-center">
          {isAuthenticated() ? (
            <>
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </Button>
              <Button variant="outline" onClick={handleClearAll}>
                Borrar datos
              </Button>
            </>
          ) : hasClientCredentials() ? (
            <Button onClick={handleLogin}>
              <LogIn className="mr-2 h-4 w-4" />
              Conectar con Trakt.tv
            </Button>
          ) : null}
        </CardFooter>
      </Card>
      
      <TraktClientForm 
        open={showClientForm} 
        onOpenChange={setShowClientForm} 
        onSave={handleSaveCredentials} 
      />
      
      <div className="mt-6 text-center">
        <Button variant="ghost" onClick={() => navigate('/')}>
          Volver al inicio
        </Button>
      </div>
    </div>
  );
};

export default TraktAuth;
