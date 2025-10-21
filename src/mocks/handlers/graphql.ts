import { graphql, HttpResponse } from 'msw';
import { rewriteContent } from '../fixtures/aiRewrite';
import { toConnection } from '../fixtures/post';
import { getFixtures, getScenario, maybeDelay } from '../fixtures/scenario';
import { accessToken, refreshToken, rotateAccessToken } from '../fixtures/auth';

type ProfileState = {
  id: string;
  username: string;
  name: string;
  avatarUrl?: string | null;
  bio?: string | null;
  followersCount: number;
  followingCount: number;
  viewerIsFollowing: boolean;
};

let profileMap: Record<string, ProfileState> = {};
let lastScenarioName = getScenario().name;
function ensureProfilesSeeded() {
  const current = getScenario().name;
  if (current !== lastScenarioName) {
    profileMap = {};
    lastScenarioName = current;
  }
  if (!profileMap['jdoe']) {
    const { user } = getFixtures();
    profileMap[user.username] = {
      id: user.id,
      username: user.username,
      name: user.name,
      avatarUrl: user.avatarUrl,
      bio: `Bio for ${user.name}`,
      followersCount: 256,
      followingCount: 123,
      viewerIsFollowing: false
    };
  }
  if (!profileMap['janedoe']) {
    profileMap['janedoe'] = {
      id: 'u2',
      username: 'janedoe',
      name: 'Jane Doe',
      avatarUrl: 'https://i.pravatar.cc/100?img=2',
      bio: 'Hi, I am Jane',
      followersCount: 100,
      followingCount: 50,
      viewerIsFollowing: false
    };
  }
}

