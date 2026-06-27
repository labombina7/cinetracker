import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Filter } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useMediaFilters } from '@/contexts/MediaFiltersContext';
import { Button } from '@/components/ui/button';

interface HomeEmptyStateProps {
  reason?: 'no-platforms' | 'filtered' | 'no-content';
}

const HomeEmptyState: React.FC<HomeEmptyStateProps> = ({ reason = 'no-content' }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { updateFilters } = useMediaFilters();

  const clearFilters = () => updateFilters({
    mediaType: 'all',
    spanishFilter: 'off',
    selectedGenreId: null,
    sortBy: 'none',
  });

  if (reason === 'no-platforms') {
    return (
      <div className="text-center my-12 space-y-3">
        <Settings className="h-10 w-10 text-muted-foreground mx-auto" />
        <p className="text-muted-foreground">
          {language === 'es'
            ? 'No has configurado ninguna plataforma de streaming.'
            : "You haven't configured any streaming platform yet."}
        </p>
        <Button onClick={() => navigate('/settings')} variant="outline">
          {language === 'es' ? 'Ir a Ajustes' : 'Go to Settings'}
        </Button>
      </div>
    );
  }

  if (reason === 'filtered') {
    return (
      <div className="text-center my-12 space-y-3">
        <Filter className="h-10 w-10 text-muted-foreground mx-auto" />
        <p className="text-muted-foreground">
          {language === 'es'
            ? 'Ningún resultado con los filtros actuales.'
            : 'No results with the current filters.'}
        </p>
        <Button onClick={clearFilters} variant="outline">
          {language === 'es' ? 'Limpiar filtros' : 'Clear filters'}
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center my-12">
      <p className="text-muted-foreground">
        {language === 'es'
          ? 'No encontramos contenido disponible. Prueba con otras plataformas.'
          : 'No content available right now. Try with other platforms.'}
      </p>
    </div>
  );
};

export default HomeEmptyState;
