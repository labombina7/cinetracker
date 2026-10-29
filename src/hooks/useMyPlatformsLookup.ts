import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from '@/types/media';
import { fetchWatchProviders } from '@/services/tmdb/providers';
import { useMediaFilters } from '@/contexts/MediaFiltersContext';

const PROVIDER_CONCURRENCY = 5;
const REGION = 'ES';

type Item = { id: number; type: 'movie' | 'tv' };
const itemKey = (item: Item) => `${item.type}-${item.id}`;

// Ejecuta las tareas de N en N para no saturar TMDB
const runLimited = async <T,>(items: T[], limit: number, task: (item: T) => Promise<void>) => {
  const queue = [...items];
  const workers = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length) await task(queue.shift() as T);
  });
  await Promise.all(workers);
};

// Plataformas del usuario (de las elegidas en Ajustes) en las que está cada título.
// Solo consulta TMDB mientras `enabled` es true, y nunca dos veces el mismo título
export const useMyPlatformsLookup = (items: Item[], enabled: boolean) => {
  const { filtersState } = useMediaFilters();
  const selectedPlatformIds = filtersState.selectedPlatformIds;
  const hasPlatforms = selectedPlatformIds.length > 0;

  const [platformsByKey, setPlatformsByKey] = useState<Record<string, Platform[]>>({});
  const [loading, setLoading] = useState(false);
  const requested = useRef(new Set<string>());

  useEffect(() => {
    requested.current.clear();
    setPlatformsByKey({});
  }, [selectedPlatformIds]);

  useEffect(() => {
    if (!enabled || !hasPlatforms) return;
    const requestedKeys = requested.current;
    const pending = items.filter((item) => !requestedKeys.has(itemKey(item)));
    if (pending.length === 0) return;

    let cancelled = false;
    const resolved = new Set<string>();
    pending.forEach((item) => requestedKeys.add(itemKey(item)));
    setLoading(true);

    runLimited(pending, PROVIDER_CONCURRENCY, async (item) => {
      const providers = await fetchWatchProviders(item.id, item.type);
      const flatrate = providers?.results?.[REGION]?.flatrate ?? [];
      const mine = flatrate
        .filter((p) => selectedPlatformIds.includes(p.provider_id))
        .map((p) => ({ id: p.provider_id, name: p.provider_name, logoPath: p.logo_path }));
      if (cancelled) return;
      resolved.add(itemKey(item));
      setPlatformsByKey((prev) => ({ ...prev, [itemKey(item)]: mine }));
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
      setLoading(false);
      // Lo que no llegó a resolverse se vuelve a pedir la próxima vez
      pending.filter((item) => !resolved.has(itemKey(item))).forEach((item) => requestedKeys.delete(itemKey(item)));
    };
  }, [enabled, hasPlatforms, items, selectedPlatformIds]);

  const platformsFor = useCallback((item: Item) => platformsByKey[itemKey(item)] ?? [], [platformsByKey]);
  const isOnMyPlatforms = useCallback((item: Item) => platformsFor(item).length > 0, [platformsFor]);

  return { hasPlatforms, loading, platformsFor, isOnMyPlatforms };
};
