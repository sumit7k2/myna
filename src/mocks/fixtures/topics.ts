export const topics = [
  { id: 't1', name: 'GraphQL', slug: 'graphql' },
  { id: 't2', name: 'React Native', slug: 'react-native' },
  { id: 't3', name: 'AI', slug: 'ai' }
];

// In-memory user preferences for selected topics (persist for test run)
export let userSelectedTopicIds: string[] = [];
export function setUserSelectedTopicIds(ids: string[]) {
  userSelectedTopicIds = Array.from(new Set(ids));
}
