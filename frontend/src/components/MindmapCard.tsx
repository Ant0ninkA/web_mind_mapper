import React, { useState } from 'react';
import type { Mindmap } from '../api/types';
import Button from './Button';
import '../Dashboard.css';

interface MindmapCardProps {
  mindmap: Mindmap;
  onOpen: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

function formatUpdated(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

const MindmapCard: React.FC<MindmapCardProps> = ({ mindmap, onOpen, onRename, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(mindmap.name);

  const commitRename = () => {
    setEditing(false);
    const trimmed = name.trim();
    if (trimmed && trimmed !== mindmap.name) {
      onRename(mindmap.id, trimmed);
    } else {
      setName(mindmap.name);
    }
  };

  const startRename = () => {
    setName(mindmap.name);
    setEditing(true);
  };

  const confirmDelete = () => {
    if (window.confirm(`Delete "${mindmap.name}"? This cannot be undone.`)) {
      onDelete(mindmap.id);
    }
  };

  return (
    <div className="mm-card">
      <div
        className="mm-card__body"
        onClick={() => !editing && onOpen(mindmap.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (!editing && (e.key === 'Enter' || e.key === ' ')) onOpen(mindmap.id);
        }}
      >
        {editing ? (
          <input
            className="mm-card__name-input"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') {
                setName(mindmap.name);
                setEditing(false);
              }
            }}
          />
        ) : (
          <h3 className="mm-card__name">{mindmap.name}</h3>
        )}
        <p className="mm-card__meta">
          {mindmap.nodes.length} node{mindmap.nodes.length === 1 ? '' : 's'} · updated{' '}
          {formatUpdated(mindmap.updatedAt)}
        </p>
      </div>

      <div className="mm-card__actions">
        <Button onClick={() => onOpen(mindmap.id)} variant="primary">Open</Button>
        <Button onClick={startRename} variant="secondary">Rename</Button>
        <Button onClick={confirmDelete} variant="secondary">Delete</Button>
      </div>
    </div>
  );
};

export default MindmapCard;