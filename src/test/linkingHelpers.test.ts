import { extractPathFromUrl, parseDeepLink, handleDeepLink, deepLinkPrefixes, linking } from '@/navigation/linking';

describe('Deep linking helpers', () => {
  test('extractPathFromUrl handles https and custom scheme', () => {
    expect(extractPathFromUrl('https://expo-ts-starter.example/post/abc123')).toBe('post/abc123');
    expect(extractPathFromUrl('expotsstarter://post/abc123')).toBe('post/abc123');
    // Host as first segment pattern
    expect(extractPathFromUrl('expotsstarter://u/jdoe')).toBe('u/jdoe');
    // Triple slash variant
    expect(extractPathFromUrl('expotsstarter:///post/xyz')).toBe('post/xyz');
  });

  test('parseDeepLink maps posts and profiles across aliases', () => {
    expect(parseDeepLink('https://expo-ts-starter.example/post/abc')).toEqual({ name: 'PostDetail', params: { id: 'abc' } });
    expect(parseDeepLink('https://expo-ts-starter.example/posts/xyz')).toEqual({ name: 'PostDetail', params: { id: 'xyz' } });
    expect(parseDeepLink('https://expo-ts-starter.example/p/123')).toEqual({ name: 'PostDetail', params: { id: '123' } });

    expect(parseDeepLink('expotsstarter://user/jdoe')).toEqual({ name: 'UserProfile', params: { username: 'jdoe' } });
    expect(parseDeepLink('expotsstarter://users/jane')).toEqual({ name: 'UserProfile', params: { username: 'jane' } });
    expect(parseDeepLink('expotsstarter://u/jane-doe')).toEqual({ name: 'UserProfile', params: { username: 'jane-doe' } });
    expect(parseDeepLink('https://expo-ts-starter.example/profile/alice')).toEqual({ name: 'UserProfile', params: { username: 'alice' } });
  });

  test('parseDeepLink supports query strings and fragments gracefully', () => {
    expect(parseDeepLink('https://expo-ts-starter.example/p/123?ref=email')).toEqual({ name: 'PostDetail', params: { id: '123' } });
    expect(parseDeepLink('https://expo-ts-starter.example/u/bob#section')).toEqual({ name: 'UserProfile', params: { username: 'bob' } });
  });

  test('handleDeepLink falls back to Home when content is missing', async () => {
    const postExists = jest.fn(async (id: string) => id !== 'missing');
    const userExists = jest.fn(async (u: string) => u !== 'ghost');

    // Missing post id -> fallback
    await expect(handleDeepLink('expotsstarter://post/missing', { resolvers: { postExists } })).resolves.toEqual({ name: 'RootTabs', nested: { name: 'Home' } });
    // Missing user -> fallback
    await expect(handleDeepLink('https://expo-ts-starter.example/user/ghost', { resolvers: { userExists } })).resolves.toEqual({ name: 'RootTabs', nested: { name: 'Home' } });

    // Existing content -> navigate to target
    await expect(handleDeepLink('https://expo-ts-starter.example/post/abc', { resolvers: { postExists } })).resolves.toEqual({ name: 'PostDetail', params: { id: 'abc' } });
    await expect(handleDeepLink('expotsstarter://u/alice', { resolvers: { userExists } })).resolves.toEqual({ name: 'UserProfile', params: { username: 'alice' } });
  });

  test('linking config exposes prefixes and custom getStateFromPath', () => {
    expect(Array.isArray(deepLinkPrefixes)).toBe(true);
    expect(deepLinkPrefixes.length).toBeGreaterThan(0);

    // Ensure our custom parser maps alias paths
    const stateForAlias = (linking.getStateFromPath as any)('p/123', {});
    expect(stateForAlias).toEqual({ routes: [{ name: 'PostDetail', params: { id: '123' } }] });

    const stateForUser = (linking.getStateFromPath as any)('u/jdoe', {});
    expect(stateForUser).toEqual({ routes: [{ name: 'UserProfile', params: { username: 'jdoe' } }] });
  });
});
