import React from 'react';
import '../styles/text_input_styles.css';

interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const TextInput: React.FC<TextInputProps> = ({ label, value, onChange, placeholder }) => {
  return (
    <div className="text-input">
      <label className="text-input__label">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="text-input__field"
      />
    </div>
  );
};

export default TextInput;
