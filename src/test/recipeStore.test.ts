import { act } from '@testing-library/react-native';
import { useRecipeStore } from '@/state/recipe';

function resetStore() {
  const initial = {
    entities: {},
    feed: { forYou: { ids: [], cursor: null, hasNextPage: true }, following: { ids: [], cursor: null, hasNextPage: true } },
    slider: { open: false, ids: [], index: 0 },
    hydrated: false
  } as any;
  useRecipeStore.setState(initial, true);
}

const page1 = {
  edges: [
    { cursor: 'p1', node: { id: 'p1', content: 'A', likesCount: 0, viewerHasLiked: false } },
    { cursor: 'p2', node: { id: 'p2', content: 'B', likesCount: 1, viewerHasLiked: true } }
  ],
  pageInfo: { hasNextPage: true, endCursor: 'p2' }
};

const page2 = {
  edges: [
    { cursor: 'p3', node: { id: 'p3', content: 'C', likesCount: 0, viewerHasLiked: false } }
  ],
  pageInfo: { hasNextPage: false, endCursor: 'p3' }
};

describe('recipe store', () => {
  beforeEach(() => {
    resetStore();
  });

  it('merges feed pages and refreshes', () => {
    act(() => {
      useRecipeStore.getState().mergeFeedPage('forYou', page1 as any);
      useRecipeStore.getState().mergeFeedPage('forYou', page2 as any);
    });
    const s1 = useRecipeStore.getState();
    expect(s1.feed.forYou.ids).toEqual(['p1', 'p2', 'p3']);
    expect(s1.feed.forYou.cursor).toBe('p3');
    expect(s1.entities['p2'].content).toBe('B');

    const refreshed = {
      edges: [{ cursor: 'p4', node: { id: 'p4', content: 'D' } }],
      pageInfo: { hasNextPage: true, endCursor: 'p4' }
    };
    act(() => {
      useRecipeStore.getState().refreshFeed('forYou', refreshed as any);
    });
    const s2 = useRecipeStore.getState();
    expect(s2.feed.forYou.ids).toEqual(['p4']);
    expect(s2.entities['p4'].content).toBe('D');
  });

  it('opens slider and navigates next/prev', () => {
    act(() => {
      useRecipeStore.getState().refreshFeed('forYou', page1 as any);
      useRecipeStore.getState().openSlider(['p1', 'p2'], 0);
    });
    expect(useRecipeStore.getState().slider.open).toBe(true);
    expect(useRecipeStore.getState().slider.index).toBe(0);
    act(() => useRecipeStore.getState().next());
    expect(useRecipeStore.getState().slider.index).toBe(1);
    act(() => useRecipeStore.getState().next());
    expect(useRecipeStore.getState().slider.index).toBe(1);
    act(() => useRecipeStore.getState().prev());
    expect(useRecipeStore.getState().slider.index).toBe(0);
    act(() => useRecipeStore.getState().closeSlider());
    expect(useRecipeStore.getState().slider.open).toBe(false);
  });

  it('supports optimistic patch with revert on failure', async () => {
    act(() => {
      useRecipeStore.getState().refreshFeed('forYou', page1 as any);
    });
    const before = useRecipeStore.getState().entities['p1'];

    let rejectFn: (e: any) => void = () => {};
    const commit = new Promise((_res, rej) => {
      rejectFn = rej;
    });

    act(() => {
      useRecipeStore.getState().updateRecipeOptimistic('p1', { likesCount: (before.likesCount || 0) + 1 }, commit);
    });
    expect(useRecipeStore.getState().entities['p1'].likesCount).toBe((before.likesCount || 0) + 1);

    // Reject the commit, should revert
    await act(async () => {
      rejectFn(new Error('fail'));
      await commit.catch(() => {});
    });
    expect(useRecipeStore.getState().entities['p1'].likesCount).toBe(before.likesCount);
  });
});
