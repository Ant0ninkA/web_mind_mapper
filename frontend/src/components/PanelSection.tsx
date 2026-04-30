import React from 'react';
import '../styles/panel_section_styles.css';

interface PanelSectionProps {
  title: string;
  children: React.ReactNode;
}

const PanelSection: React.FC<PanelSectionProps> = ({ title, children }) => {
  return (
    <div className="panel-section">
      <h3 className="panel-section__title">{title}</h3>
      {children}
    </div>
  );
};

export default PanelSection;
