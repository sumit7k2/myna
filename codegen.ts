import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  // Local contract schema for codegen and mocks
  schema: 'src/graphql/schema.graphql',
  // Colocated GraphQL documents across features
  documents: ['src/**/*.graphql'],
  generates: {
    // Emit generated TypeScript types and Apollo React hooks here
    'src/lib/gql/generated.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true,
        addDocBlocks: false,
        scalars: {
          DateTime: 'string'
        }
      }
    }
  }
};

export default config;
