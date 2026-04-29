import React, { useState } from 'react';
import TextInput from './components/TextInput';
import SelectInput from './components/SelectInput';
import './App.css';

const sampleOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
];

const App: React.FC = () => {
  const [text, setText] = useState('');
  const [selected, setSelected] = useState('');

  return (
    <div className="app">
      <TextInput label="Text Input" value={text} onChange={setText} placeholder="Enter text" />
      <SelectInput
        label="Dropdown"
        value={selected}
        onChange={setSelected}
        options={sampleOptions}
        placeholder="Select an option"
      />
    </div>
  );
};

export default App;
