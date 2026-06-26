
const TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

export const cachedFetch = async (url: string): Promise<Response> => {
  const now = Date.now();
  const entry = cache.get(url);

  if (entry && entry.expiresAt > now) {
    // Return a synthetic Response wrapping the cached data
    return new Response(JSON.stringify(entry.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const response = await fetch(url);
  if (response.ok) {
    const data = await response.json();
    cache.set(url, { data, expiresAt: now + TTL_MS });
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return response;
};

export const clearApiCache = () => cache.clear();
