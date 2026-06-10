import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import ReactFlow, { Background, Controls, type Node, type NodeMouseHandler } from 'reactflow';
import 'reactflow/dist/style.css';
import { defaultStyle, cssToElementStyle } from './hooks/useElementStyle';
import { AuthProvider } from './api/authentication';
import { ProtectedRoute } from './components/ProtectedRoute';
import MapNavbar from './components/MapNavbar';
import SideDrawer from './components/SideDrawer';
import AddNodeForm from './components/AddNodeForm';
import AddEdgeForm from './components/AddEdgeForm';
import StyleEditor from './components/StyleEditor';
import { useGraphState } from './hooks/useGraphState';
import { useStyleHistory } from './hooks/useStyleHistory';
import type { ElementStyle } from './hooks/useElementStyle';
import './App.css';

const MindMapperWorkspace: React.FC = () => {
  const [rightDrawerOpen, setRightDrawerOpen] = useState(true);
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  // Bumped on undo to force the StyleEditor to re-seed from the restored style.
  const [styleVersion, setStyleVersion] = useState(0);
  const { id } = useParams<{ id: string }>();

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
    save,
    mindmapId,
    name,
    renameMindmap
  } = useGraphState(id);

  const history = useStyleHistory();

  // Derive the selected node from the live graph so its style stays current.
  const selectedNode = selectedNodeId
    ? nodes.find((n) => n.id === selectedNodeId) ?? null
    : null;

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNodeId(node.id);
    setLeftDrawerOpen(true);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // Live apply: every style change snapshots the node's current style (for undo),
  // then updates the node. Persistence happens via the hook's flush-on-close.
  const handleStyleChange = useCallback((elementId: string, style: ElementStyle) => {
    const node = nodes.find((n) => n.id === elementId);
    if (node) {
      history.record(elementId, cssToElementStyle(node.style, (node.data.label as string) ?? ''));
    }
    updateNodeStyle(elementId, style);
  }, [nodes, history, updateNodeStyle]);

  const handleResetStyle = useCallback((elementId: string) => {
    updateNodeStyle(elementId, defaultStyle);
  }, [updateNodeStyle]);

  // Undo restores the most recent style snapshot for the node.
  const handleUndoStyle = useCallback((elementId: string) => {
    const snapshot = history.undo(elementId);
    if (!snapshot) return;
    updateNodeStyle(elementId, snapshot);
    setStyleVersion((v) => v + 1);
  }, [history, updateNodeStyle]);

  const selectedInitialStyle = selectedNode
    ? cssToElementStyle(selectedNode.style, (selectedNode.data.label as string) ?? '')
    : undefined;

  return (
    <div className="editor-shell" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <MapNavbar mindmapId={mindmapId} name={name} onRename={renameMindmap} onSave={save} />
      <div className="app" style={{ flex: 1, minHeight: 0, height: 'auto', width: '100%' }}>
      <SideDrawer
        isOpen={leftDrawerOpen}
        onToggle={() => setLeftDrawerOpen((o) => !o)}
        title={selectedNode ? `Edit: ${selectedNode.data.label}` : 'Style Editor'}
        side="left"
      >
        {selectedNode ? (
          <StyleEditor
            key={`${selectedNode.id}:${styleVersion}`}
            elementId={selectedNode.id}
            initialStyle={selectedInitialStyle}
            onChange={handleStyleChange}
            onReset={handleResetStyle}
            onUndo={handleUndoStyle}
            canUndo={history.canUndo(selectedNode.id)}
            onSave={save}
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