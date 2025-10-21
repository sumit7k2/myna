import type { LinkingOptions } from '@react-navigation/native';
import { getStateFromPath as defaultGetStateFromPath } from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const deepLinkPrefixes: string[] = [
  'expotsstarter://',
  'https://expo-ts-starter.example'
];

// Utilities to parse incoming URLs into route targets used by our app
export type DeepLinkTarget =
  | { name: 'PostDetail'; params: { id: string } }
  | { name: 'UserProfile'; params: { username: string } }
  | { name: 'RootTabs'; nested?: { name: 'Home' | 'Topics' | 'Notifications' | 'Profile' } };

// Extract a normalized path string from a URL that may be either http(s) or a custom app scheme
export function extractPathFromUrl(url: string): string {
  // HTTP(S) URL handling via WHATWG URL
  if (/^https?:\/\//i.test(url)) {
    try {
      const u = new URL(url);
      return u.pathname.replace(/^\/+/, '');
    } catch {
      return '';
    }
  }

  // Custom scheme handling. We treat the host as a first path segment when present.
  const match = url.match(/^[a-z][a-z0-9+.-]*:\/\/(.*)$/i);
  if (!match) return '';
  const rest = match[1];
  if (!rest) return '';
  if (rest.startsWith('/')) {
    return rest.replace(/^\/+/, '');
  }
  // rest might be like "posts/123" or "posts" or "u/alice"
  return rest;
}

// Recognize posts and profiles using a few common aliases
export function parseDeepLink(url: string): DeepLinkTarget | null {
  const path = extractPathFromUrl(url);
  if (!path) return null;
  const [seg0Raw, seg1Raw] = path.split('?')[0].split('#')[0].split('/');
  const seg0 = (seg0Raw || '').toLowerCase();
  const seg1 = seg1Raw || '';

  if ((seg0 === 'post' || seg0 === 'posts' || seg0 === 'p') && seg1) {
    return { name: 'PostDetail', params: { id: seg1 } };
  }

  if ((seg0 === 'user' || seg0 === 'users' || seg0 === 'u' || seg0 === 'profile' || seg0 === 'profiles') && seg1) {
    return { name: 'UserProfile', params: { username: seg1 } };
  }

  // Also support top-level tabs by path
  if (seg0 === 'home' || seg0 === 'topics' || seg0 === 'notifications' || seg0 === 'profile') {
    const tab = (seg0.charAt(0).toUpperCase() + seg0.slice(1)) as DeepLinkTarget['nested'] extends infer N
      ? N extends { name: infer T }
        ? T
        : never
      : never;
    return { name: 'RootTabs', nested: { name: tab as any } };
  }

  return null;
}

export type ExistenceResolvers = {
  postExists?: (id: string) => boolean | Promise<boolean>;
  userExists?: (username: string) => boolean | Promise<boolean>;
};

export async function handleDeepLink(
  url: string,
  opts?: { resolvers?: ExistenceResolvers; fallbackTab?: DeepLinkTarget['nested'] extends infer N ? N extends { name: infer T } ? T : never : never }
): Promise<DeepLinkTarget> {
  const target = parseDeepLink(url);
  const fallbackTab = opts?.fallbackTab ?? 'Home';

  if (!target) {
    return { name: 'RootTabs', nested: { name: fallbackTab as any } };
  }

  // If we have resolvers, check existence to optionally fallback to a safe tab
  if (target.name === 'PostDetail' && opts?.resolvers?.postExists) {
    try {
      const exists = await opts.resolvers.postExists(target.params.id);
      if (!exists) return { name: 'RootTabs', nested: { name: fallbackTab as any } };
    } catch {
      return { name: 'RootTabs', nested: { name: fallbackTab as any } };
    }
  }

  if (target.name === 'UserProfile' && opts?.resolvers?.userExists) {
    try {
      const exists = await opts.resolvers.userExists(target.params.username);
      if (!exists) return { name: 'RootTabs', nested: { name: fallbackTab as any } };
    } catch {
      return { name: 'RootTabs', nested: { name: fallbackTab as any } };
    }
  }

  return target;
}

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: deepLinkPrefixes,
  // Default config for known screens
  config: {
    screens: {
      RootTabs: {
        screens: {
          Home: 'home',
          Topics: 'topics',
          Notifications: 'notifications',
          Profile: 'profile',
        },
      },
      Compose: 'compose',
      PostDetail: 'post/:id',
      UserProfile: 'user/:username',
      Settings: 'settings',
      Onboarding: 'onboarding',
      // Auth screens can be deep-linked too
      Login: 'login',
      SignUp: 'signup',
    },
  },
  // Custom parser to support aliases like p/:id and u/:username
  getStateFromPath(path, options) {
    const url = // Prefix with a dummy domain so our parser can treat it as a URL
      path.startsWith('http') ? path : `https://local/${path.replace(/^\/+/, '')}`;

    const target = parseDeepLink(url);
    if (target?.name === 'PostDetail') {
      return { routes: [{ name: 'PostDetail', params: target.params }] } as any;
    }
    if (target?.name === 'UserProfile') {
      return { routes: [{ name: 'UserProfile', params: target.params }] } as any;
    }
    if (target?.name === 'RootTabs' && target.nested) {
      return { routes: [{ name: 'RootTabs', state: { routes: [{ name: target.nested.name }] } }] } as any;
    }

    // Fall back to default behavior for anything else
    return defaultGetStateFromPath(path, options) as any;
  },
};
