import React from 'react';
import '../styles/button_styles.css';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  variant = 'primary',
  disabled = false,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`btn btn--${variant} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
