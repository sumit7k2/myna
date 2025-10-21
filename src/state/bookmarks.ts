import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/lib/storage';

export type BookmarksStoreState = {
  bookmarked: Record<string, boolean>;
  hydrated: boolean;
  isBookmarked: (postId: string) => boolean;
  toggleBookmark: (postId: string, force?: boolean) => void;
  setBookmarked: (postId: string, value: boolean) => void;
  reset: () => void;
};

export const useBookmarksStore = create<BookmarksStoreState>()(
  persist(
    (set, get) => ({
      bookmarked: {},
      hydrated: false,
      isBookmarked: (postId: string) => !!get().bookmarked[postId],
      toggleBookmark: (postId: string, force?: boolean) => {
        set((state) => {
          const next = { ...state.bookmarked };
          const nextVal = typeof force === 'boolean' ? force : !next[postId];
          next[postId] = nextVal;
          return { bookmarked: next };
        });
      },
      setBookmarked: (postId: string, value: boolean) => {
        set((state) => ({ bookmarked: { ...state.bookmarked, [postId]: value } }));
      },
      reset: () => set({ bookmarked: {} })
    }),
    {
      name: 'bookmarks-store',
      storage: createJSONStorage(() => ({
        setItem: (k, v) => storage.set(k, v),
        getItem: (k) => storage.getString(k) ?? null,
        removeItem: (k) => storage.delete(k)
      })),
      partialize: (s) => ({ bookmarked: s.bookmarked }) as any,
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true as any;
      }
    }
  )
);
