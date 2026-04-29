import React from 'react';
import Button from './components/Button';
import IconButton from './components/IconButton';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app">
        <Button onClick={() => {}} variant="primary">Primary Button</Button>
        <Button onClick={() => {}} variant="secondary">Secondary Button</Button>
        <Button onClick={() => {}} disabled>Disabled Button</Button>
          <IconButton onClick={() => {}} title="Menu">☰</IconButton>
          <IconButton onClick={() => {}} title="Close">✕</IconButton>
    </div>
  );
};

export default App;
