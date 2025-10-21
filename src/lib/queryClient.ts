import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import type { Persister, PersistedClient } from '@tanstack/react-query-persist-client';
import { storage } from './storage';

const RQ_CACHE_KEY = 'reactQuery.cache';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      gcTime: 1000 * 60 * 60 // 1h
    }
  }
});

const mmkvPersister: Persister = {
  persistClient: async (client: PersistedClient) => {
    storage.set(RQ_CACHE_KEY, JSON.stringify(client));
  },
  restoreClient: async () => {
    const raw = storage.getString(RQ_CACHE_KEY);
    if (!raw) return undefined as any;
    try {
      return JSON.parse(raw) as PersistedClient;
    } catch {
      return undefined as any;
    }
  },
  removeClient: async () => {
    storage.delete(RQ_CACHE_KEY);
  }
};

persistQueryClient({
  queryClient,
  persister: mmkvPersister,
  buster: 'v1',
  maxAge: 1000 * 60 * 60
});
