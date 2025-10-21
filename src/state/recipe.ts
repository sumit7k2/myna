import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { storage } from '@/lib/storage';

export type FeedType = 'forYou' | 'following';

export type Recipe = {
  id: string;
  title?: string;
  content?: string;
  likesCount?: number;
  viewerHasLiked?: boolean;
};

export type FeedState = {
  ids: string[];
  cursor: string | null;
  hasNextPage: boolean;
};

export type SliderState = {
  open: boolean;
  ids: string[];
  index: number;
};

export type RecipeStoreState = {
  entities: Record<string, Recipe>;
  feed: Record<FeedType, FeedState>;
  slider: SliderState;
  hydrated: boolean;
  // actions
  setFeedRecipe: (feed: FeedType, recipe: Recipe) => void;
  mergeFeedPage: (
    feed: FeedType,
    page: { edges: { cursor: string; node: Recipe }[]; pageInfo: { hasNextPage: boolean; endCursor?: string | null } }
  ) => void;
  refreshFeed: (
    feed: FeedType,
    page: { edges: { cursor: string; node: Recipe }[]; pageInfo: { hasNextPage: boolean; endCursor?: string | null } }
  ) => void;
  openSlider: (ids: string[], index?: number) => void;
  closeSlider: () => void;
  next: () => void;
  prev: () => void;
  updateRecipeOptimistic: (
    id: string,
    patch: Partial<Recipe>,
    commit?: Promise<any>
  ) => { revert: () => void };
};

const initialFeedState: FeedState = { ids: [], cursor: null, hasNextPage: true };
const initialSlider: SliderState = { open: false, ids: [], index: 0 };

export const useRecipeStore = create<RecipeStoreState>()(
  persist(
    (set, get) => ({
      entities: {},
      feed: { forYou: { ...initialFeedState }, following: { ...initialFeedState } },
      slider: { ...initialSlider },
      hydrated: false,
      setFeedRecipe(feed, recipe) {
        set((state) => {
          const ids = new Set(state.feed[feed].ids);
          ids.add(recipe.id);
          return {
            entities: { ...state.entities, [recipe.id]: { ...state.entities[recipe.id], ...recipe } },
            feed: { ...state.feed, [feed]: { ...state.feed[feed], ids: Array.from(ids) } }
          };
        });
      },
      mergeFeedPage(feed, page) {
        set((state) => {
          const nextEntities = { ...state.entities } as Record<string, Recipe>;
          const nextIds = state.feed[feed].ids.slice();
          for (const edge of page.edges) {
            const id = edge.node.id;
            nextEntities[id] = { ...nextEntities[id], ...edge.node };
            if (!nextIds.includes(id)) nextIds.push(id);
          }
          return {
            entities: nextEntities,
            feed: {
              ...state.feed,
              [feed]: {
                ids: nextIds,
                hasNextPage: page.pageInfo.hasNextPage,
                cursor: page.pageInfo.endCursor ?? null
              }
            }
          };
        });
      },
      refreshFeed(feed, page) {
        set((state) => {
          const nextEntities = { ...state.entities } as Record<string, Recipe>;
          const nextIds: string[] = [];
          for (const edge of page.edges) {
            const id = edge.node.id;
            nextEntities[id] = { ...nextEntities[id], ...edge.node };
            nextIds.push(id);
          }
          return {
            entities: nextEntities,
            feed: {
              ...state.feed,
              [feed]: {
                ids: nextIds,
                hasNextPage: page.pageInfo.hasNextPage,
                cursor: page.pageInfo.endCursor ?? null
              }
            }
          };
        });
      },
      openSlider(ids, index = 0) {
        set({ slider: { open: true, ids, index: Math.max(0, Math.min(index, Math.max(0, ids.length - 1))) } });
      },
      closeSlider() {
        set({ slider: { ...initialSlider } });
      },
      next() {
        set((s) => ({ slider: { ...s.slider, index: Math.min(s.slider.index + 1, Math.max(0, s.slider.ids.length - 1)) } }));
      },
      prev() {
        set((s) => ({ slider: { ...s.slider, index: Math.max(0, s.slider.index - 1) } }));
      },
      updateRecipeOptimistic(id, patch, commit) {
        const prev = get().entities[id];
        set((state) => ({ entities: { ...state.entities, [id]: { ...prev, ...patch } } }));
        const revert = () => set((state) => ({ entities: { ...state.entities, [id]: prev } }));
        if (commit) {
          commit.catch(() => revert());
        }
        return { revert };
      }
    }),
    {
      name: 'recipe-store',
      storage: createJSONStorage(() => ({
        setItem: (k, v) => storage.set(k, v),
        getItem: (k) => storage.getString(k) ?? null,
        removeItem: (k) => storage.delete(k)
      })),
      partialize: (state) => ({
        entities: state.entities,
        feed: state.feed,
        slider: state.slider
      }) as any,
      onRehydrateStorage: () => (state, _err) => {
        // When hydration finishes, set a flag
        if (state) state.hydrated = true as any;
      }
    }
  )
);
