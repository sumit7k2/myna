import { edgesToNodes, mergeConnections, getNextCursor } from '@/lib/pagination';

type Item = { id: string; v: number };

function makeConn(items: Item[], endCursor?: string | null, hasNextPage = true) {
  return {
    edges: items.map((n) => ({ cursor: n.id, node: n })),
    pageInfo: { hasNextPage, endCursor: endCursor ?? (items.length ? items[items.length - 1].id : null) }
  };
}

describe('pagination helpers', () => {
  it('edgesToNodes converts edges to nodes', () => {
    const conn = makeConn([
      { id: 'a', v: 1 },
      { id: 'b', v: 2 }
    ]);
    expect(edgesToNodes(conn.edges)).toEqual([
      { id: 'a', v: 1 },
      { id: 'b', v: 2 }
    ]);
  });

  it('mergeConnections dedupes by node id and keeps latest pageInfo', () => {
    const c1 = makeConn([
      { id: 'a', v: 1 },
      { id: 'b', v: 1 }
    ]);
    const c2 = makeConn(
      [
        { id: 'b', v: 2 },
        { id: 'c', v: 1 }
      ],
      'c',
      false
    );
    const merged = mergeConnections(c1, c2);
    expect(merged.edges.map((e) => e.node.id)).toEqual(['a', 'b', 'c']);
    expect(merged.pageInfo.hasNextPage).toBe(false);
    expect(getNextCursor(merged)).toBe('c');
  });
});
