import { graphql, HttpResponse } from 'msw';
import { sampleUser, accessToken, refreshToken, rotateAccessToken } from '../fixtures/auth';
import { topics } from '../fixtures/topics';
import { posts, toConnection } from '../fixtures/post';
import { collections } from '../fixtures/collections';
import { notifications } from '../fixtures/notifications';
import { rewriteContent } from '../fixtures/aiRewrite';

export const handlers = [
  // Legacy sample
  graphql.query('GetPosts', () => {
    const legacy = posts.map((p) => ({ id: p.id, author: p.author.name, content: p.content }));
    return HttpResponse.json({ data: { posts: legacy } });
  }),

  // Auth
  graphql.mutation('Login', async ({ variables }) => {
    return HttpResponse.json({
      data: {
        login: {
          tokens: { accessToken, refreshToken },
          user: sampleUser
        }
      }
    });
  }),
  graphql.mutation('Refresh', async ({ variables }) => {
    const newAccess = rotateAccessToken();
    return HttpResponse.json({ data: { refresh: { accessToken: newAccess } } });
  }),
  graphql.query('Me', () => {
    return HttpResponse.json({ data: { me: sampleUser } });
  }),

  // Feed
  graphql.query('GetFeed', ({ variables }) => {
    const first = variables?.first ?? 10;
    const after = variables?.after as string | undefined;
    return HttpResponse.json({ data: { feed: toConnection(posts, first, after) } });
  }),

  // Post
  graphql.query('GetPost', ({ variables }) => {
    const post = posts.find((p) => p.id === variables?.id);
    return HttpResponse.json({ data: { post } });
  }),
  graphql.mutation('LikePost', ({ variables }) => {
    const post = posts.find((p) => p.id === variables?.postId);
    if (post) {
      post.viewerHasLiked = !post.viewerHasLiked;
      post.likesCount += post.viewerHasLiked ? 1 : -1;
    }
    return HttpResponse.json({ data: { likePost: post } });
  }),
  graphql.mutation('CreatePost', ({ variables }) => {
    const id = `p${posts.length + 1}`;
    const newPost = {
      id,
      author: sampleUser,
      content: variables?.content as string,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      viewerHasLiked: false,
      topics: topics.filter((t) => (variables?.topicIds as string[] | undefined)?.includes(t.id))
    };
    posts.unshift(newPost as any);
    return HttpResponse.json({ data: { createPost: newPost } });
  }),

  // Topics
  graphql.query('GetTopics', () => {
    return HttpResponse.json({ data: { topics } });
  }),

  // Collections
  graphql.query('GetCollections', () => {
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
  graphql.query('GetNotifications', ({ variables }) => {
    const first = variables?.first ?? 10;
    const after = variables?.after as string | undefined;
    return HttpResponse.json({ data: { notifications: toConnection(notifications as any, first, after) } });
  }),

  // AI rewrite
  graphql.mutation('RewritePost', ({ variables }) => {
    return HttpResponse.json({ data: { rewritePost: rewriteContent(variables?.input) } });
  })
];
