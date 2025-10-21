import { useEffect } from 'react';
import { Image as ExpoImage } from 'expo-image';

export async function prefetchImages(uris: string[], concurrency = 4): Promise<void> {
  const unique = Array.from(new Set((uris || []).filter(Boolean)));
  if (unique.length === 0) return;

  const queue = unique.slice();
  const workers: Promise<void>[] = [];

  async function worker() {
    while (queue.length > 0) {
      const uri = queue.shift();
      if (!uri) return;
      try {
        await ExpoImage.prefetch(uri);
      } catch {}
    }
  }

  for (let i = 0; i < Math.max(1, concurrency); i++) {
    workers.push(worker());
  }
  await Promise.all(workers);
}

export function usePrefetchImages(uris: string[] | undefined | null, enabled = true) {
  useEffect(() => {
    if (!enabled || !uris || uris.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        await prefetchImages(uris);
      } catch {}
    })();
    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(Array.from(new Set(uris || [])))]);
}
