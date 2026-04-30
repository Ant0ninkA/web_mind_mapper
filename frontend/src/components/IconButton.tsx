import React from 'react';
import '../styles/button_styles.css';

interface IconButtonProps {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const IconButton: React.FC<IconButtonProps> = ({ onClick, title, children, className = '' }) => {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`icon-button ${className}`}
    >
      {children}
    </button>
  );
};

export default IconButton;
