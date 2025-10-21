import React from 'react';
import { render, fireEvent, act, within } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TamaguiProvider, Theme } from 'tamagui';
import config from '../../tamagui.config';
import { ApolloProvider } from '@apollo/client';
import { apolloClient } from '@/lib/apollo';
import CollectionCreateForm from '@/features/collections/CollectionCreateForm';
import AddToCollectionSheet from '@/features/collections/AddToCollectionSheet';
import CollectionDetail from '@/features/collections/CollectionDetail';
import * as shareModule from '@/features/collections/share';
import { useCollectionsStore } from '@/state/collections';
import { useBookmarksStore } from '@/state/bookmarks';

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider>
      <TamaguiProvider config={config}>
        <Theme name="light">
          <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
        </Theme>
      </TamaguiProvider>
    </SafeAreaProvider>
  );
}

function renderWithProviders(ui: React.ReactElement) {
  return render(ui, { wrapper: Providers as any });
}

describe('collections components', () => {
  beforeEach(() => {
    useCollectionsStore.setState({ byId: {}, allIds: [], hydrated: false } as any, true);
    useBookmarksStore.setState({ bookmarked: {}, hydrated: false } as any, true);
  });

  it('creates a collection from form and updates store', async () => {
    const { getByTestId, findByTestId } = renderWithProviders(<CollectionCreateForm />);

    const input = getByTestId('collection-name-input');
    await act(async () => {
      fireEvent.changeText(input, 'Test Collection');
    });
    await act(async () => {
      fireEvent.press(getByTestId('create-collection'));
    });

    // Store should have new collection
    const ids = useCollectionsStore.getState().allIds;
    expect(ids.length).toBeGreaterThan(0);
    const last = ids[ids.length - 1];
    expect(useCollectionsStore.getState().byId[last].name).toBe('Test Collection');
  });

  it('adds a post to an existing collection and bookmarks it', async () => {
    // Use AddToCollectionSheet to add p1 to first collection
    const tree = renderWithProviders(<AddToCollectionSheet postId="p1" />);

    // Wait for collections
    const addBtn = await tree.findByTestId('add-to-c1');

    await act(async () => {
      fireEvent.press(addBtn);
    });

    expect(useCollectionsStore.getState().byId['c1']?.postIds.includes('p1')).toBe(true);
    expect(useBookmarksStore.getState().isBookmarked('p1')).toBe(true);
  });

  it('renders collection detail and share stub is called', async () => {
    const spy = jest.spyOn(shareModule, 'getCollectionShareLink');
    const { findByText, getByTestId } = renderWithProviders(<CollectionDetail id="c1" />);
    expect(await findByText('My Favorites')).toBeTruthy();

    await act(async () => {
      fireEvent.press(getByTestId('share-collection'));
    });

    expect(spy).toHaveBeenCalledWith('c1');
    spy.mockRestore();
  });
});
