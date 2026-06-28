
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Film, Heart, User, Globe, Settings } from 'lucide-react';
import { isAuthenticated } from '@/services/trakt';
import { useLanguage } from '@/hooks/useLanguage';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFavorites } from '@/hooks/useFavorites';

const Navbar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const { language, toggleLanguage } = useLanguage();
  const isMobile = useIsMobile();
  const { favorites, isSyncing } = useFavorites();

  return (
    <nav className="bg-background/70 border-b border-white/10 sticky top-0 z-10 backdrop-blur-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold flex items-center">
            <Film className="h-6 w-6 mr-2" />
            <span>CineTracker</span>
          </Link>
          
          <div className="flex items-center space-x-2">
            {!isMobile ? (
              <>
                <Button
                  variant={isActive('/explore') ? 'default' : 'ghost'}
                  asChild
                  size="sm"
                >
                  <Link to="/explore">{language === 'es' ? 'Explorar' : 'Explore'}</Link>
                </Button>
              </>
            ) : (
              <Button
                variant={isActive('/explore') ? 'default' : 'ghost'}
                asChild
                size="icon"
              >
                <Link to="/explore">
                  <Film className="h-4 w-4" />
                  <span className="sr-only">{language === 'es' ? 'Explorar' : 'Explore'}</span>
                </Link>
              </Button>
            )}
            
            <Button
              variant={isActive('/list') ? 'default' : 'ghost'}
              asChild
              size="icon"
              className="relative"
            >
              <Link to="/list">
                <Heart className="h-4 w-4" />
                {!isSyncing && favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center leading-none">
                    {favorites.length > 99 ? '99+' : favorites.length}
                  </span>
                )}
                <span className="sr-only">{language === 'es' ? 'Favoritos' : 'Favorites'}</span>
              </Link>
            </Button>

            <Button
              variant={isActive('/auth/trakt') ? 'default' : 'ghost'}
              asChild
              size="sm"
              className="relative"
            >
              <Link to="/auth/trakt">
                {isAuthenticated() ? (
                  <>
                    <User className="h-4 w-4 mr-2" />
                    {!isMobile && (
                      <span>{language === 'es' ? 'Cuenta' : 'Account'}</span>
                    )}
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-green-500" />
                  </>
                ) : (
                  <>
                    <User className="h-4 w-4 mr-2" />
                    {!isMobile && (
                      <span>{language === 'es' ? 'Conectar' : 'Connect'}</span>
                    )}
                  </>
                )}
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="relative"
              title={language === 'es' ? "Switch to English" : "Cambiar a Español"}
            >
              <Globe className="h-4 w-4" />
              <span className="sr-only">{language === 'es' ? 'Switch to English' : 'Cambiar a Español'}</span>
            </Button>

            <Button
              variant={isActive('/settings') ? 'default' : 'ghost'}
              asChild
              size="icon"
            >
              <Link to="/settings">
                <Settings className="h-4 w-4" />
                <span className="sr-only">{language === 'es' ? 'Configuración' : 'Settings'}</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
