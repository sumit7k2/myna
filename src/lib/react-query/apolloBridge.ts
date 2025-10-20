import { ApolloError, QueryHookOptions, QueryResult, DocumentNode, useQuery } from '@apollo/client';

export type ReactQueryLikeResult<TData> = {
  data: TData | undefined;
  error: ApolloError | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  refetch: () => void;
};

export function toReactQueryResult<TData>(result: QueryResult<TData, any>): ReactQueryLikeResult<TData> {
  return {
    data: result.data,
    error: result.error ?? null,
    isLoading: result.loading,
    isError: Boolean(result.error),
    isSuccess: !result.loading && !result.error,
    refetch: () => {
      // Apollo's refetch returns a promise; normalize to void
      void result.refetch();
    }
  };
}

export function useApolloQueryRQ<TData = any, TVariables = any>(
  query: DocumentNode,
  options?: QueryHookOptions<TData, TVariables>
): ReactQueryLikeResult<TData> {
  const result = useQuery<TData, TVariables>(query, options);
  return toReactQueryResult(result);
}
