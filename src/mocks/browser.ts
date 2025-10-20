import { setupWorker } from 'msw/browser';
import { handlers } from './handlers/graphql';

export const worker = setupWorker(...handlers);

export async function startWorker() {
  await worker.start({
    onUnhandledRequest: 'bypass'
  });
}
