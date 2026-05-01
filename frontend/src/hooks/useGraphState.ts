import { useCallback, useState } from 'react';
import { applyNodeChanges, applyEdgeChanges, addEdge } from 'reactflow';
import type { Node, Edge, OnNodesChange, OnEdgesChange, Connection } from 'reactflow';

const initialNodes: Node[] = [
  { id: '1', position: { x: 250, y: 50 }, data: { label: 'Node 1' } },
  { id: '2', position: { x: 100, y: 200 }, data: { label: 'Node 2' } },
  { id: '3', position: { x: 400, y: 200 }, data: { label: 'Node 3' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
];

let nodeIdCounter = 4;

export function useGraphState() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const addNode = useCallback((label: string) => {
    const id = String(nodeIdCounter++);
    const newNode: Node = {
      id,
      position: {
        x: Math.random() * 400 + 50,
        y: Math.random() * 400 + 50,
      },
      data: { label },
    };
    setNodes((nds) => {
      const updated = [...nds, newNode];
      console.log("Nodes: ", updated);
      return updated;
    });
  }, []);

  const addEdgeByIds = useCallback((sourceId: string, targetId: string) => {
    const id = `e${sourceId}-${targetId}`;
    const newEdge: Edge = { id, source: sourceId, target: targetId };
    setEdges((eds) => {
      const updated = [...eds, newEdge];
      console.log("Edges: ", updated);
      return updated;
    });
  }, []);

  return {
    nodes,
    edges,
    addNode,
    addEdgeByIds,
    onNodesChange,
    onEdgesChange,
    onConnect
  };
}
