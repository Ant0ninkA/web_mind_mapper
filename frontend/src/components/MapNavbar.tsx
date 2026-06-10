import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ShareDialog from './ShareDialog';
import '../MapNavbar.css';

interface MapNavbarProps {
  mindmapId: string | null;
  name: string;
  onRename: (name: string) => void;
  onSave: () => void | Promise<void>;
}

const MapNavbar: React.FC<MapNavbarProps> = ({ mindmapId, name, onRename, onSave }) => {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(name);
  const [shareOpen, setShareOpen] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Keep the editable title in sync when the loaded name changes.
  useEffect(() => {
    setDraft(name);
  }, [name]);

  // Commit a non-empty, changed name; otherwise revert to the current name.
  const commitName = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== name) {
      onRename(trimmed);
    } else {
      setDraft(name);
    }
  };

  const handleSave = async () => {
    setSaveState('saving');
    try {
      await onSave();
      setSaveState('saved');
      setTimeout(() => setSaveState('idle'), 1500);
    } catch {
      setSaveState('idle');
    }
  };

  return (
    <header className="map-navbar">
      <div className="map-navbar__section">
        <button className="map-navbar__back" onClick={() => navigate('/')} title="Back to dashboard">
          <span aria-hidden>←</span> Dashboard
        </button>
      </div>

      <input
        className="map-navbar__title"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commitName}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          if (e.key === 'Escape') setDraft(name);
        }}
        placeholder="Untitled mindmap"
        aria-label="Mindmap name"
      />

      <div className="map-navbar__section map-navbar__section--right">
        <button className="map-navbar__btn" onClick={handleSave}>
          {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved ✓' : 'Save'}
        </button>
        <button
          className="map-navbar__btn map-navbar__btn--primary"
          onClick={() => setShareOpen(true)}
          disabled={!mindmapId}
        >
          Share
        </button>
      </div>

      {shareOpen && mindmapId && (
        <ShareDialog mindmapId={mindmapId} onClose={() => setShareOpen(false)} />
      )}
    </header>
  );
};

export default MapNavbar;
