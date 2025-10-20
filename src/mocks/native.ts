import { setupServer } from 'msw/native';
import { handlers } from './handlers/graphql';

let server: ReturnType<typeof setupServer> | null = null;

export async function startWorker() {
  if (server) return;
  server = setupServer(...handlers);
  server.listen({ onUnhandledRequest: 'bypass' });
  if (__DEV__) {
    console.log('[MSW] Native server listening');
  }
}