export const handlers = [
  // Legacy sample
  graphql.query('GetPosts', async () => {
    await maybeDelay();
    const { posts } = getFixtures();
    const legacy = posts.map((p) => ({ id: p.id, author: p.author.name, content: p.content }));
    if (getScenario().name === 'serverError') {
      return HttpResponse.json({ errors: [{ message: 'Server error' }] }, { status: 500 });
    }
    return HttpResponse.json({ data: { posts: legacy } });
  }),

  // Auth
  graphql.mutation('Login', async ({ variables }) => {
    await maybeDelay();
    const scenario = getScenario();
    if (scenario.name === 'authError' || scenario.flags?.authError) {
      return HttpResponse.json(
        { errors: [{ message: 'Invalid credentials', extensions: { code: 'UNAUTHENTICATED' } }] },
        { status: 200 }
      );
    }
    const { user } = getFixtures();
    return HttpResponse.json({
      data: {
        login: {
          tokens: { accessToken, refreshToken },
          user
        }
      }
    });
  }),
  graphql.mutation('Refresh', async () => {
    await maybeDelay();
    const newAccess = rotateAccessToken();
    return HttpResponse.json({ data: { refresh: { accessToken: newAccess } } });
  }),
  graphql.mutation('SignUp', async ({ variables }) => {
    await maybeDelay();
    const { user } = getFixtures();
    return HttpResponse.json({
      data: {
        signup: {
          tokens: { accessToken, refreshToken },
          user: { ...user, name: (variables as any)?.name || user.name }
        }
      }
    });
  }),
  graphql.query('Me', async () => {
    await maybeDelay();
    if (getScenario().name === 'serverError') {
      return HttpResponse.json({ errors: [{ message: 'Server error' }] }, { status: 500 });
    }
    const { user } = getFixtures();
    return HttpResponse.json({ data: { me: user } });
  }),

  // Profiles
  graphql.query('GetUser', async ({ variables }) => {
    await maybeDelay();
    ensureProfilesSeeded();
    const username = (variables as any)?.username as string;
    const profile = profileMap[username];
    if (!profile) {
      const id = `u-${username}`;
      profileMap[username] = {
        id,
        username,
        name: username,
        avatarUrl: undefined,
        bio: null,
        followersCount: 0,
        followingCount: 0,
        viewerIsFollowing: false
      } as any;
    }
    return HttpResponse.json({ data: { user: profileMap[username] } });
  }),
  graphql.mutation('ToggleFollow', async ({ variables }) => {
    await maybeDelay();
    ensureProfilesSeeded();
    const userId = (variables as any)?.userId as string;
    const profile = Object.values(profileMap).find((p) => p.id === userId);
    if (!profile) {
      return HttpResponse.json({ data: { toggleFollow: null } });
    }
    profile.viewerIsFollowing = !profile.viewerIsFollowing;
    profile.followersCount += profile.viewerIsFollowing ? 1 : -1;
    return HttpResponse.json({ data: { toggleFollow: profile } });
  }),

  // Feed
  graphql.query('GetFeed', async ({ variables }) => {
    await maybeDelay();
    const first = (variables as any)?.first ?? 10;
    const after = (variables as any)?.after as string | undefined;
    const { posts } = getFixtures();
    return HttpResponse.json({ data: { feed: toConnection(posts as any, first, after) } });
  }),

  // Post
  graphql.query('GetPost', async ({ variables }) => {
    await maybeDelay();
    const first = (variables as any)?.first ?? 10;
    const after = (variables as any)?.after as string | undefined;
    const { posts, repliesByPost } = getFixtures();
    const post = posts.find((p) => p.id === (variables as any)?.id);
    const replies = post ? repliesByPost[post.id] ?? [] : [];
    const connection = toConnection(replies as any, first, after);
    const enriched = post ? { ...post, replies: connection } : null;
    return HttpResponse.json({ data: { post: enriched } });
  }),
  graphql.mutation('LikePost', async ({ variables }) => {
    await maybeDelay();
    const { posts } = getFixtures();
    const post = posts.find((p) => p.id === (variables as any)?.postId);
    if (post) {
      post.viewerHasLiked = !post.viewerHasLiked;
      post.likesCount += post.viewerHasLiked ? 1 : -1;
    }
    return HttpResponse.json({ data: { likePost: post } });
  }),
  graphql.mutation('LikeReply', async ({ variables }) => {
    await maybeDelay();
    const { repliesByPost } = getFixtures();
    const replyId = (variables as any)?.replyId as string;
    let updated: any = null;
    for (const arr of Object.values(repliesByPost)) {
      const r = arr.find((x) => x.id === replyId);
      if (r) {
        r.viewerHasLiked = !r.viewerHasLiked;
        r.likesCount += r.viewerHasLiked ? 1 : -1;
        updated = r;
        break;
      }
    }
    return HttpResponse.json({ data: { likeReply: updated } });
  }),
  graphql.mutation('CreateReply', async ({ variables }) => {
    await maybeDelay();
    const { user, posts, repliesByPost } = getFixtures();
    const postId = (variables as any)?.postId as string;
    const content = (variables as any)?.content as string;
    const now = new Date().toISOString();
    const newReply = {
      id: `r${postId}-${Math.random().toString(36).slice(2, 8)}`,
      postId,
      author: user,
      content,
      createdAt: now,
      likesCount: 0,
      viewerHasLiked: false
    } as any;
    repliesByPost[postId] = [newReply, ...(repliesByPost[postId] ?? [])];
    const post = posts.find((p) => p.id === postId);
    if (post) post.replyCount += 1;
    return HttpResponse.json({ data: { createReply: newReply } });
  }),
  graphql.mutation('CreatePost', async ({ variables }) => {
    await maybeDelay();
    const { user, topics, posts } = getFixtures();
    const id = `p${posts.length + 1}`;
    const newPost = {
      id,
      author: user,
      content: (variables as any)?.content as string,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      viewerHasLiked: false,
      topics: topics.filter((t) => ((variables as any)?.topicIds as string[] | undefined)?.includes(t.id))
    } as any;
    posts.unshift(newPost);
    return HttpResponse.json({ data: { createPost: newPost } });
  }),

  // Topics
  graphql.query('GetTopics', async () => {
    await maybeDelay();
    const { topics } = getFixtures();
    return HttpResponse.json({ data: { topics } });
  }),
  graphql.mutation('SaveUserTopics', async ({ variables }) => {
    await maybeDelay();
    // Persist selected topic ids
    const ids = ((variables as any)?.topicIds as string[]) || [];
    const { setUserSelectedTopicIds } = await import('../fixtures/topics');
    setUserSelectedTopicIds(ids);
    return HttpResponse.json({ data: { saveUserTopics: true } });
  }),

  // Collections
  graphql.query('GetCollections', async () => {
    await maybeDelay();
    const { collections } = getFixtures();
    return HttpResponse.json({
      data: {
        collections: collections.map((c) => ({
          id: c.id,
          name: c.name,
          posts: toConnection(c.posts as any, 10)
        }))
      }
    });
  }),

  // Notifications
  graphql.query('GetNotifications', async ({ variables }) => {
    await maybeDelay();
    const first = (variables as any)?.first ?? 10;
    const after = (variables as any)?.after as string | undefined;
    const { notifications } = getFixtures();
    const edges = notifications.map((n) => ({ cursor: n.id, node: n })) as any;
    const endIndex = after ? edges.findIndex((e: any) => e.cursor === after) + 1 : 0;
    const slice = edges.slice(endIndex, endIndex + first);
    const endCursor = slice.length ? slice[slice.length - 1].cursor : null;
    return HttpResponse.json({
      data: {
        notifications: {
          edges: slice,
          pageInfo: { hasNextPage: endIndex + first < edges.length, endCursor }
        }
      }
    });
  }),

  // AI rewrite
  graphql.mutation('RewritePost', async ({ variables }) => {
    await maybeDelay();
    return HttpResponse.json({ data: { rewritePost: rewriteContent((variables as any)?.input) } });
  })
];
