
import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';

const HomeEmptyState = () => {
  const { language } = useLanguage();
  
  return (
    <div className="text-center my-12">
      <p className="text-gray-500">
        {language === 'es' 
          ? 'No se encontraron resultados para los filtros seleccionados.' 
          : 'No results found for the selected filters.'}
      </p>
    </div>
  );
};

export default HomeEmptyState;
