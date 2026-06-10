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

interface GraphSnapshot {
  nodes: Node[];
  edges: Edge[];
}

export function useGraphState(initialMindmapId?: string) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [mindmapId, setMindmapId] = useState<string | null>(initialMindmapId ?? null);
  const [name, setNameState] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const mindmapIdRef = useRef<string | null>(initialMindmapId ?? null);
  const nameRef = useRef('');
  const dirtyRef = useRef(false);


  const [past, setPast] = useState<GraphSnapshot[]>([]);
  const styleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastEditedNodeRef = useRef<string | null>(null);
  const lastEditedFieldRef = useRef<string | null>(null);

  const undo = useCallback(() => {
    if (past.length === 0) return;

    
    if (styleTimerRef.current) clearTimeout(styleTimerRef.current);
    lastEditedNodeRef.current = null;
    lastEditedFieldRef.current = null;

    const previousSnapshot = past[past.length - 1];
    setPast((p) => p.slice(0, -1));

   
    nodesRef.current = previousSnapshot.nodes;
    edgesRef.current = previousSnapshot.edges;
    setNodes(previousSnapshot.nodes);
    setEdges(previousSnapshot.edges);
    
    dirtyRef.current = true; 
  }, [past]);

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
    if (!dirtyRef.current) return;
    try {
      const id = mindmapIdRef.current;
      if (id) {
        await updateMindmap(id, {
          nodes: toMindmapNodes(nodesRef.current),
          edges: toMindmapEdges(edgesRef.current),
        });
      } else {
        const mindmap = await createMindmap({
          name: 'Untitled mindmap',
          nodes: toMindmapNodes(nodesRef.current),
          edges: toMindmapEdges(edgesRef.current),
        });
        mindmapIdRef.current = mindmap.id;
        setMindmapId(mindmap.id);
      }
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
          : (await listMindmaps())[0] ?? null;
        if (cancelled) return;
        if (!mindmap) {
          mindmapIdRef.current = null;
          setMindmapId(null);
          return;
        }
        const flowNodes = toFlowNodes(mindmap.nodes);
        const flowEdges = toFlowEdges(mindmap.edges);
        nodesRef.current = flowNodes;
        edgesRef.current = flowEdges;
        mindmapIdRef.current = mindmap.id;
        nameRef.current = mindmap.name;
        dirtyRef.current = false;
        setNodes(flowNodes);
        setEdges(flowEdges);
        setMindmapId(mindmap.id);
        setNameState(mindmap.name);
        setPast([]); // Изчистваме историята при зареждане на нова карта
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

  useEffect(() => {
    return () => {
      if (dirtyRef.current && mindmapIdRef.current) {
        void updateMindmap(mindmapIdRef.current, {
          name: nameRef.current,
          nodes: toMindmapNodes(nodesRef.current),
          edges: toMindmapEdges(edgesRef.current),
        });
      }
    };
  }, []);

  // Rename the open mindmap locally; persisted on the next save/flush.
  const renameMindmap = useCallback((next: string) => {
    nameRef.current = next;
    setNameState(next);
    dirtyRef.current = true;
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

const updateEdgeStyle = useCallback(
  (edgeId: string, newStyle: ElementStyle) => {
    const nextEdges = edgesRef.current.map((edge) => {
      if (edge.id !== edgeId)  return edge;
      return {
        ...edge,
        label: newStyle.labelText || undefined,
        animated: typeof newStyle.animated === 'boolean' ? newStyle.animated : false,
        style: {
          stroke: newStyle.borderColor,
          strokeWidth: newStyle.borderWidth,
        },
      };
    });
    writeEdges(nextEdges);
  }, [writeEdges]);

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
    updateEdgeStyle,
    mindmapId,
    name,
    renameMindmap,
    loading,
    error,
    save,
    undo,               
    canUndo: past.length > 0, 
  };
}