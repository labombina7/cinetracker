
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';

interface ApiKeySetupProps {
  onApiKeySet: (apiKey: string) => void;
}

const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Por favor, introduce una API key válida",
        variant: "destructive",
      });
      return;
    }
    
    // Guardar la API key en localStorage para futuras sesiones
    localStorage.setItem('tmdb_api_key', apiKey);
    
    // Notificar al componente padre
    onApiKeySet(apiKey);
    
    toast({
      title: "¡Configurado correctamente!",
      description: "La API key de TMDB ha sido configurada correctamente",
    });
  };

  return (
    <div className="container mx-auto px-4 py-10 flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl text-center">Configuración de TMDB API</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Para usar esta aplicación, necesitas proporcionar una API key de TMDB.
                  Puedes obtener una registrándote en{" "}
                  <a 
                    href="https://www.themoviedb.org/settings/api" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    themoviedb.org
                  </a>
                </p>
              </div>
              <Input
                type="text"
                id="apiKey"
                placeholder="Introduce tu API key de TMDB"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full mt-6">
              Guardar API Key
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-xs text-gray-500">
          Tu API key se guardará localmente en tu navegador.
        </CardFooter>
      </Card>
    </div>
  );
};

export default ApiKeySetup;
