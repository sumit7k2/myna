import { act } from '@testing-library/react-native';
import { tokenStorage } from '@/lib/auth/tokenStorage';
import { useSessionStore } from '@/state/session';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => {}),
  deleteItemAsync: jest.fn(async () => {}),
}));

// Ensure a clean store before each test
beforeEach(async () => {
  await act(async () => {
    await useSessionStore.getState().signOut();
  });
});

describe('Session token persistence and refresh', () => {
  it('saves tokens on login via session store', async () => {
    const setAccessSpy = jest.spyOn(tokenStorage, 'setAccessToken');
    const setRefreshSpy = jest.spyOn(tokenStorage, 'setRefreshToken');
    await act(async () => {
      await useSessionStore.getState().login(
        { id: 'u1', username: 'jdoe', name: 'John Doe', avatarUrl: null },
        { accessToken: 'a1', refreshToken: 'r1' }
      );
    });
    expect(setAccessSpy).toHaveBeenCalledWith('a1');
    expect(setRefreshSpy).toHaveBeenCalledWith('r1');
  });

  it('attempts background refresh on initialize when refresh token exists', async () => {
    const getRefreshSpy = jest.spyOn(tokenStorage, 'getRefreshToken').mockResolvedValue('r1');
    const setAccessSpy = jest.spyOn(tokenStorage, 'setAccessToken');

    await act(async () => {
      await useSessionStore.getState().initialize();
    });

    expect(getRefreshSpy).toHaveBeenCalled();
    // After mocks refresh handler returns new token, access token setter should be called
    expect(setAccessSpy).toHaveBeenCalled();
    expect(useSessionStore.getState().isAuthenticated).toBe(true);
  });
});
