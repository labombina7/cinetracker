import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CreditKind, FilmographyEntry, Platform } from '@/types/media';
import { fetchWatchProviders } from '@/services/tmdb/providers';
import { useMediaFilters } from '@/contexts/MediaFiltersContext';

export type TypeFilter = 'all' | 'movie' | 'tv';
export const ROLE_KINDS: CreditKind[] = ['acting', 'directing', 'writing', 'production'];
const PROVIDER_CONCURRENCY = 5;
const REGION = 'ES';

export interface FilmographyGroup {
  year: string | null; // null = sin fecha / anunciado
  entries: FilmographyEntry[];
}

const entryKey = (e: FilmographyEntry) => `${e.type}-${e.id}`;

// Ejecuta las tareas de N en N para no saturar TMDB
const runLimited = async <T,>(items: T[], limit: number, task: (item: T) => Promise<void>) => {
  const queue = [...items];
  const workers = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length) await task(queue.shift() as T);
  });
  await Promise.all(workers);
};

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

  // Plataformas (de las del usuario) en las que está cada título; se piden solo al activar el filtro
  const [platformsByKey, setPlatformsByKey] = useState<Record<string, Platform[]>>({});
  const [loadingPlatforms, setLoadingPlatforms] = useState(false);
  const requested = useRef(new Set<string>());

  useEffect(() => {
    requested.current.clear();
    setPlatformsByKey({});
  }, [filmography, selectedPlatformIds]);

  useEffect(() => {
    if (!onlyMine) return;
    const requestedKeys = requested.current;
    const pending = baseFiltered.filter((e) => !requestedKeys.has(entryKey(e)));
    if (pending.length === 0) return;

    let cancelled = false;
    const resolved = new Set<string>();
    pending.forEach((e) => requestedKeys.add(entryKey(e)));
    setLoadingPlatforms(true);

    runLimited(pending, PROVIDER_CONCURRENCY, async (e) => {
      const providers = await fetchWatchProviders(e.id, e.type);
      const flatrate = providers?.results?.[REGION]?.flatrate ?? [];
      const mine = flatrate
        .filter((p) => selectedPlatformIds.includes(p.provider_id))
        .map((p) => ({ id: p.provider_id, name: p.provider_name, logoPath: p.logo_path }));
      if (cancelled) return;
      resolved.add(entryKey(e));
      setPlatformsByKey((prev) => ({ ...prev, [entryKey(e)]: mine }));
    }).finally(() => {
      if (!cancelled) setLoadingPlatforms(false);
    });

    return () => {
      cancelled = true;
      setLoadingPlatforms(false);
      // Lo que no llegó a resolverse se vuelve a pedir la próxima vez
      pending.filter((e) => !resolved.has(entryKey(e))).forEach((e) => requestedKeys.delete(entryKey(e)));
    };
  }, [onlyMine, baseFiltered, selectedPlatformIds]);

  const visible = useMemo(
    () => (onlyMine ? baseFiltered.filter((e) => (platformsByKey[entryKey(e)] ?? []).length > 0) : baseFiltered),
    [onlyMine, baseFiltered, platformsByKey]
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
    loadingPlatforms,
    platformsFor: (e: FilmographyEntry) => platformsByKey[entryKey(e)] ?? [],
    setType: (value: TypeFilter) => updateParam('type', value === 'all' ? null : value),
    setRole: (value: CreditKind | 'all') => updateParam('role', value === defaultRole ? null : value),
    setOnlyMine: (value: boolean) => updateParam('mine', value ? '1' : null)
  };
};
