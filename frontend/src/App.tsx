import React, { useState } from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';

import SideDrawer from './components/SideDrawer';
import AddNodeForm from './components/AddNodeForm';
import AddEdgeForm from './components/AddEdgeForm';
import { useGraphState } from './hooks/useGraphState';
import './App.css';

const App: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const { nodes, 
          edges, 
          onNodesChange, 
          onEdgesChange, 
          addNode, 
          addEdgeByIds, 
          onConnect,
          onNodesDelete,
          onEdgesDelete } = useGraphState();

  return (
    <div className="app">
      <div className="graph-container" style={{ flexGrow: 1, height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          deleteKeyCode={['Delete', 'Backspace']}
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
        <AddEdgeForm nodes={nodes}  onAddEdge={addEdgeByIds} />
      </SideDrawer>
    </div>
  );
};

export default App;