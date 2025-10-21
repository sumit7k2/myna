import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/lib/storage';
import { useBookmarksStore } from './bookmarks';

export type Collection = {
  id: string;
  name: string;
  postIds: string[];
};

export type CollectionsStoreState = {
  byId: Record<string, Collection>;
  allIds: string[];
  hydrated: boolean;
  hydrateFromQuery: (collections: { id: string; name: string; posts?: { edges: { node: { id: string } }[] } }[]) => void;
  createLocalCollection: (id: string, name: string) => void;
  addPostToCollectionLocal: (collectionId: string, postId: string) => void;
  reset: () => void;
};

export const useCollectionsStore = create<CollectionsStoreState>()(
  persist(
    (set, get) => ({
      byId: {},
      allIds: [],
      hydrated: false,
      hydrateFromQuery: (collections) => {
        set((state) => {
          const byId = { ...state.byId } as Record<string, Collection>;
          const allIds = new Set(state.allIds);
          for (const c of collections) {
            const id = c.id;
            allIds.add(id);
            byId[id] = {
              id,
              name: c.name,
              postIds: (c.posts?.edges ?? []).map((e) => e.node.id)
            };
          }
          return { byId, allIds: Array.from(allIds) };
        });
      },
      createLocalCollection: (id, name) => {
        set((state) => {
          if (state.byId[id]) return state;
          return {
            byId: { ...state.byId, [id]: { id, name, postIds: [] } },
            allIds: [...state.allIds, id]
          };
        });
      },
      addPostToCollectionLocal: (collectionId, postId) => {
        set((state) => {
          const col = state.byId[collectionId];
          if (!col) return state;
          if (!col.postIds.includes(postId)) {
            const updated = { ...col, postIds: [...col.postIds, postId] };
            // mark as bookmarked in global store
            useBookmarksStore.getState().setBookmarked(postId, true);
            return { byId: { ...state.byId, [collectionId]: updated } };
          }
          return state;
        });
      },
      reset: () => set({ byId: {}, allIds: [] })
    }),
    {
      name: 'collections-store',
      storage: createJSONStorage(() => ({
        setItem: (k, v) => storage.set(k, v),
        getItem: (k) => storage.getString(k) ?? null,
        removeItem: (k) => storage.delete(k)
      })),
      partialize: (s) => ({ byId: s.byId, allIds: s.allIds }) as any,
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true as any;
      }
    }
  )
);
