import { Linking } from 'react-native';
import { setScenario } from './fixtures/scenario';

function parseScenarioFromUrl(url: string): string | null {
  // Supports: expotsstarter://msw?scenario=name or expotsstarter://msw/name
  const mswIndex = url.indexOf('://msw');
  if (mswIndex === -1) return null;
  const qsIndex = url.indexOf('?');
  const hasQuery = qsIndex !== -1;
  if (hasQuery) {
    const query = url.slice(qsIndex + 1);
    const params = query.split('&').reduce<Record<string, string>>((acc, part) => {
      const [k, v] = part.split('=');
      acc[decodeURIComponent(k)] = decodeURIComponent(v ?? '');
      return acc;
    }, {});
    if (params.scenario) return params.scenario;
  }
  // try path segment after msw/
  const pathStart = url.indexOf('://msw/');
  if (pathStart !== -1) {
    const rest = url.slice(pathStart + '://msw/'.length);
    const seg = rest.split('?')[0].split('#')[0];
    if (seg) return seg;
  }
  return null;
}

export function registerMockDevTools() {
  (globalThis as any).__MSW_SET_SCENARIO = (name: string) => setScenario(name as any);

  const sub = Linking.addEventListener('url', ({ url }) => {
    const s = parseScenarioFromUrl(url);
    if (s) setScenario(s as any);
  });

  // Handle cold start via deep link
  Linking.getInitialURL().then((url) => {
    if (url) {
      const s = parseScenarioFromUrl(url);
      if (s) setScenario(s as any);
    }
  });

  return () => {
    try {
      // RN 0.71+ returns EmitterSubscription with remove() method
      (sub as any)?.remove?.();
    } catch {}
  };
}
