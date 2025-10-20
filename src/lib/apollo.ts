import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { ENV } from './env';

const httpLink = new HttpLink({ uri: ENV.GRAPHQL_ENDPOINT });

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
});
