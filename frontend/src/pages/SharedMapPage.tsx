import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactFlow, { Background, Controls } from 'reactflow';
import type { Node, Edge } from 'reactflow';
import 'reactflow/dist/style.css';
import { getSharedMindmap } from '../api/sharing';
import { ApiError } from '../api/client';
import { toFlowNodes, toFlowEdges } from '../api/adapters';

const SharedMapPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [name, setName] = useState<string>('');
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getSharedMindmap(token)
      .then(({ mindmap }) => {
        if (cancelled) return;
        setName(mindmap.name);
        setNodes(toFlowNodes(mindmap.nodes));
        setEdges(toFlowEdges(mindmap.edges));
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError && err.status === 404
              ? 'This share link is invalid or has been revoked.'
              : 'Failed to load the shared mindmap.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const centeredStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    fontFamily: 'sans-serif',
  };

  if (loading) {
    return <div style={centeredStyle}>Loading shared mindmap…</div>;
  }

  if (error) {
    return (
      <div style={{ ...centeredStyle, flexDirection: 'column', gap: 12, color: '#b71c1c' }}>
        <div>{error}</div>
        <Link to="/">Go home</Link>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 20px',
          background: '#fff',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          fontFamily: 'sans-serif',
        }}
      >
        <strong>{name}</strong>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#6366f1',
            background: 'rgba(99,102,241,0.1)',
            padding: '4px 10px',
            borderRadius: 999,
          }}
        >
          Read-only
        </span>
      </header>

      <div style={{ flexGrow: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          deleteKeyCode={null}
          fitView
        >
          <Background />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
};

export default SharedMapPage;
