import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { createShareLink } from '../api/sharing';
import { ApiError } from '../api/types';
import Button from './Button';
import '../styles/share_styles.css';

interface ShareDialogProps {
  mindmapId: string;
  onClose: () => void;
}

const ShareDialog: React.FC<ShareDialogProps> = ({ mindmapId, onClose }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    createShareLink(mindmapId)
      .then(({ shareUrl }) => {
        if (!cancelled) setUrl(`${window.location.origin}${shareUrl}`);
      })
      .catch((err) => {
        if (!cancelled) {
          const reason =
            err instanceof ApiError ? err.message : err instanceof Error ? err.message : 'Unknown error';
          setError(`Failed to create a share link: ${reason}`);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mindmapId]);

  const handleCopy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError('Could not copy to clipboard — copy the link manually.');
    }
  };

  return createPortal(
    <div className="share-overlay" onClick={onClose}>
      <div className="share-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h2 className="share-dialog__title">Share read-only link</h2>
        <p className="share-dialog__subtitle">
          Anyone with this link can view this mindmap, but not edit it.
        </p>

        {loading && <div className="share-dialog__status">Generating link…</div>}
        {error && <div className="share-dialog__error">{error}</div>}

        {url && (
          <div className="share-dialog__link-row">
            <input className="share-dialog__input" readOnly value={url} onFocus={(e) => e.target.select()} />
            <Button onClick={handleCopy} variant="primary">{copied ? 'Copied!' : 'Copy'}</Button>
          </div>
        )}

        <div className="share-dialog__actions">
          <Button onClick={onClose} variant="secondary">Close</Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ShareDialog;
