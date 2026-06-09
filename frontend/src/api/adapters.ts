import type { CSSProperties } from 'react';
import type { Node, Edge } from 'reactflow';
import type { MindmapNode, MindmapEdge, NodeStyle } from './types';

/** Backend nodes -> ReactFlow nodes (on load). */
export function toFlowNodes(nodes: MindmapNode[]): Node[] {
  return nodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: n.position,
    data: n.data,
    style: n.style as CSSProperties | undefined,
  }));
}

/** Backend edges -> ReactFlow edges (on load). */
export function toFlowEdges(edges: MindmapEdge[]): Edge[] {
  return edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle ?? undefined,
    targetHandle: e.targetHandle ?? undefined,
    type: e.type,
    label: e.label,
    animated: e.animated,
    style: e.style as CSSProperties | undefined,
  }));
}

/** ReactFlow nodes -> backend nodes (on save), stripping runtime-only fields. */
export function toMindmapNodes(nodes: Node[]): MindmapNode[] {
  return nodes.map((n) => {
    const node: MindmapNode = {
      id: n.id,
      position: { x: n.position.x, y: n.position.y },
      data: { ...(n.data as Record<string, unknown>), label: String(n.data?.label ?? '') },
    };
    if (n.type) node.type = n.type;
    if (n.style) node.style = n.style as NodeStyle;
    return node;
  });
}

/** ReactFlow edges -> backend edges (on save), stripping runtime-only fields. */
export function toMindmapEdges(edges: Edge[]): MindmapEdge[] {
  return edges.map((e) => {
    const edge: MindmapEdge = { id: e.id, source: e.source, target: e.target };
    if (e.sourceHandle != null) edge.sourceHandle = e.sourceHandle;
    if (e.targetHandle != null) edge.targetHandle = e.targetHandle;
    if (e.type) edge.type = e.type;
    if (e.label != null) edge.label = String(e.label);
    if (e.animated != null) edge.animated = e.animated;
    if (e.style) edge.style = e.style as Record<string, unknown>;
    return edge;
  });
}

export function newId(): string {
  return crypto.randomUUID();
}
