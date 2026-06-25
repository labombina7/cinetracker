
import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TraktErrorStateProps {
  error: string;
  onRetry: () => void;
}

const TraktErrorState: React.FC<TraktErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="text-center py-4 space-y-4">
      <div className="text-destructive flex flex-col items-center">
        <AlertTriangle className="h-12 w-12 mb-2" />
        <p className="mb-2">Error de conexión con Trakt.tv</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
      <Button variant="outline" onClick={onRetry} className="mt-2">
        <RefreshCcw className="mr-2 h-4 w-4" />
        Intentar de nuevo
      </Button>
    </div>
  );
};

export default TraktErrorState;
