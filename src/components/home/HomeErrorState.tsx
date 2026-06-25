
import React from 'react';
import { useLanguage } from '@/hooks/useLanguage';

const HomeErrorState = ({ error }: { error: string }) => {
  const { language } = useLanguage();
  
  return (
    <div className="text-center my-12">
      <p className="text-red-500">
        {error || (language === 'es' 
          ? 'Se ha producido un error al cargar el contenido.' 
          : 'An error occurred while loading content.')}
      </p>
    </div>
  );
};

export default HomeErrorState;
