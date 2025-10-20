import { graphql, HttpResponse } from 'msw';
import { rewriteContent } from '../fixtures/aiRewrite';
import { toConnection } from '../fixtures/post';
import { getFixtures, getScenario, maybeDelay } from '../fixtures/scenario';
import { accessToken, refreshToken, rotateAccessToken } from '../fixtures/auth';

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
    const { posts } = getFixtures();
    const post = posts.find((p) => p.id === (variables as any)?.id);
    return HttpResponse.json({ data: { post } });
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
