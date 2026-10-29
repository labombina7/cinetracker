import React, { useState } from 'react';
import { ClipboardPaste } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TraktPasteCodeProps {
  onSubmit: (value: string) => void;
  submitting: boolean;
}

const TraktPasteCode: React.FC<TraktPasteCodeProps> = ({ onSubmit, submitting }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSubmit(value);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-muted/50 rounded-lg p-4 mt-4 text-sm space-y-3">
      <div>
        <p className="font-medium">Último paso: pega la URL de vuelta</p>
        <p className="text-muted-foreground mt-1">
          Tras autorizar en Trakt.tv, el navegador abrirá una página de <code>localhost</code> que no carga.
          Es normal: copia la URL completa de la barra de direcciones y pégala aquí.
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="traktRedirectUrl">URL de redirección</Label>
        <Input
          id="traktRedirectUrl"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="http://localhost:8084/trakt-redirect.html?code=..."
          autoComplete="off"
        />
      </div>
      <Button type="submit" className="w-full" disabled={submitting || !value.trim()}>
        <ClipboardPaste className="mr-2 h-4 w-4" />
        {submitting ? 'Conectando...' : 'Completar conexión'}
      </Button>
    </form>
  );
};

export default TraktPasteCode;
