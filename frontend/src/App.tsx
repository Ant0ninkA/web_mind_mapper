import React, { useState, useMemo } from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';

import SideDrawer from './components/SideDrawer';
import AddNodeForm from './components/AddNodeForm';
import AddEdgeForm from './components/AddEdgeForm';
import { useGraphState } from './hooks/useGraphState';
import './App.css';

const App: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const { nodes, edges, addNode, addEdgeByIds } = useGraphState();

  const formattedNodes = useMemo(() =>
    nodes.map((n: any) => ({
      id: n.id,
      data: { label: n.label || 'no name' },
      position: n.position || { x: Math.random() * 400, y: Math.random() * 400 },
    })),
  [nodes]);

  const formattedEdges = useMemo(() =>
    edges.map((e: any) => ({
      id: `e${e.source}-${e.target}`,
      source: e.source,
      target: e.target,
      animated: true,
      style: { stroke: '#3b82f6' },
    })),
  [edges]);

  return (
    <div className="app">
      <div className="graph-container" style={{ flexGrow: 1, height: '100%' }}>
        <ReactFlow
          nodes={formattedNodes}
          edges={formattedEdges}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      <SideDrawer
        isOpen={drawerOpen}
        onToggle={() => setDrawerOpen((isOpen) => !isOpen)}
        title="Graph Controls"
        side="right"
      >
        <AddNodeForm onAddNode={addNode} />
        <AddEdgeForm nodes={nodes} onAddEdge={addEdgeByIds} />
      </SideDrawer>
    </div>
  );
};

export default App;