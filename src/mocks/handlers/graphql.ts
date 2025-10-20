import { graphql, HttpResponse } from 'msw';

const samplePosts = [
  { id: '1', author: 'Alice', content: 'Hello from MSW 👋' },
  { id: '2', author: 'Bob', content: 'This is a mocked feed.' }
];

export const handlers = [
  graphql.query('GetPosts', () => {
    return HttpResponse.json({ data: { posts: samplePosts } });
  })
];
