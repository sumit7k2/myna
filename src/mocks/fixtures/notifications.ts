export const notifications = [
  {
    id: 'n1',
    message: 'Alice liked your post',
    createdAt: new Date().toISOString(),
    read: false,
    type: 'LIKE',
    postId: 'p1',
    username: null
  },
  {
    id: 'n2',
    message: 'Welcome to the app!',
    createdAt: new Date().toISOString(),
    read: true,
    type: 'SYSTEM',
    postId: null,
    username: null
  }
];
