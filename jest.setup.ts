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

// Prevent any Sentry network calls during tests
jest.mock('sentry-expo', () => {
  const init = jest.fn();
  const captureException = jest.fn();
  const captureMessage = jest.fn();
  const addBreadcrumb = jest.fn();
  class ReactNavigationInstrumentation {
    registerNavigationContainer() {}
  }
  class ReactNativeTracing {
    constructor(_opts?: any) {}
  }
  return {
    init,
    Native: {
      captureException,
      captureMessage,
      addBreadcrumb,
      ReactNavigationInstrumentation,
      ReactNativeTracing,
    },
  };
});

// Stub analytics libraries if present to avoid network in tests
jest.mock('expo-analytics-segment', () => ({
  Analytics: {
    identify: jest.fn(),
    track: jest.fn(),
    screen: jest.fn(),
    flush: jest.fn(),
  },
}));

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
