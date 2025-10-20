import { sampleUser } from './auth';
import { topics } from './topics';

export type Post = {
  id: string;
  author: typeof sampleUser;
  content: string;
  createdAt: string;
  likesCount: number;
  viewerHasLiked: boolean;
  topics: typeof topics;
};

export const posts: Post[] = [
  {
    id: 'p1',
    author: sampleUser,
    content: 'Hello from MSW 👋',
    createdAt: new Date().toISOString(),
    likesCount: 1,
    viewerHasLiked: false,
    topics: [topics[0]]
  },
  {
    id: 'p2',
    author: sampleUser,
    content: 'This is a mocked feed.',
    createdAt: new Date().toISOString(),
    likesCount: 5,
    viewerHasLiked: true,
    topics: [topics[1]]
  }
];

export function toConnection<T extends { id: string }>(items: T[], first = 10, after?: string) {
  let startIndex = 0;
  if (after) {
    const idx = items.findIndex((i) => i.id === after);
    startIndex = idx >= 0 ? idx + 1 : 0;
  }
  const slice = items.slice(startIndex, startIndex + first);
  const edges = slice.map((node) => ({ cursor: node.id, node }));
  const endCursor = edges.length ? edges[edges.length - 1].cursor : null;
  return {
    edges,
    pageInfo: {
      hasNextPage: startIndex + first < items.length,
      endCursor
    }
  };
}
