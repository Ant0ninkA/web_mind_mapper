import React from 'react';
import '../styles/side_drawer_styles.css';
import IconButton from './IconButton';

interface SideDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  title: string;
  side?: 'left' | 'right';
  children: React.ReactNode;
}

const SideDrawer: React.FC<SideDrawerProps> = ({ isOpen, onToggle, title, side = 'right', children }) => {
  return (
    <>
      <IconButton
        onClick={onToggle}
        title='Close panel'
        className={`drawer-toggle drawer-toggle--${side}`}
      >
        ☰
      </IconButton>

      <aside className={`side-drawer side-drawer--${side} ${isOpen ? 'side-drawer--open' : ''}`}>
        <div className="side-drawer__header">
          <h2 className="side-drawer__title">{title}</h2>
          <IconButton onClick={onToggle} title="Close panel" className="side-drawer__close">
            ✕
          </IconButton>
        </div>
        <div className="side-drawer__content">
          {children}
        </div>
      </aside>
    </>
  );
};

export default SideDrawer;
