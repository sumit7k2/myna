export type Edge<T> = { cursor: string; node: T };
export type Connection<T> = { edges: Edge<T>[]; pageInfo: { hasNextPage: boolean; endCursor?: string | null } };

export function edgesToNodes<T>(edges: Edge<T>[]): T[] {
  return edges.map((e) => e.node);
}

export function mergeConnections<T extends { id: string }>(prev: Connection<T>, next: Connection<T>): Connection<T> {
  const seen = new Set<string>();
  const mergedEdges: Edge<T>[] = [];
  for (const e of [...prev.edges, ...next.edges]) {
    if (!seen.has(e.node.id)) {
      seen.add(e.node.id);
      mergedEdges.push(e);
    }
  }
  return {
    edges: mergedEdges,
    pageInfo: {
      hasNextPage: next.pageInfo.hasNextPage,
      endCursor: next.pageInfo.endCursor ?? prev.pageInfo.endCursor
    }
  };
}

export function getNextCursor<T>(conn: Connection<T>): string | null {
  return conn.pageInfo.endCursor ?? null;
}
