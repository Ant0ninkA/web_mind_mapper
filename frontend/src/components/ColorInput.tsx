import React from "react";
import "../styles/color_input_styles.css";

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (newColor: string) => void;
}

const ColorInput: React.FC<ColorInputProps> = ({ label, value, onChange }) => {
  return (
    <div className="color-input">
      <label className="color-input__label">{label}</label>
      <div className="color-input_wrapper">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="color-input__picker"
        />

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="color-input__hex"
          maxLength={7}
        />
      </div>
    </div>
  );
};

export default ColorInput;