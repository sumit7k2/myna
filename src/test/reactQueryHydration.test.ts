import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import type { Persister, PersistedClient } from '@tanstack/react-query-persist-client';
import { storage } from '@/lib/storage';

const KEY = 'rq.cache.test';

const persister: Persister = {
  persistClient: async (client: PersistedClient) => {
    storage.set(KEY, JSON.stringify(client));
  },
  restoreClient: async () => {
    const v = storage.getString(KEY);
    if (!v) return undefined as any;
    return JSON.parse(v) as PersistedClient;
  },
  removeClient: async () => {
    storage.delete(KEY);
  }
};

describe('React Query persistence and hydration with MMKV', () => {
  beforeEach(() => {
    storage.delete(KEY);
  });

  it('persists cache to MMKV and hydrates on new client', async () => {
    const qc1 = new QueryClient();
    persistQueryClient({ queryClient: qc1, persister, buster: 'vtest', maxAge: 1000 * 60 });

    qc1.setQueryData(['greeting'], 'hello');

    // Simulate app restart with a new QueryClient
    const qc2 = new QueryClient();
    persistQueryClient({ queryClient: qc2, persister, buster: 'vtest', maxAge: 1000 * 60 });

    const restored = qc2.getQueryData<string>(['greeting']);
    expect(restored).toBe('hello');
  });
});
