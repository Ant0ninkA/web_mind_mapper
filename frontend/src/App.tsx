import React, { useState, useCallback } from 'react'; 
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
    updateNodeStyle 
  } = useGraphState();

  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    setSelectedNode(node);
    setLeftDrawerOpen(true); 
  }, []);

  const onPaneClick = useCallback(() => {
  setSelectedNode(null);
}, []);

  
  const handleApplyStyle = useCallback((elementId: string, style: ElementStyle) => {
    updateNodeStyle(elementId, style as unknown as Record<string, unknown>);
  }, [updateNodeStyle]);

  const handleResetStyle = useCallback((elementId: string) => {
    updateNodeStyle(elementId, defaultStyle as unknown as Record<string, unknown>);
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