import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import ReactFlow, { Background, Controls, type NodeMouseHandler, type EdgeMouseHandler} from 'reactflow';
import 'reactflow/dist/style.css';
import { cssToElementStyle , edgeToElementStyle} from './hooks/useElementStyle';
import MapNavbar from './components/MapNavbar';
import SideDrawer from './components/SideDrawer';
import AddNodeForm from './components/AddNodeForm';
import AddEdgeForm from './components/AddEdgeForm';
import StyleEditor from './components/StyleEditor';
import { useGraphState } from './hooks/useGraphState';
import { useStyleHistory } from './hooks/useStyleHistory';
import type { ElementStyle } from './hooks/useElementStyle';
import './styles/app_styles.css';

const MindMapperWorkspace: React.FC = () => {
  const [rightDrawerOpen, setRightDrawerOpen] = useState(true);
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
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
    mindmapId,
    name,
    renameMindmap,
    updateEdgeStyle,
    save
  } = useGraphState(id);

  const history = useStyleHistory();


  const selectedNode = selectedNodeId
    ? nodes.find((n) => n.id === selectedNodeId) ?? null
    : null;

  const selectedEdge = selectedEdgeId
    ? edges.find((e) => e.id === selectedEdgeId) ?? null
    : null;

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNodeId(node.id);
    setLeftDrawerOpen(true);
  }, []);

  const onEdgeClick = useCallback<EdgeMouseHandler>((_event, edge) => {
    setSelectedEdgeId(edge.id);
    setSelectedNodeId(null);
    setLeftDrawerOpen(true);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
    setLeftDrawerOpen(false);
  }, []);

  const handleStyleChange = useCallback((elementId: string, style: ElementStyle) => {
    const node = nodes.find((n) => n.id === elementId);
    if (node) {
      history.record(elementId, cssToElementStyle(node.style, (node.data.label as string) ?? ''));
    }
    updateNodeStyle(elementId, style);
  }, [nodes, history, updateNodeStyle]);

  const handleEdgeStyleChange = useCallback((elementId: string, style: ElementStyle) => {
  const edge = edges.find((e) => e.id === elementId);
  
  if (edge) {
    history.record(elementId, edgeToElementStyle(edge));
  }
  updateEdgeStyle(elementId, style);
}, [edges, history, updateEdgeStyle]);

  const handleUndoStyle = useCallback((elementId: string) => {
    const snapshot = history.undo(elementId);
    if (!snapshot) return;
    const isNode = nodes.some((n) => n.id === elementId);
    if (isNode) {
      updateNodeStyle(elementId, snapshot);
    } else {
      updateEdgeStyle(elementId, snapshot);
    }
  }, [history, nodes, updateNodeStyle, updateEdgeStyle]);

const handleSave = useCallback(async () => {
  const activeId = selectedNodeId || selectedEdgeId;
  if (!activeId) return;

  try {
    await save();
    history.clearStackAfterSave(activeId);
  } catch (error) {
    console.error('Failed to save changes:', error);
  }
}, [save, selectedNodeId, selectedEdgeId, history]);

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
        title={selectedNode ? `Edit: ${selectedNode.data.label}` : selectedEdge ? 'Edit: Edge Style' : 'Style Editor'}
        side="left"
      >
        {selectedNode ? (
          <StyleEditor
            key={`${selectedNode.id}-${history.canUndo(selectedNode.id)}`}
            elementId={selectedNode.id}
            elementType="node"
            initialStyle={selectedInitialStyle}
            onChange={handleStyleChange}
            onUndo={handleUndoStyle}
            canUndo={history.canUndo(selectedNode.id)}
            onSave={handleSave}
          />
        ) : selectedEdge ? (
          <StyleEditor
            key={`${selectedEdge.id}-${history.canUndo(selectedEdge.id)}`}
            elementId={selectedEdge.id}
            elementType="edge"
            initialStyle={edgeToElementStyle(selectedEdge)}
            onChange={handleEdgeStyleChange} 
            onUndo={handleUndoStyle}
            canUndo={history.canUndo(selectedEdge.id)}
            onSave={handleSave}
          />
        ) : (
          <p style={{ padding: '20px' }}>Click a node or edge to edit its style.</p>
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
          onEdgeClick={onEdgeClick}
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

const App: React.FC = () => <MindMapperWorkspace />;

export default App;