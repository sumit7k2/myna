import { sampleUser } from './auth';
import { toConnection } from './post';

export type ScenarioName =
  | 'default'
  | 'emptyFeed'
  | 'noNotifications'
  | 'newUser'
  | 'authError'
  | 'serverError'
  | 'longFeed'
  | 'slowNetwork';

export type ScenarioConfig = {
  name: ScenarioName;
  delayMs?: number;
  feedSize?: number;
  flags?: Partial<{
    emptyFeed: boolean;
    noNotifications: boolean;
    authError: boolean;
  }>;
};

export type User = typeof sampleUser;
export type Topic = { id: string; name: string; slug: string };
export type Post = {
  id: string;
  author: User;
  content: string;
  createdAt: string;
  likesCount: number;
  viewerHasLiked: boolean;
  topics: Topic[];
};
export type Collection = { id: string; name: string; posts: Post[] };
export type Notification = { id: string; message: string; createdAt: string; read: boolean };

export type Fixtures = {
  user: User;
  topics: Topic[];
  posts: Post[];
  collections: Collection[];
  notifications: Notification[];
};

export function randomId(prefix = ''): string {
  return `${prefix}${Math.random().toString(36).slice(2, 10)}`;
}

export function makeUser(overrides: Partial<User> = {}): User {
  return { ...sampleUser, ...overrides } as User;
}

export function makeTopic(i: number): Topic {
  const names = ['GraphQL', 'React Native', 'AI', 'TypeScript', 'Expo'];
  const name = names[i % names.length];
  return { id: `t${i + 1}` , name, slug: name.toLowerCase().replace(/\s+/g, '-') };
}

export function makeTopics(count = 3): Topic[] {
  return Array.from({ length: count }, (_, i) => makeTopic(i));
}

export function makePost(i: number, author: User, topics: Topic[]): Post {
  return {
    id: `p${i + 1}`,
    author,
    content: `Post #${i + 1} — mocked content for offline-first dev` ,
    createdAt: new Date(Date.now() - i * 3600_000).toISOString(),
    likesCount: Math.floor(Math.random() * 100),
    viewerHasLiked: Math.random() < 0.3,
    topics: [topics[i % topics.length]]
  };
}

export function makeFeedPosts(count = 10, author = sampleUser, topics = makeTopics(3)): Post[] {
  return Array.from({ length: count }, (_, i) => makePost(i, author, topics));
}

export function makeCollections(posts: Post[]): Collection[] {
  return [
    { id: 'c1', name: 'My Favorites', posts },
    { id: 'c2', name: 'Reading List', posts: posts.slice(0, Math.max(1, Math.floor(posts.length / 3))) }
  ];
}

export function makeNotifications(count = 5): Notification[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `n${i + 1}`,
    message: i === 0 ? 'Welcome to the app!' : `User${i} liked your post` ,
    createdAt: new Date(Date.now() - i * 86_400_000).toISOString(),
    read: i % 2 === 0
  }));
}

export function buildFixtures(config: ScenarioConfig): Fixtures {
  const user = config.name === 'newUser' ? makeUser({ id: 'u-new', username: 'newbie', name: 'New User' }) : makeUser();
  const topics = makeTopics(3);

  const baseFeedSize = config.feedSize ?? (config.name === 'longFeed' ? 50 : 10);
  const posts = (config.flags?.emptyFeed || config.name === 'emptyFeed') ? [] : makeFeedPosts(baseFeedSize, user, topics);

  const notifications = (config.flags?.noNotifications || config.name === 'noNotifications') ? [] : makeNotifications(6);
  const collections = makeCollections(posts);

  return { user, topics, posts, collections, notifications };
}

export function toPostConnection(posts: Post[], first = 10, after?: string) {
  // Convenience wrapper that reuses the existing toConnection helper
  return toConnection(posts as any, first, after);
}
