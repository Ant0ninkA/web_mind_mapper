import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import ReactFlow, { Background, Controls, type Node, type NodeMouseHandler } from 'reactflow';
import 'reactflow/dist/style.css';
import { defaultStyle } from './hooks/useElementStyle';
import SideDrawer from './components/SideDrawer';
import AddNodeForm from './components/AddNodeForm';
import AddEdgeForm from './components/AddEdgeForm';
import StyleEditor from './components/StyleEditor'; 
import { useGraphState } from './hooks/useGraphState';
import type { ElementStyle } from './hooks/useElementStyle'; 
import './App.css';

const App: React.FC = () => {
  const [rightDrawerOpen, setRightDrawerOpen] = useState(true);
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const { id } = useParams<{ id: string }>();

  const {
    nodes,
    edges,
    mindmapId,
    loading,
    error,
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

  
  // Apply commits the style locally and is the moment we persist to the backend.
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

  const statusStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  };

  if (loading) {
    return <div style={statusStyle}>Loading mindmap…</div>;
  }

  // A load failure (e.g. an unknown id from /map/:id) means there is no graph to
  // show, so replace the editor. Save errors are handled by the banner below,
  // which keeps the loaded graph on screen.
  if (error && !mindmapId) {
    return <div style={{ ...statusStyle, color: '#b71c1c' }}>{error}</div>;
  }

  return (
    <div className="app">
      {error && (
        <div
          role="alert"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            padding: '8px 16px',
            textAlign: 'center',
            background: '#fdecea',
            color: '#b71c1c',
          }}
        >
          {error}
        </div>
      )}
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

export default App;