import '@testing-library/jest-native/extend-expect';
import { server } from '@/mocks/test/msw';
import { setScenario } from '@/mocks/fixtures/scenario';

// In-memory mocks for native storage modules during tests
jest.mock('react-native-mmkv', () => {
  const store = new Map<string, string>();
  class MMKV {
    set(key: string, value: string | number | boolean) {
      store.set(key, String(value));
    }
    getString(key: string): string | undefined {
      return store.get(key);
    }
    getBoolean(key: string): boolean | undefined {
      const v = store.get(key);
      if (v === undefined) return undefined as any;
      return v === 'true';
    }
    delete(key: string) {
      store.delete(key);
    }
  }
  return { MMKV };
});

jest.mock('expo-secure-store', () => {
  const mem: Record<string, string> = {};
  return {
    getItemAsync: jest.fn(async (k: string) => (k in mem ? mem[k] : null)),
    setItemAsync: jest.fn(async (k: string, v: string) => {
      mem[k] = v;
    }),
    deleteItemAsync: jest.fn(async (k: string) => {
      delete mem[k];
    })
  };
});

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'bypass' });
});

afterEach(() => {
  server.resetHandlers();
  setScenario('default');
});

afterAll(() => {
  server.close();
});
