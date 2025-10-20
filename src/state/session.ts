import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/lib/storage';
import { tokenStorage } from '@/lib/auth/tokenStorage';
import { apolloClient } from '@/lib/apollo';
import { queryClient } from '@/lib/queryClient';
import { refresh as manualRefresh } from '@/features/auth/refresh';

export type AuthUser = {
  id: string;
  username: string;
  name: string;
  avatarUrl?: string | null;
};

export type SessionState = {
  user: AuthUser | null;
  initialized: boolean;
  isAuthenticated: boolean;
  onboardingComplete: boolean;
  // actions
  initialize: () => Promise<void>;
  login: (user: AuthUser, tokens: { accessToken: string; refreshToken: string }) => Promise<void>;
  signup: (user: AuthUser, tokens: { accessToken: string; refreshToken: string }) => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: () => void;
  backgroundRefresh: () => Promise<boolean>;
};

const ONBOARD_KEY = 'onboarding.complete';

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      user: null,
      initialized: false,
      isAuthenticated: false,
      onboardingComplete: storage.getBoolean?.(ONBOARD_KEY) ?? false,
      async initialize() {
        // Attempt to load tokens and refresh in background
        const refreshToken = await tokenStorage.getRefreshToken();
        if (refreshToken) {
          const ok = await get().backgroundRefresh();
          set({ isAuthenticated: ok, initialized: true });
        } else {
          set({ isAuthenticated: false, initialized: true });
        }
      },
      async login(user, tokens) {
        await tokenStorage.setAccessToken(tokens.accessToken);
        await tokenStorage.setRefreshToken(tokens.refreshToken);
        set({ user, isAuthenticated: true });
      },
      async signup(user, tokens) {
        await tokenStorage.setAccessToken(tokens.accessToken);
        await tokenStorage.setRefreshToken(tokens.refreshToken);
        // For a new user, mark onboarding as not complete
        storage.set(ONBOARD_KEY, 'false');
        set({ user, isAuthenticated: true, onboardingComplete: false });
      },
      async signOut() {
        await tokenStorage.clear();
        storage.delete(ONBOARD_KEY);
        set({ user: null, isAuthenticated: false, onboardingComplete: false });
        try {
          await Promise.all([apolloClient.clearStore(), queryClient.clear()]);
        } catch {
          // noop
        }
      },
      completeOnboarding() {
        storage.set(ONBOARD_KEY, 'true');
        set({ onboardingComplete: true });
      },
      async backgroundRefresh() {
        // Use manual refresh helper which calls the refresh mutation via fetch
        const ok = await manualRefresh();
        return ok;
      }
    }),
    {
      name: 'session',
      // Persist only lightweight flags; exclude tokens (handled by SecureStore/MMKV)
      storage: createJSONStorage(() => ({
        setItem: (k, v) => storage.set(k, v),
        getItem: (k) => storage.getString(k) ?? null,
        removeItem: (k) => storage.delete(k)
      })),
      partialize: (state) => ({
        initialized: state.initialized,
        isAuthenticated: state.isAuthenticated,
        onboardingComplete: state.onboardingComplete
      }) as any
    }
  )
);
