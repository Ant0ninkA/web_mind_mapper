import React from "react";
import "../styles/number_input_styles.css";

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({
    label, 
    value, 
    onChange, 
    min = 0, 
    max = 100, 
    step = 1, 
    unit
}) => {
    return (
        <div className="number-input">
            <label className="number-input__label">
                {label}
                {unit && <span className="number-input__unit">({unit})</span>}
            </label>
            <input
                type="number"
                value={value}
                onChange={(e)=>onChange(Number(e.target.value))}
                min={min}
                max={max}
                step={step}
                className="number-input__field"
            />
        </div>
    );
};

export default NumberInput;