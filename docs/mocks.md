MSW GraphQL mocks and fixtures

Overview
- This project uses MSW (Mock Service Worker) to mock GraphQL queries and mutations across web, native (Expo), Jest/RTL, and Detox E2E.
- Handlers live in src/mocks/handlers/graphql.ts and return realistic fixtures generated in src/mocks/fixtures.
- An offline-first workflow is supported by default in development and test environments via ENV.USE_MOCKS.

Environment toggle
- USE_MOCKS controls whether the app starts MSW.
  - Defaults to true in development and test, false in production.
  - Can be overridden by exporting USE_MOCKS=true/false in your environment (see app.config.ts extras).
- GRAPHQL_ENDPOINT points to the real API when USE_MOCKS is false.

Where mocks are started
- App.tsx calls startMocks() during mount when ENV.USE_MOCKS is true.
  - Web: src/mocks/browser.ts uses msw/browser
  - Native (Expo): src/mocks/native.ts uses msw/native
- For Jest/RTL, a Node server from msw/node is used and is started/stopped via jest.setup.ts

Fixture generators and scenarios
- Generators are in src/mocks/fixtures/generators.ts (makeUser, makeTopics, makePost, makeFeedPosts, makeCollections, makeNotifications).
- Scenario state is in src/mocks/fixtures/scenario.ts
  - setScenario(name) changes the active scenario and rebuilds fixtures.
  - getFixtures() returns the in-memory dataset used by handlers (posts, topics, collections, notifications, user).
  - maybeDelay() applies scenario-specific network delay in handlers.
- Supported scenarios:
  - default: standard dataset
  - emptyFeed: zero posts
  - noNotifications: zero notifications
  - newUser: a different user identity
  - authError: Login responds with a GraphQL unauthenticated error
  - serverError: select handlers return a 500 error
  - longFeed: larger feed (50 items)
  - slowNetwork: use setScenario('slowNetwork', { delayMs: N }) to simulate latency

Jest/RTL usage
- The MSW Node server is auto-configured in jest.setup.ts:
  - beforeAll: server.listen({ onUnhandledRequest: 'bypass' })
  - afterEach: server.resetHandlers(); setScenario('default')
  - afterAll: server.close()
- To override responses in a test:
  import { server } from '@/mocks/test/msw';
  import { graphql, HttpResponse } from 'msw';
  server.use(
    graphql.query('GetFeed', () => HttpResponse.json({ data: { feed: { edges: [], pageInfo: { hasNextPage: false, endCursor: null } } } }))
  );
- To toggle a scenario:
  import { setScenario } from '@/mocks/fixtures/scenario';
  setScenario('emptyFeed');

Detox usage
- MSW native server is started automatically in the app when ENV.USE_MOCKS is true (default in test builds).
- To override per-test without rebuilding, use the deep link bridge exposed by src/mocks/devtools.ts:
  - The app registers a handler for URLs like expotsstarter://msw?scenario=emptyFeed
  - From a Detox test, you can set a scenario via:
    await device.openURL({ url: 'expotsstarter://msw?scenario=emptyFeed' });
  - Custom delay:
    await device.openURL({ url: 'expotsstarter://msw?scenario=slowNetwork' });
    // By default slowNetwork has no delay. You can adjust at runtime by calling the global setter via RN devtools if needed.

Extending handlers
- Add new GraphQL operations to src/mocks/handlers/graphql.ts using the msw graphql.query/mutation APIs.
- Reuse fixtures via getFixtures() and generators from src/mocks/fixtures/generators.ts.
- Prefer consulting the active scenario via getScenario() and honoring maybeDelay().

Notes
- Handlers default to onUnhandledRequest: 'bypass' to avoid interfering with unrelated network calls in development.
- Apollo client is configured in src/lib/apollo.ts to use ENV.GRAPHQL_ENDPOINT. When using mocks, MSW intercepts fetch to that endpoint.
- If you need to persist changes to fixtures during a session (e.g., mutations), mutate the arrays returned by getFixtures().
