
import { useCallback } from 'react';
import { Media } from '@/types/media';

export const usePlatformFilter = () => {
  const filterByPlatform = useCallback((items: Media[], platformIds: number[]): Media[] => {
    // Si no hay plataformas seleccionadas, devolver todos los resultados
    if (!platformIds.length) {
      console.log('No platform filters active, returning all items');
      return items;
    }
    
    console.log(`Filtering ${items.length} items by platforms: ${platformIds.join(', ')}`);
    
    // Verificar que tenemos elementos para filtrar
    if (!items || !items.length) {
      console.log('No items to filter');
      return [];
    }
    
    // Filtrar para incluir elementos que tienen las plataformas seleccionadas
    const filteredItems = items.filter(item => {
      // Skip items without providers
      if (!item.watchProviders) {
        return false;
      }
      
      // Extract all available providers for this item
      const allProviders = [
        ...(item.watchProviders.flatrate || []), 
        ...(item.watchProviders.rent || []),
        ...(item.watchProviders.buy || [])
      ];
      
      // Check if any provider matches the selected platforms
      const hasMatchingPlatform = allProviders.some(provider => 
        platformIds.includes(provider.provider_id)
      );
      
      // Detailed logging for matches
      if (hasMatchingPlatform) {
        const matchingProviders = allProviders
          .filter(p => platformIds.includes(p.provider_id))
          .map(p => `${p.provider_id}:${p.provider_name}`);
        console.log(`Item "${item.title}" matches platforms: ${matchingProviders.join(', ')}`);
      }
      
      return hasMatchingPlatform;
    });
    
    console.log(`After platform filtering: ${filteredItems.length} items remaining out of ${items.length}`);
    
    return filteredItems;
  }, []);

  return { filterByPlatform };
};
