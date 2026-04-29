import React from 'react';
import '../styles/select_input_styles.css';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
}

const SelectInput: React.FC<SelectInputProps> = ({ label, value, onChange, options, placeholder }) => {
  return (
    <div className="select-input">
      <label className="select-input__label">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="select-input__field"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectInput;
