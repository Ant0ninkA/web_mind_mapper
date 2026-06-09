import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import ReactFlow, { Background, Controls, type Node, type NodeMouseHandler } from 'reactflow';
import 'reactflow/dist/style.css';

// Context & Protected Routing Imports
import { AuthProvider, useAuth } from './pages/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import { defaultStyle } from './hooks/useElementStyle';
import SideDrawer from './components/SideDrawer';
import AddNodeForm from './components/AddNodeForm';
import AddEdgeForm from './components/AddEdgeForm';
import StyleEditor from './components/StyleEditor'; 
import { useGraphState } from './hooks/useGraphState';
import type { ElementStyle } from './hooks/useElementStyle'; 
import './App.css';

const MindMapperWorkspace: React.FC = () => {
  const [rightDrawerOpen, setRightDrawerOpen] = useState(true);
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const { id } = useParams<{ id: string }>();

  // Grab the global user data and logout function from our auth hook
  const { user, logout } = useAuth();

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    addNode,
    addEdgeByIds,
    onConnect,
    onNodesDelete,
    onEdgesDelete,
    updateNodeStyle,
    save
  } = useGraphState(id);

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNode(node);
    setLeftDrawerOpen(true); 
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleApplyStyle = useCallback((elementId: string, style: ElementStyle) => {
    updateNodeStyle(elementId, style);
    void save();
  }, [updateNodeStyle, save]);

  const handleResetStyle = useCallback((elementId: string) => {
    updateNodeStyle(elementId, defaultStyle);
  }, [updateNodeStyle]);

  const selectedInitialStyle = selectedNode
    ? {
        labelText: selectedNode.data.label as string,
        ...(selectedNode.style && {
          backgroundColor: selectedNode.style.backgroundColor as string,
          textColor: selectedNode.style.color as string,
          borderColor: selectedNode.style.borderColor as string,
          fontFamily: selectedNode.style.fontFamily as string,
          fontWeight: selectedNode.style.fontWeight as string,
          textAlign: selectedNode.style.textAlign as string,
        }),
      }
    : undefined;

  return (
    <div className="app">
      <SideDrawer
        isOpen={leftDrawerOpen}
        onToggle={() => setLeftDrawerOpen((o) => !o)}
        title={selectedNode ? `Edit: ${selectedNode.data.label}` : 'Style Editor'}
        side="left"
      >
        {selectedNode ? (
          <StyleEditor
            key={selectedNode.id} 
            elementId={selectedNode.id}
            initialStyle={selectedInitialStyle}
            onApply={handleApplyStyle}
            onReset={handleResetStyle}
          />
        ) : (
          <p style={{ padding: '20px' }}>Click a node to edit its style.</p>
        )}
      </SideDrawer>

      <div className="graph-container" style={{ flexGrow: 1, height: '100%' }}>
        {/* Added a toolbar profile display to utilize user session information */}
        <div className="user-toolbar-profile" style={{ position: 'absolute', top: 10, right: 10, zIndex: 4, display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '5px 15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{user?.username}</span>
          <button onClick={logout} style={{ padding: '4px 8px', fontSize: '12px', cursor: 'pointer', border: '1px solid #d1d5db', borderRadius: '4px', background: '#f9fafb' }}>Log Out</button>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          onNodeClick={onNodeClick} 
          onPaneClick={onPaneClick}
          deleteKeyCode={['Delete', 'Backspace']}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>

      <SideDrawer
        isOpen={rightDrawerOpen}
        onToggle={() => setRightDrawerOpen((isOpen) => !isOpen)}
        title="Graph Controls"
        side="right"
      >
        <AddNodeForm onAddNode={addNode} />
        <AddEdgeForm nodes={nodes} onAddEdge={addEdgeByIds} />
      </SideDrawer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <MindMapperWorkspace />
      </ProtectedRoute>
    </AuthProvider>
  );
};

export default App;