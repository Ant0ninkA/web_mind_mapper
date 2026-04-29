import React, { useState } from 'react';
import AddNodeForm from './components/AddNodeForm';
import AddEdgeForm from './components/AddEdgeForm';
import type { Node } from '@xyflow/react';
import './App.css';

const sampleNodes: Node[] = [
  { id: '1', position: { x: 0, y: 0 }, data: { label: 'Node 1' } },
  { id: '2', position: { x: 0, y: 0 }, data: { label: 'Node 2' } },
  { id: '3', position: { x: 0, y: 0 }, data: { label: 'Node 3' } },
];

const App: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>(sampleNodes);

  const handleAddNode = (label: string) => {
    const id = String(nodes.length + 1);
    setNodes((prev) => [...prev, { id, position: { x: 0, y: 0 }, data: { label } }]);
  };

  const handleAddEdge = (sourceId: string, targetId: string) => {
    console.log(`Edge added: ${sourceId} -> ${targetId}`);
  };

  return (
    <div className="app">
      <AddNodeForm onAddNode={handleAddNode} />
      <AddEdgeForm nodes={nodes} onAddEdge={handleAddEdge} />
    </div>
  );
};

export default App;
