import * as SecureStore from 'expo-secure-store';
import { MMKV } from 'react-native-mmkv';

// Keys for tokens
const ACCESS_TOKEN_KEY = 'auth.accessToken';
const REFRESH_TOKEN_KEY = 'auth.refreshToken';

const mmkv = new MMKV();

async function getSecureItem(key: string): Promise<string | null> {
  if ((SecureStore as any)?.getItemAsync) {
    try {
      const v = await SecureStore.getItemAsync(key);
      return v ?? null;
    } catch {
      // fallthrough
    }
  }
  const v = mmkv.getString(key);
  return v ?? null;
}

async function setSecureItem(key: string, value: string): Promise<void> {
  if ((SecureStore as any)?.setItemAsync) {
    try {
      await SecureStore.setItemAsync(key, value);
      return;
    } catch {
      // fallthrough to mmkv
    }
  }
  mmkv.set(key, value);
}

async function deleteSecureItem(key: string): Promise<void> {
  if ((SecureStore as any)?.deleteItemAsync) {
    try {
      await SecureStore.deleteItemAsync(key);
      return;
    } catch {
      // fallthrough
    }
  }
  mmkv.delete(key);
}

export const tokenStorage = {
  async getAccessToken(): Promise<string | null> {
    return getSecureItem(ACCESS_TOKEN_KEY);
  },
  async setAccessToken(token: string): Promise<void> {
    return setSecureItem(ACCESS_TOKEN_KEY, token);
  },
  async getRefreshToken(): Promise<string | null> {
    return getSecureItem(REFRESH_TOKEN_KEY);
  },
  async setRefreshToken(token: string): Promise<void> {
    return setSecureItem(REFRESH_TOKEN_KEY, token);
  },
  async clear(): Promise<void> {
    await deleteSecureItem(ACCESS_TOKEN_KEY);
    await deleteSecureItem(REFRESH_TOKEN_KEY);
  }
};

export type TokenStorage = typeof tokenStorage;
