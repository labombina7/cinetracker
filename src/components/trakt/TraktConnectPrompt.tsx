
import React from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TraktConnectPromptProps {
  onConfigureCredentials: () => void;
}

const TraktConnectPrompt: React.FC<TraktConnectPromptProps> = ({ onConfigureCredentials }) => {
  return (
    <div className="text-center py-6">
      <p className="mb-4">
        Al conectar tu cuenta de Trakt.tv, podrás sincronizar tus películas y series favoritas con tu Watch List.
      </p>
      <Button 
        variant="outline" 
        onClick={onConfigureCredentials} 
        className="mb-4"
      >
        <Settings className="mr-2 h-4 w-4" />
        Configurar credenciales
      </Button>
    </div>
  );
};

export default TraktConnectPrompt;
