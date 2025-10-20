import { server } from '@/mocks/server/node';
import { setScenario } from '@/mocks/fixtures/scenario';

export { server };

export function useScenario(name: Parameters<typeof setScenario>[0]) {
  setScenario(name as any);
}
