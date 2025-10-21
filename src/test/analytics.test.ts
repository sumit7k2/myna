import { identify, screen, setAnalytics, track } from '@/lib/analytics';

describe('analytics stub', () => {
  it('no-ops by default', () => {
    // should not throw
    expect(() => {
      identify('user-1');
      screen('Home');
      track('TestEvent', { a: 1 });
    }).not.toThrow();
  });

  it('delegates to provided adapter', () => {
    const adapter = {
      identify: jest.fn(),
      track: jest.fn(),
      screen: jest.fn(),
      logError: jest.fn()
    };
    setAnalytics(adapter);

    identify('user-2', { plan: 'pro' });
    screen('Settings', { source: 'deeplink' });
    track('Click', { id: 123 });

    expect(adapter.identify).toHaveBeenCalledWith('user-2', { plan: 'pro' });
    expect(adapter.screen).toHaveBeenCalledWith('Settings', { source: 'deeplink' });
    expect(adapter.track).toHaveBeenCalledWith('Click', { id: 123 });
  });
});
