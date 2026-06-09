import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../api/authentication';
import { LoginPage } from './LoginPage'; 
import { ApiError } from '../api/client';
import { listMindmaps, createMindmap, updateMindmap, deleteMindmap } from '../api/mindmaps';
import type { Mindmap } from '../api/types';
import MindmapCard from '../components/MindmapCard';
import Button from '../components/Button';
import '../Dashboard.css';

const MindmapDashboard: React.FC = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [mindmaps, setMindmaps] = useState<Mindmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const errMessage = (err: unknown, fallback: string) =>
    err instanceof ApiError ? err.message : fallback;

  // Load the user's mindmaps once authenticated.
  useEffect(() => {
    if (authLoading || !user) return;
    let cancelled = false;
    setLoading(true);
    listMindmaps()
      .then((data) => {
        if (cancelled) return;
        setMindmaps(data);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(errMessage(err, 'Failed to load your mindmaps'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const handleCreate = useCallback(async () => {
    setCreating(true);
    setError(null);
    try {
      const created = await createMindmap({ name: 'Untitled mindmap' });
      navigate(`/map/${created.id}`);
    } catch (err) {
      setError(errMessage(err, 'Failed to create a mindmap'));
      setCreating(false);
    }
  }, [navigate]);

  const handleOpen = useCallback((id: string) => navigate(`/map/${id}`), [navigate]);

  const handleRename = useCallback(async (id: string, name: string) => {
    const prev = mindmaps;
    setMindmaps((list) => list.map((m) => (m.id === id ? { ...m, name } : m)));
    try {
      await updateMindmap(id, { name });
    } catch (err) {
      setMindmaps(prev); // revert on failure
      setError(errMessage(err, 'Failed to rename the mindmap'));
    }
  }, [mindmaps]);

  const handleDelete = useCallback(async (id: string) => {
    const prev = mindmaps;
    setMindmaps((list) => list.filter((m) => m.id !== id));
    try {
      await deleteMindmap(id);
    } catch (err) {
      setMindmaps(prev); // revert on failure
      setError(errMessage(err, 'Failed to delete the mindmap'));
    }
  }, [mindmaps]);

  if (authLoading) {
    return (
      <div className="dashboard__status">Loading…</div>
    );
  }

  // Not logged in → show the auth screen (which redirects here once a session exists).
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Your Mind Maps</h1>
          <p className="dashboard__subtitle">Signed in as {user.email}</p>
        </div>
        <div className="dashboard__header-actions">
          <Button onClick={handleCreate} variant="primary">
            {creating ? 'Creating…' : '+ New mindmap'}
          </Button>
          <Button onClick={() => logout()} variant="secondary">Log out</Button>
        </div>
      </header>

      {error && <div className="dashboard__error">{error}</div>}

      {loading ? (
        <div className="dashboard__status">Loading your mindmaps…</div>
      ) : mindmaps.length === 0 ? (
        <div className="dashboard__empty">
          <p>You don't have any mindmaps yet.</p>
          <Button onClick={handleCreate} variant="primary">Create your first mindmap</Button>
        </div>
      ) : (
        <div className="dashboard__grid">
          {mindmaps.map((m) => (
            <MindmapCard
              key={m.id}
              mindmap={m}
              onOpen={handleOpen}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MindmapDashboard;