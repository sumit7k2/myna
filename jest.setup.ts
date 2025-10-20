import '@testing-library/jest-native/extend-expect';
import { server } from '@/mocks/test/msw';
import { setScenario } from '@/mocks/fixtures/scenario';

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
