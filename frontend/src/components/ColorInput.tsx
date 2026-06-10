import React, { useState, useEffect } from "react";
import "../styles/color_input_styles.css";

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (newColor: string) => void;
  onErrorChange?: (hasError: boolean) => void;
}

const isValidCSSColor = (color: string): boolean => {
  if (!color) return false;
  const s = new Option().style;
  s.color = color;
  return s.color !== "";
};

const colorToHex = (color: string): string => {
  if (!isValidCSSColor(color)) return "#ffffff"; 
  
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return "#ffffff";
  
  ctx.fillStyle = color;
  return ctx.fillStyle; 
};

const ColorInput: React.FC<ColorInputProps> = ({ label, value, onChange,onErrorChange }) => {

  const [inputValue, setInputValue] = useState(value);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setInputValue(value);
    setIsValid(true);
    if(onErrorChange) onErrorChange(false);
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value.trim(); 
    setInputValue(text);

    if(text.startsWith("#"))
    {
      const hexRegex = /^#([0-9A-Fa-f]{3,4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
      if (hexRegex.test(text)) {
        setIsValid(true);
        if(onErrorChange) onErrorChange(false);
        onChange(text);
      } else {
        setIsValid(false);
        if(onErrorChange) onErrorChange(true);
      }
    }
    else {
    if (isValidCSSColor(text)) {
      setIsValid(true);
      if(onErrorChange) onErrorChange(false);
      onChange(text); 
    } else {
      setIsValid(false); 
      if(onErrorChange) onErrorChange(true);
    }
  }
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setInputValue(color);
    setIsValid(true);
    if(onErrorChange) onErrorChange(false);
    onChange(color);
  };

  return (
    <div className="color-input" style={{ marginBottom: "12px" }}>
      <label className="color-input__label">{label}</label>
      <div className="color-input_wrapper">
        <input
          type="color"
          value={colorToHex(inputValue)}
          onChange={handlePickerChange}
          className="color-input__picker"
        />

        <input
          type="text"
          value={inputValue}
          onChange={handleTextChange}
          className={`color-input__hex ${!isValid ? "color-input__hex--error" : ""}`}
          placeholder="e.g., #ff0000 or red"
        />
      </div>

      {!isValid && (
        <span className="color-input__error-text">
          Please enter a valid color (e.g., 'red' or '#ff0000')
        </span>
      )}
    </div>
  );
};

export default ColorInput;