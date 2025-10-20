import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  from
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { relayStylePagination } from '@apollo/client/utilities';
import { fromPromise } from '@apollo/client/link/utils';
import { ENV } from './env';
import { tokenStorage } from './auth/tokenStorage';

const httpLink = new HttpLink({ uri: ENV.GRAPHQL_ENDPOINT });

// Attach Authorization header
const authLink = setContext(async (_, { headers }) => {
  const token = await tokenStorage.getAccessToken();
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : undefined
    }
  };
});

// Simple retry/backoff
const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: 2000,
    jitter: true
  },
  attempts: {
    max: 3,
    retryIf: (_error, _operation) => true
  }
});

// Token refresh handling
let refreshPromise: Promise<boolean> | null = null;
async function performTokenRefresh(): Promise<boolean> {
  try {
    const refreshToken = await tokenStorage.getRefreshToken();
    if (!refreshToken) return false;

    // Use global fetch without DOM typings
    const myFetch: any = (globalThis as any).fetch;
    if (!myFetch) return false;

    const res = await myFetch(ENV.GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        query:
          'mutation Refresh($refreshToken: String!) { refresh(refreshToken: $refreshToken) { accessToken } }',
        variables: { refreshToken }
      })
    });
    const json = await res.json();
    const newAccessToken = json?.data?.refresh?.accessToken as string | undefined;
    if (newAccessToken) {
      await tokenStorage.setAccessToken(newAccessToken);
      return true;
    }
    return false;
  } catch (e) {
    if (__DEV__) console.warn('[Apollo] Token refresh failed', e);
    return false;
  }
}

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  const is401 = (networkError as any)?.statusCode === 401;
  const isUnauth = graphQLErrors?.some((e) => (e.extensions as any)?.code === 'UNAUTHENTICATED');
  if (!is401 && !isUnauth) {
    if (graphQLErrors && __DEV__) {
      graphQLErrors.forEach((e) => console.error('[GraphQL error]', e));
    }
    if (networkError && __DEV__) console.error('[Network error]', networkError);
    return undefined;
  }

  const context = operation.getContext();
  if (context.__isRetry) {
    return undefined;
  }

  if (!refreshPromise) {
    refreshPromise = performTokenRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return fromPromise(refreshPromise).flatMap(async (ok) => {
    if (!ok) {
      await tokenStorage.clear();
      return forward(operation);
    }

    const currentHeaders = operation.getContext().headers || {};
    const token = await tokenStorage.getAccessToken();
    operation.setContext({
      headers: {
        ...currentHeaders,
        Authorization: token ? `Bearer ${token}` : undefined
      },
      __isRetry: true
    });
    return forward(operation);
  });
});

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        feed: relayStylePagination(),
        notifications: relayStylePagination()
      }
    },
    Collection: {
      fields: {
        posts: relayStylePagination()
      }
    }
  }
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, retryLink, authLink, httpLink]),
  cache
});
