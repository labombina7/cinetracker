
import React from 'react';
import { AlertTriangle, ExternalLink, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TraktConnectionInstructionsProps {
  onConfigureCredentials: () => void;
}

const TraktConnectionInstructions: React.FC<TraktConnectionInstructionsProps> = ({
  onConfigureCredentials,
}) => {
  return (
    <div className="text-center py-4 space-y-4">
      <div className="flex flex-col items-center">
        <AlertTriangle className="h-12 w-12 mb-2 text-amber-500" />
        <p className="mb-2">Es necesario configurar credenciales</p>
        <p className="text-sm text-muted-foreground">
          Debes registrar una aplicación en Trakt.tv para obtener tus credenciales.
        </p>
        <Button 
          variant="outline" 
          onClick={onConfigureCredentials} 
          className="mt-4"
        >
          <Key className="mr-2 h-4 w-4" />
          Configurar credenciales
        </Button>
      </div>
      
      <div className="bg-muted/50 rounded-lg p-4 mt-6 text-sm">
        <h4 className="font-medium mb-2">¿Cómo obtener tus credenciales?</h4>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Regístrate en <a 
            href="https://trakt.tv" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary font-medium inline-flex items-center"
          >
            Trakt.tv <ExternalLink className="h-3 w-3 ml-0.5" />
          </a>
          </li>
          <li>Ve a <a 
            href="https://trakt.tv/oauth/applications/new" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary font-medium inline-flex items-center"
          >
            Crear Nueva Aplicación <ExternalLink className="h-3 w-3 ml-0.5" />
          </a>
          </li>
          <li>Completa el formulario con la siguiente información:
            <ul className="list-disc pl-5 mt-1">
              <li>Nombre: CineTracker (o el que prefieras)</li>
              <li>Redirect URI: <code className="bg-muted px-1 py-0.5 rounded">{window.location.origin}/auth/callback</code></li>
              <li>Descripción: Sincronización de películas y series</li>
              <li>Acepta los términos y condiciones</li>
            </ul>
          </li>
          <li>Copia el Client ID y Client Secret generados</li>
          <li>Pégalos en el formulario de configuración de esta aplicación</li>
        </ol>
      </div>
    </div>
  );
};

export default TraktConnectionInstructions;
