
import { toast } from '@/components/ui/use-toast';

/**
 * Handle media fetch errors with proper messaging
 */
export const handleFetchError = (err: Error, language: string): string => {
  console.error('Error fetching media:', err);
  
  const errorMessage = language === 'es' 
    ? 'Error al cargar los datos. Por favor, inténtalo de nuevo más tarde.'
    : 'Error loading data. Please try again later.';
    
  toast({
    variant: 'destructive',
    title: language === 'es' ? 'Error al cargar datos' : 'Error loading data',
    description: language === 'es' 
      ? 'Ha ocurrido un error al intentar cargar el contenido. Por favor, intenta de nuevo más tarde.'
      : 'An error occurred while loading content. Please try again later.',
  });
  
  return errorMessage;
};
