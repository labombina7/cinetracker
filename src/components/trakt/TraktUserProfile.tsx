
import React from 'react';
import { Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TraktUser } from '@/services/trakt/user';

interface TraktUserProfileProps {
  userInfo: TraktUser;
  onConfigureCredentials: () => void;
}

const TraktUserProfile: React.FC<TraktUserProfileProps> = ({
  userInfo,
  onConfigureCredentials,
}) => {
  return (
    <div className="flex flex-col items-center py-4">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <User className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-medium">{userInfo.username}</h3>
      <p className="text-muted-foreground">Conectado con Trakt.tv</p>
      
      <div className="bg-muted/50 rounded-lg p-4 mt-4 w-full">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-muted-foreground">Nombre:</div>
          <div>{userInfo.name || 'No disponible'}</div>
          
          <div className="text-muted-foreground">Ubicación:</div>
          <div>{userInfo.location || 'No disponible'}</div>
          
          <div className="text-muted-foreground">Películas:</div>
          <div>{userInfo.movies?.watched || 0} vistas</div>
          
          <div className="text-muted-foreground">Series:</div>
          <div>{userInfo.shows?.watched || 0} vistas</div>
        </div>
      </div>

      <Button 
        variant="outline" 
        size="sm" 
        onClick={onConfigureCredentials} 
        className="mt-4"
      >
        <Settings className="mr-2 h-3 w-3" />
        Configurar credenciales
      </Button>
    </div>
  );
};

export default TraktUserProfile;
