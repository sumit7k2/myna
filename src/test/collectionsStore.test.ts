import { act } from '@testing-library/react-native';
import { useCollectionsStore } from '@/state/collections';
import { useBookmarksStore } from '@/state/bookmarks';

function reset() {
  useCollectionsStore.setState({ byId: {}, allIds: [], hydrated: false } as any, true);
  useBookmarksStore.setState({ bookmarked: {}, hydrated: false } as any, true);
}

describe('collections store', () => {
  beforeEach(() => reset());

  it('hydrates from query and creates collections', () => {
    act(() => {
      useCollectionsStore.getState().hydrateFromQuery([
        { id: 'c1', name: 'One', posts: { edges: [{ node: { id: 'p1' } }] } },
        { id: 'c2', name: 'Two', posts: { edges: [] } }
      ] as any);
    });
    const s1 = useCollectionsStore.getState();
    expect(s1.allIds).toEqual(['c1', 'c2']);
    expect(s1.byId['c1'].postIds).toEqual(['p1']);

    act(() => {
      useCollectionsStore.getState().createLocalCollection('c3', 'Three');
    });
    const s2 = useCollectionsStore.getState();
    expect(s2.allIds).toContain('c3');
    expect(s2.byId['c3'].name).toBe('Three');
  });

  it('adds posts to collection and marks bookmarked', () => {
    act(() => {
      useCollectionsStore.getState().createLocalCollection('c1', 'One');
      useCollectionsStore.getState().addPostToCollectionLocal('c1', 'p1');
    });
    const s = useCollectionsStore.getState();
    expect(s.byId['c1'].postIds).toContain('p1');
    expect(useBookmarksStore.getState().isBookmarked('p1')).toBe(true);
  });
});
