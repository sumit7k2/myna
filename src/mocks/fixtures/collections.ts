import { posts } from './post';

export const collections = [
  {
    id: 'c1',
    name: 'My Favorites',
    posts
  },
  {
    id: 'c2',
    name: 'Reading List',
    posts: posts.slice(0, 1)
  }
];
