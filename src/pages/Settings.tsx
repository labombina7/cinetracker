
import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { useProvidersData } from '@/hooks/useProvidersData';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Platform } from '@/types/media';
import { useToast } from '@/components/ui/use-toast';
import { useMediaFilters } from '@/contexts/MediaFiltersContext';
import { useNavigate } from 'react-router-dom';
import { useMediaFetch } from '@/hooks/useMediaFetch';

const translations = {
  es: {
    title: 'Configuración',
    platformsSection: 'Plataformas de streaming',
    description: 'Selecciona las plataformas de streaming que quieres usar en la aplicación.',
    saveSuccess: 'Configuración guardada correctamente',
    saveError: 'Error al guardar la configuración',
    loading: 'Cargando plataformas...',
    error: 'Error al cargar las plataformas',
    save: 'Guardar cambios'
  },
  en: {
    title: 'Settings',
    platformsSection: 'Streaming Platforms',
    description: 'Select the streaming platforms you want to use in the application.',
    saveSuccess: 'Settings saved successfully',
    saveError: 'Error saving settings',
    loading: 'Loading platforms...',
    error: 'Error loading platforms',
    save: 'Save changes'
  }
};

const Settings = () => {
  const { language } = useLanguage();
  const { platforms, selectedPlatforms, setSelectedPlatforms, loading, error } = useProvidersData();
  const [localSelectedPlatforms, setLocalSelectedPlatforms] = useState<Platform[]>([]);
  const { toast } = useToast();
  const { setSelectedPlatformIds, resetFiltersChanged } = useMediaFilters();
  const navigate = useNavigate();
  const { clearSavedResults } = useMediaFetch();
  const t = translations[language === 'es' ? 'es' : 'en'];

  useEffect(() => {
    // Update local state when selected platforms are loaded
    if (selectedPlatforms.length > 0) {
      setLocalSelectedPlatforms(selectedPlatforms);
    }
  }, [selectedPlatforms]);

  const handlePlatformToggle = (platform: Platform) => {
    setLocalSelectedPlatforms(current => {
      const isSelected = current.some(p => p.id === platform.id);
      if (isSelected) {
        return current.filter(p => p.id !== platform.id);
      } else {
        return [...current, platform];
      }
    });
  };

  const handleSave = () => {
    try {
      // Save to localStorage
      const platformsToSave = JSON.stringify(localSelectedPlatforms);
      localStorage.setItem('selectedPlatforms', platformsToSave);
      
      // Extract just the IDs for the filters context
      const platformIds = localSelectedPlatforms.map(platform => platform.id);
      
      // Clear cache to force refresh of data with new platforms
      clearSavedResults();
      console.log('Cleared media cache to force refresh with new platforms');
      
      // Update both providers context and MediaFiltersContext
      setSelectedPlatforms(platformIds);
      setSelectedPlatformIds(platformIds);
      
      // Reset filters and force changed flag to ensure refresh
      resetFiltersChanged();
      
      console.log('Updated platform IDs to:', platformIds);
      
      toast({
        description: t.saveSuccess,
      });
      
      // Use react-router's navigate without any window.location reloads
      // This ensures the React component tree is preserved
      navigate('/', { 
        state: { 
          from: 'settings',
          timestamp: Date.now(),
          forceRefresh: true,
          platformIds
        },
        replace: true
      });
      
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        variant: "destructive",
        description: t.saveError,
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <p className="text-center text-gray-500">{t.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <p className="text-center text-red-500">{t.error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">{t.title}</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">{t.platformsSection}</h2>
          <p className="text-sm text-gray-500 mb-4">{t.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platforms.map((platform) => (
              <div key={platform.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`platform-${platform.id}`}
                  checked={localSelectedPlatforms.some(p => p.id === platform.id)}
                  onCheckedChange={() => handlePlatformToggle(platform)}
                />
                <label
                  htmlFor={`platform-${platform.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {platform.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handleSave}>{t.save}</Button>
      </div>
    </div>
  );
};

export default Settings;
