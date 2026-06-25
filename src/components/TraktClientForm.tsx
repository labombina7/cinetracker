
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface TraktClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (clientId: string, clientSecret: string) => void;
}

const TraktClientForm: React.FC<TraktClientFormProps> = ({
  open,
  onOpenChange,
  onSave
}) => {
  const [clientId, setClientId] = useState<string>('');
  const [clientSecret, setClientSecret] = useState<string>('');
  
  // Load saved credentials on mount
  useEffect(() => {
    const savedClientId = localStorage.getItem('trakt_client_id');
    const savedClientSecret = localStorage.getItem('trakt_client_secret');
    
    if (savedClientId) setClientId(savedClientId);
    if (savedClientSecret) setClientSecret(savedClientSecret);
  }, []);

  const handleSave = () => {
    if (!clientId.trim()) {
      toast({
        title: "Error",
        description: "El Client ID es obligatorio",
        variant: "destructive",
      });
      return;
    }

    if (!clientSecret.trim()) {
      toast({
        title: "Error",
        description: "El Client Secret es obligatorio",
        variant: "destructive",
      });
      return;
    }
    
    onSave(clientId, clientSecret);
    onOpenChange(false);
    
    toast({
      title: "Credenciales guardadas",
      description: "Tus credenciales de Trakt.tv han sido guardadas correctamente.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurar credenciales de Trakt.tv</DialogTitle>
          <DialogDescription>
            Ingresa las credenciales de tu aplicación Trakt.tv para habilitar la autenticación.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 mr-2" />
              <div>
                <p className="font-medium text-amber-800">Debes registrar una aplicación en Trakt.tv</p>
                <p className="text-amber-700 mt-1">
                  Para obtener tu Client ID y Client Secret, debes registrar una nueva aplicación en{" "}
                  <a 
                    href="https://trakt.tv/oauth/applications/new" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline font-medium inline-flex items-center"
                  >
                    Trakt.tv <ExternalLink className="h-3 w-3 ml-0.5" />
                  </a>
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="clientId" className="text-right">
              Client ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="clientId"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Ingresa tu Client ID"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="clientSecret" className="text-right">
              Client Secret <span className="text-red-500">*</span>
            </Label>
            <Input
              id="clientSecret"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              type="password"
              placeholder="Ingresa tu Client Secret"
            />
          </div>
          <div className="text-sm text-muted-foreground mt-2">
            <p>Configura el Redirect URI en Trakt.tv como:</p>
            <code className="bg-muted px-1 py-0.5 rounded text-xs">
              {window.location.origin}/trakt-redirect.html
            </code>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TraktClientForm;
