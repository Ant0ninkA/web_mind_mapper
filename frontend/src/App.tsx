import React, { useState } from 'react';
import SideDrawer from './components/SideDrawer';
import AddNodeForm from './components/AddNodeForm';
import AddEdgeForm from './components/AddEdgeForm';
import { useGraphState } from './hooks/useGraphState';
import './App.css';

const App: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const { nodes, addNode, addEdgeByIds } = useGraphState();

  return (
    <div className="app">
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
