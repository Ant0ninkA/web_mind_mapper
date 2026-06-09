import { useCallback, useEffect, useRef, useState } from 'react';
import { applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow';
import type { Node, Edge, OnNodesChange, OnEdgesChange, Connection } from 'reactflow';
import { getMindmap, listMindmaps, createMindmap, updateMindmap } from '../api/mindmaps';
import { ApiError } from '../api/client';
import { toFlowNodes, toFlowEdges, toMindmapNodes, toMindmapEdges, newId } from '../api/adapters';
import { elementStyleToCss } from './useElementStyle';
import type { ElementStyle } from './useElementStyle';

const PERSISTABLE_NODE_CHANGES = new Set(['position', 'remove']);
const PERSISTABLE_EDGE_CHANGES = new Set(['remove']);

/**
 * Owns the live graph and keeps it in sync with the backend.
 *
 * Edits are kept local; the graph is pushed to the backend only when `save()` is
 * called (the Style editor's Apply button) or when the mindmap closes (unmount),
 * which avoids a request per keystroke or drag.
 *
 * @param initialMindmapId  When provided (e.g. from the `/map/:id` route) that
 *   mindmap is loaded. Until routing lands it may be omitted, in which case the
 *   first existing mindmap is opened, or a fresh one created if none exist.
 */
export function useGraphState(initialMindmapId?: string) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [mindmapId, setMindmapId] = useState<string | null>(initialMindmapId ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const mindmapIdRef = useRef<string | null>(initialMindmapId ?? null);
  const dirtyRef = useRef(false);

  const writeNodes = useCallback((next: Node[]) => {
    nodesRef.current = next;
    setNodes(next);
    dirtyRef.current = true;
  }, []);

  const writeEdges = useCallback((next: Edge[]) => {
    edgesRef.current = next;
    setEdges(next);
    dirtyRef.current = true;
  }, []);

  const save = useCallback(async (): Promise<void> => {
    const id = mindmapIdRef.current;
    if (!id || !dirtyRef.current) return;
    try {
      await updateMindmap(id, {
        nodes: toMindmapNodes(nodesRef.current),
        edges: toMindmapEdges(edgesRef.current),
      });
      dirtyRef.current = false;
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save changes');
      throw err;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const mindmap = initialMindmapId
          ? await getMindmap(initialMindmapId)
          : (await listMindmaps())[0] ?? (await createMindmap({ name: 'Untitled mindmap' }));
        if (cancelled) return;
        const flowNodes = toFlowNodes(mindmap.nodes);
        const flowEdges = toFlowEdges(mindmap.edges);
        nodesRef.current = flowNodes;
        edgesRef.current = flowEdges;
        mindmapIdRef.current = mindmap.id;
        dirtyRef.current = false;
        setNodes(flowNodes);
        setEdges(flowEdges);
        setMindmapId(mindmap.id);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Failed to load mindmap');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [initialMindmapId]);

  // Flush unsaved edits when the mindmap closes (component unmounts).
  useEffect(() => {
    return () => {
      if (dirtyRef.current && mindmapIdRef.current) {
        void updateMindmap(mindmapIdRef.current, {
          nodes: toMindmapNodes(nodesRef.current),
          edges: toMindmapEdges(edgesRef.current),
        });
      }
    };
  }, []);

  const onNodesChange: OnNodesChange = useCallback((changes) => {
    setNodes((nds) => {
      const next = applyNodeChanges(changes, nds);
      nodesRef.current = next;
      return next;
    });
    if (changes.some((c) => PERSISTABLE_NODE_CHANGES.has(c.type))) dirtyRef.current = true;
  }, []);

  const onEdgesChange: OnEdgesChange = useCallback((changes) => {
    setEdges((eds) => {
      const next = applyEdgeChanges(changes, eds);
      edgesRef.current = next;
      return next;
    });
    if (changes.some((c) => PERSISTABLE_EDGE_CHANGES.has(c.type))) dirtyRef.current = true;
  }, []);

  const onConnect = useCallback(
    (params: Connection) => {
      writeEdges(addEdge({ ...params, id: newId() }, edgesRef.current));
    },
    [writeEdges]
  );

  const addNode = useCallback(
    (label: string) => {
      const newNode: Node = {
        id: newId(),
        position: { x: Math.random() * 400 + 50, y: Math.random() * 400 + 50 },
        data: { label },
      };
      writeNodes([...nodesRef.current, newNode]);
    },
    [writeNodes]
  );

  const updateNodeStyle = useCallback(
    (nodeId: string, style: ElementStyle) => {
      writeNodes(
        nodesRef.current.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: { ...node.data, label: style.labelText || node.data.label },
                style: elementStyleToCss(style),
              }
            : node
        )
      );
    },
    [writeNodes]
  );

  const addEdgeByIds = useCallback(
    (sourceId: string, targetId: string) => {
      writeEdges([...edgesRef.current, { id: newId(), source: sourceId, target: targetId }]);
    },
    [writeEdges]
  );

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      const ids = new Set(deleted.map((d) => d.id));
      writeNodes(nodesRef.current.filter((n) => !ids.has(n.id)));
      writeEdges(edgesRef.current.filter((e) => !ids.has(e.source) && !ids.has(e.target)));
    },
    [writeNodes, writeEdges]
  );

  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      const ids = new Set(deleted.map((d) => d.id));
      writeEdges(edgesRef.current.filter((e) => !ids.has(e.id)));
    },
    [writeEdges]
  );

  return {
    nodes,
    edges,
    addNode,
    addEdgeByIds,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodesDelete,
    onEdgesDelete,
    updateNodeStyle,
    mindmapId,
    loading,
    error,
    save,
  };
}
