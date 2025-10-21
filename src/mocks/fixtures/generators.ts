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
  | 'slowNetwork'
  | 'limitedReplies';

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
export type Reply = {
  id: string;
  postId: string;
  author: User;
  content: string;
  createdAt: string;
  likesCount: number;
  viewerHasLiked: boolean;
};
export type Post = {
  id: string;
  author: User;
  content: string;
  createdAt: string;
  likesCount: number;
  viewerHasLiked: boolean;
  topics: Topic[];
  replyCount: number;
  viewerCanReply: boolean;
  replyRationale?: string | null;
};
export type Collection = { id: string; name: string; posts: Post[] };
export type Notification = {
  id: string;
  message: string;
  createdAt: string;
  read: boolean;
  type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'SYSTEM';
  postId?: string | null;
  username?: string | null;
};

export type Fixtures = {
  user: User;
  topics: Topic[];
  posts: Post[];
  repliesByPost: Record<string, Reply[]>;
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
    topics: [topics[i % topics.length]],
    replyCount: 0,
    viewerCanReply: true,
    replyRationale: null
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
  const list: Notification[] = [];
  for (let i = 0; i < count; i++) {
    const id = `n${i + 1}`;
    if (i === 0) {
      list.push({
        id,
        message: 'Welcome to the app!',
        createdAt: new Date(Date.now() - i * 86_400_000).toISOString(),
        read: true,
        type: 'SYSTEM',
        postId: null,
        username: null
      });
      continue;
    }
    if (i === 1) {
      list.push({
        id,
        message: 'Jane Doe followed you',
        createdAt: new Date(Date.now() - i * 86_400_000).toISOString(),
        read: false,
        type: 'FOLLOW',
        username: 'janedoe',
        postId: null
      });
      continue;
    }
    if (i === 2) {
      list.push({
        id,
        message: 'User2 liked your post',
        createdAt: new Date(Date.now() - i * 86_400_000).toISOString(),
        read: false,
        type: 'LIKE',
        postId: 'p1',
        username: null
      });
      continue;
    }
    if (i === 3) {
      list.push({
        id,
        message: 'User3 commented on your post',
        createdAt: new Date(Date.now() - i * 86_400_000).toISOString(),
        read: true,
        type: 'COMMENT',
        postId: 'p2',
        username: null
      });
      continue;
    }
    // For remaining notifications, alternate types
    const isEven = i % 2 === 0;
    list.push({
      id,
      message: isEven ? `User${i} liked your post` : `User${i} followed you`,
      createdAt: new Date(Date.now() - i * 86_400_000).toISOString(),
      read: i % 3 === 0,
      type: isEven ? 'LIKE' : 'FOLLOW',
      postId: isEven ? 'p1' : null,
      username: isEven ? null : 'janedoe'
    });
  }
  return list;
}

function makeReply(i: number, postId: string, author: User): Reply {
  return {
    id: `r${postId}-${i + 1}`,
    postId,
    author,
    content: `Reply ${i + 1} to ${postId}`,
    createdAt: new Date(Date.now() - i * 1800_000).toISOString(),
    likesCount: Math.floor(Math.random() * 20),
    viewerHasLiked: Math.random() < 0.2
  };
}

export function buildFixtures(config: ScenarioConfig): Fixtures {
  const user = config.name === 'newUser' ? makeUser({ id: 'u-new', username: 'newbie', name: 'New User' }) : makeUser();
  const topics = makeTopics(3);

  const baseFeedSize = config.feedSize ?? (config.name === 'longFeed' ? 50 : 10);
  const posts = (config.flags?.emptyFeed || config.name === 'emptyFeed') ? [] : makeFeedPosts(baseFeedSize, user, topics);

  // Generate some replies for the first few posts
  const repliesByPost: Record<string, Reply[]> = {};
  for (const p of posts) {
    // 12 replies for the first, 3 for the second, 0 for others
    const n = p.id === 'p1' ? 12 : p.id === 'p2' ? 3 : 0;
    const replies: Reply[] = Array.from({ length: n }, (_, i) => makeReply(i, p.id, user));
    repliesByPost[p.id] = replies;
    p.replyCount = replies.length;
    if (config.name === 'limitedReplies' && p.id === 'p1') {
      p.viewerCanReply = false;
      p.replyRationale = 'Only followers can reply';
    } else {
      p.viewerCanReply = true;
      p.replyRationale = null;
    }
  }

  const notifications = (config.flags?.noNotifications || config.name === 'noNotifications') ? [] : makeNotifications(6);
  const collections = makeCollections(posts);

  return { user, topics, posts, repliesByPost, collections, notifications };
}

export function toPostConnection(posts: Post[], first = 10, after?: string) {
  // Convenience wrapper that reuses the existing toConnection helper
  return toConnection(posts as any, first, after);
}
