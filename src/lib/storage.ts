import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

export function setItem<T>(key: string, value: T) {
  storage.set(key, JSON.stringify(value));
}

export function getItem<T>(key: string, fallback: T): T {
  const v = storage.getString(key);
  if (!v) return fallback;
  try {
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
}
