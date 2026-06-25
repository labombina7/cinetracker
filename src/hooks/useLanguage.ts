
import { useState, useEffect } from 'react';

// Add a type for our supported languages
export type AppLanguage = 'es' | 'en';

export function useLanguage() {
  const [language, setLanguage] = useState<AppLanguage>('es');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('app_language');
    if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
      setLanguage(savedLanguage as AppLanguage);
    }
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === 'es' ? 'en' : 'es';
    setLanguage(newLanguage);
    localStorage.setItem('app_language', newLanguage);
    // Force reload to apply language change to all components
    window.location.reload();
  };

  return { language, toggleLanguage };
}
