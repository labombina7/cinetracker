import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { isAuthenticated } from '@/services/trakt';
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '@/services/trakt';

export type FavoriteItem = {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  posterPath: string;
  year?: number;
};

const STORAGE_KEY = 'favorites';
const WARNING_SEEN_KEY = 'favorites_warning_seen';

const parseAndMigrate = (raw: string): FavoriteItem[] => {
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];
  // Migrate old format: number[] → {id, type, title, posterPath}
  if (parsed.length > 0 && typeof parsed[0] === 'number') {
    return parsed.map((id: number) => ({ id, type: 'movie' as const, title: '', posterPath: '' }));
  }
  return parsed
    .filter(
      (item: unknown): item is { id: number; type: 'movie' | 'tv' } =>
        typeof (item as FavoriteItem)?.id === 'number' &&
        ((item as FavoriteItem)?.type === 'movie' || (item as FavoriteItem)?.type === 'tv')
    )
    .map((item: { id: number; type: 'movie' | 'tv'; title?: string; posterPath?: string; year?: number }) => ({
      id: item.id,
      type: item.type,
      title: item.title ?? '',
      posterPath: item.posterPath ?? '',
      year: item.year,
    }));
};

const loadFromStorage = (): FavoriteItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? parseAndMigrate(raw) : [];
  } catch {
    if (import.meta.env.DEV) console.error('[FavoritesContext] Failed to parse localStorage');
    return [];
  }
};

interface FavoritesContextValue {
  favorites: FavoriteItem[];
  isSyncing: boolean;
  isFavorite: (id: number, type: 'movie' | 'tv') => boolean;
  toggleFavorite: (id: number, type: 'movie' | 'tv', title: string, releaseDate?: string, posterPath?: string) => Promise<void>;
  clearTraktFavorites: () => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(loadFromStorage);
  const [isSyncing, setIsSyncing] = useState(false);
  // Snapshot of local favorites before Trakt merge — used for logout cleanup
  const preTraktSnapshot = useRef<Set<string> | null>(null);

  // Persist on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  // Pull Trakt watchlist on mount and merge
  useEffect(() => {
    if (!isAuthenticated()) return;

    const controller = new AbortController();
    setIsSyncing(true);

    getWatchlist()
      .then((traktItems) => {
        if (controller.signal.aborted) return;

        setFavorites((local) => {
          // Save snapshot of what we had before merging
          preTraktSnapshot.current = new Set(local.map((f) => `${f.id}:${f.type}`));

          const merged = [...local];
          for (const item of traktItems) {
            const key = `${item.id}:${item.type}`;
            if (!preTraktSnapshot.current.has(key)) {
              merged.push(item);
            }
          }

          // Upload locals missing in Trakt (fire-and-forget)
          const traktKeys = new Set(traktItems.map((f) => `${f.id}:${f.type}`));
          for (const localItem of local) {
            if (!traktKeys.has(`${localItem.id}:${localItem.type}`)) {
              addToWatchlist(localItem.id, localItem.type, '', undefined);
            }
          }

          return merged;
        });
      })
      .catch(() => {
        toast.error('No se pudo sincronizar con Trakt. Se usará la lista local.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsSyncing(false);
      });

    return () => controller.abort();
  }, []);

  const isFavorite = (id: number, type: 'movie' | 'tv') =>
    favorites.some((f) => f.id === id && f.type === type);

  const toggleFavorite = async (
    id: number,
    type: 'movie' | 'tv',
    title: string,
    releaseDate?: string,
    posterPath = ''
  ) => {
    const year = releaseDate ? parseInt(releaseDate.substring(0, 4)) : undefined;
    const wasAlreadyFavorite = favorites.some((f) => f.id === id && f.type === type);

    if (wasAlreadyFavorite) {
      setFavorites((prev) => prev.filter((f) => !(f.id === id && f.type === type)));

      if (isAuthenticated()) {
        const ok = await removeFromWatchlist(id, type);
        if (!ok) {
          // Revert on Trakt error
          setFavorites((prev) => [...prev, { id, type, title, posterPath, year }]);
          toast.error(`No se pudo quitar "${title}" de Trakt. Inténtalo de nuevo.`);
          return;
        }
      }

      toast.success(`"${title}" eliminado de favoritos`);
    } else {
      // Optimistic add
      setFavorites((prev) => [...prev, { id, type, title, posterPath, year }]);

      // Show warning on first favorite without Trakt
      if (!isAuthenticated() && !localStorage.getItem(WARNING_SEEN_KEY)) {
        localStorage.setItem(WARNING_SEEN_KEY, 'true');
        showLocalWarningToast();
      }

      if (isAuthenticated()) {
        const ok = await addToWatchlist(id, type, title, releaseDate);
        if (ok) {
          toast.success(`"${title}" añadido a favoritos y a tu watchlist de Trakt`);
        } else {
          toast.success(`"${title}" añadido a favoritos`, {
            description: 'No se pudo sincronizar con Trakt.',
          });
        }
      } else {
        toast.success(`"${title}" añadido a favoritos`);
      }
    }
  };

  const clearTraktFavorites = () => {
    if (!preTraktSnapshot.current) return;
    const snapshot = preTraktSnapshot.current;
    setFavorites((prev) => prev.filter((f) => snapshot.has(`${f.id}:${f.type}`)));
    preTraktSnapshot.current = null;
  };

  return (
    <FavoritesContext.Provider value={{ favorites, isSyncing, isFavorite, toggleFavorite, clearTraktFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavoritesContext = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavoritesContext must be used inside FavoritesProvider');
  return ctx;
};

// Standalone toast — avoids importing navigate inside context
function showLocalWarningToast() {
  toast('Tus favoritos se guardan en este dispositivo', {
    description: 'Conecta Trakt para no perderlos si cambias de dispositivo o navegador.',
    duration: 8000,
    action: {
      label: 'Conectar Trakt',
      onClick: () => {
        window.location.hash = '#/auth/trakt';
      },
    },
  });
}
