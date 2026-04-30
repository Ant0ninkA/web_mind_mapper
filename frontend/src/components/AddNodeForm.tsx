import React, { useState } from 'react';
import TextInput from './TextInput';
import Button from './Button';
import PanelSection from './PanelSection';

interface AddNodeFormProps {
  onAddNode: (label: string) => void;
}

const AddNodeForm: React.FC<AddNodeFormProps> = ({ onAddNode }) => {
  const [nodeName, setNodeName] = useState('');

  const handleAdd = () => {
    const trimmed = nodeName.trim();
    if (!trimmed) return;
    onAddNode(trimmed);
    setNodeName('');
  };

  return (
    <PanelSection title="Add Node">
      <TextInput
        label="Node name"
        value={nodeName}
        onChange={setNodeName}
        placeholder="Enter node name"
      />
      <Button onClick={handleAdd} disabled={!nodeName.trim()}>
        Add Node
      </Button>
    </PanelSection>
  );
};

export default AddNodeForm;
