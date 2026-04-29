import React, { useState } from 'react';
import type { Node } from '@xyflow/react';
import SelectInput from './SelectInput';
import Button from './Button';
import PanelSection from './PanelSection';

interface AddEdgeFormProps {
  nodes: Node[];
  onAddEdge: (sourceId: string, targetId: string) => void;
}

const AddEdgeForm: React.FC<AddEdgeFormProps> = ({ nodes, onAddEdge }) => {
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');

  const nodeOptions = nodes.map((n) => ({
    value: n.id,
    label: (n.data.label as string) || n.id,
  }));

  const handleAdd = () => {
    if (!source || !target || source === target) return;
    onAddEdge(source, target);
    setSource('');
    setTarget('');
  };

  const isValid = source && target && source !== target;

  return (
    <PanelSection title="Add Edge">
      <SelectInput
        label="Source node"
        value={source}
        onChange={setSource}
        options={nodeOptions}
        placeholder="Select source"
      />
      <SelectInput
        label="Target node"
        value={target}
        onChange={setTarget}
        options={nodeOptions}
        placeholder="Select target"
      />
      <Button onClick={handleAdd} disabled={!isValid}>
        Add Edge
      </Button>
    </PanelSection>
  );
};

export default AddEdgeForm;
