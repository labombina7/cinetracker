import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CreditKind, FilmographyEntry } from '@/types/media';
import { useMediaFilters } from '@/contexts/MediaFiltersContext';
import { useMyPlatformsLookup } from './useMyPlatformsLookup';

export type TypeFilter = 'all' | 'movie' | 'tv';
export const ROLE_KINDS: CreditKind[] = ['acting', 'directing', 'writing', 'production'];

export interface FilmographyGroup {
  year: string | null; // null = sin fecha / anunciado
  entries: FilmographyEntry[];
}

export const usePersonFilmography = (filmography: FilmographyEntry[], primaryKind: CreditKind) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { filtersState } = useMediaFilters();
  const selectedPlatformIds = filtersState.selectedPlatformIds;

  // Tipos de rol con al menos un crédito: los chips de rol solo tienen sentido si hay más de uno
  const availableRoles = useMemo(
    () => ROLE_KINDS.filter((kind) => filmography.some((e) => e.roles.some((r) => r.kind === kind))),
    [filmography]
  );

  const typeParam = searchParams.get('type');
  const type: TypeFilter = typeParam === 'movie' || typeParam === 'tv' ? typeParam : 'all';
  const roleParam = searchParams.get('role') as CreditKind | 'all' | null;
  const defaultRole: CreditKind | 'all' = availableRoles.length > 1 && availableRoles.includes(primaryKind) ? primaryKind : 'all';
  const role: CreditKind | 'all' =
    roleParam === 'all' || (roleParam && availableRoles.includes(roleParam)) ? roleParam : defaultRole;
  const onlyMine = searchParams.get('mine') === '1' && selectedPlatformIds.length > 0;

  // replace: los filtros no crean entradas nuevas en el historial, pero sobreviven al volver de una ficha
  const updateParam = (key: string, value: string | null) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (value === null) next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true }
    );
  };

  const baseFiltered = useMemo(
    () =>
      filmography.filter(
        (e) => (type === 'all' || e.type === type) && (role === 'all' || e.roles.some((r) => r.kind === role))
      ),
    [filmography, type, role]
  );

  const lookup = useMyPlatformsLookup(baseFiltered, onlyMine);

  const visible = useMemo(
    () => (onlyMine ? baseFiltered.filter(lookup.isOnMyPlatforms) : baseFiltered),
    [onlyMine, baseFiltered, lookup.isOnMyPlatforms]
  );

  const groups = useMemo(() => {
    const result: FilmographyGroup[] = [];
    for (const entry of visible) {
      const year = entry.releaseDate ? entry.releaseDate.slice(0, 4) : null;
      const last = result[result.length - 1];
      if (last && last.year === year) last.entries.push(entry);
      else result.push({ year, entries: [entry] });
    }
    return result;
  }, [visible]);

  return {
    groups,
    total: filmography.length,
    visibleCount: visible.length,
    availableRoles,
    type,
    role,
    onlyMine,
    canFilterByPlatform: selectedPlatformIds.length > 0,
    loadingPlatforms: lookup.loading,
    platformsFor: lookup.platformsFor,
    setType: (value: TypeFilter) => updateParam('type', value === 'all' ? null : value),
    setRole: (value: CreditKind | 'all') => updateParam('role', value === defaultRole ? null : value),
    setOnlyMine: (value: boolean) => updateParam('mine', value ? '1' : null)
  };
};
