
import { useState, useEffect, useRef } from 'react';
import { Platform } from '@/types/media';
import { fetchPopularProviders } from '@/services/tmdb/providers/fetchProvidersList';
import { useApiKey } from '@/hooks/useApiKey';
import { useLanguage } from '@/hooks/useLanguage';
import { useMediaFilters } from '@/contexts/MediaFiltersContext';
import { toast } from '@/components/ui/use-toast';

export const useProvidersData = () => {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isConfigured } = useApiKey();
  const { language } = useLanguage();
  const { filtersState, setSelectedPlatformIds } = useMediaFilters();
  const fetchedRef = useRef(false);

  // Cargar la lista de plataformas desde la API y los filtros seleccionados
  useEffect(() => {
    if (!isConfigured || fetchedRef.current) return;

    const loadPlatforms = async () => {
      try {
        setLoading(true);
        // Usamos ES (España) como región por defecto
        const region = 'ES';
        const providers = await fetchPopularProviders(region);
        setPlatforms(providers);
        console.log(`Loaded ${providers.length} platforms from the API`);
        
        // Verificamos si tenemos IDs de plataformas seleccionadas en el estado de filtros
        if (filtersState.selectedPlatformIds && filtersState.selectedPlatformIds.length > 0) {
          // Buscamos las plataformas que coinciden con los IDs en el estado de filtros
          const matchingPlatforms = providers.filter(p => 
            filtersState.selectedPlatformIds.includes(p.id)
          );
          
          if (matchingPlatforms.length > 0) {
            setSelectedPlatforms(matchingPlatforms);
            console.log('Using platforms from filters state:', matchingPlatforms.map(p => `${p.id}:${p.name}`));
            
            // Solo actualizamos localStorage para mantener consistencia
            localStorage.setItem('selectedPlatforms', JSON.stringify(matchingPlatforms));
          } else {
            console.log('No matching platforms found for IDs:', filtersState.selectedPlatformIds);
            // Si no se encuentran coincidencias, cargamos desde localStorage o usamos valores por defecto
            loadFromLocalStorageOrDefaults(providers);
          }
        } else {
          // Si no hay plataformas seleccionadas en el estado de filtros, cargamos desde localStorage
          loadFromLocalStorageOrDefaults(providers);
        }

        fetchedRef.current = true;
        setError(null);
      } catch (err) {
        console.error('Error fetching providers:', err);
        setError(language === 'es' 
          ? 'Error al cargar las plataformas de streaming.'
          : 'Error loading streaming platforms.');
      } finally {
        setLoading(false);
      }
    };
    
    loadPlatforms();
  }, [isConfigured, language, filtersState.selectedPlatformIds]);

  // Función auxiliar para cargar desde localStorage o valores por defecto
  const loadFromLocalStorageOrDefaults = (providers: Platform[]) => {
    try {
      const savedPlatforms = localStorage.getItem('selectedPlatforms');
      if (savedPlatforms) {
        const parsedPlatforms = JSON.parse(savedPlatforms);
        
        // Aseguramos que todas las plataformas tengan las propiedades requeridas
        const validPlatforms = parsedPlatforms.filter((platform: any) => 
          platform && typeof platform === 'object' && platform.id && platform.name
        );
        
        if (validPlatforms.length > 0) {
          setSelectedPlatforms(validPlatforms);
          
          // IMPORTANTE: Actualizar también el contexto de filtros con estos IDs
          const platformIds = validPlatforms.map((p: Platform) => p.id);
          setSelectedPlatformIds(platformIds);
          console.log('Updated filters state with platform IDs from localStorage:', platformIds);
          
          console.log('Loaded selected platforms from localStorage:', validPlatforms.map((p: Platform) => `${p.id}:${p.name}`));
        } else {
          throw new Error('Invalid platform data in localStorage');
        }
      } else {
        throw new Error('No saved platforms found');
      }
    } catch (err) {
      // Si hay error al cargar o procesar datos, usar valores por defecto
      const defaultPopular = providers.slice(0, 6);
      setSelectedPlatforms(defaultPopular);
      
      // IMPORTANTE: Actualizar también el contexto de filtros con estos IDs por defecto
      const defaultIds = defaultPopular.map(p => p.id);
      setSelectedPlatformIds(defaultIds);
      console.log('Updated filters state with default platform IDs:', defaultIds);
      
      localStorage.setItem('selectedPlatforms', JSON.stringify(defaultPopular));
      console.log('Using default platforms:', defaultPopular.map(p => `${p.id}:${p.name}`));
    }
  };

  // Función para establecer plataformas seleccionadas a partir de IDs
  const setSelectedPlatformsFromIds = (platformIds: number[]) => {
    // Manejar de forma segura el caso donde las plataformas aún no se han cargado
    if (platforms.length === 0) {
      console.warn('Cannot set selected platforms: platform list is empty');
      return;
    }
    
    // Filtrar cualquier ID de plataforma que no exista en nuestra lista de plataformas
    const validIds = platformIds.filter(id => platforms.some(p => p.id === id));
    
    // Mapear IDs a objetos de plataforma reales
    const matchingPlatforms = validIds.map(id => 
      platforms.find(p => p.id === id)
    ).filter((p): p is Platform => p !== undefined);
    
    // Actualizar estado local
    setSelectedPlatforms(matchingPlatforms);
    
    // Guardar en localStorage
    localStorage.setItem('selectedPlatforms', JSON.stringify(matchingPlatforms));
    console.log('Setting selected platforms:', matchingPlatforms.map(p => `${p.id}:${p.name}`));
    
    // Actualizar en el contexto de filtros
    console.log('Updating filters state with platform IDs:', validIds);
    setSelectedPlatformIds(validIds);
    
    // Mostrar notificación de plataformas actualizadas
    toast({
      title: language === 'es' ? 'Plataformas actualizadas' : 'Platforms updated',
      description: language === 'es' 
        ? 'Las plataformas han sido actualizadas. Vuelve a la pantalla principal para ver el contenido filtrado.'
        : 'Platforms have been updated. Return to the main screen to see filtered content.',
      duration: 3000,
    });
  };

  return { 
    platforms, 
    selectedPlatforms, 
    setSelectedPlatforms: setSelectedPlatformsFromIds, 
    loading, 
    error 
  };
};
