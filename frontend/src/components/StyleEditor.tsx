import React from "react";
import PanelSection from "./PanelSection";
import TextInput from "./TextInput";
import SelectInput from "./SelectInput";
import Button from "./Button";
import ColorInput from "./ColorInput";
import NumberInput from "./NumberInput";
import { useElementStyle, type ElementStyle } from "../hooks/useElementStyle";
import "../styles/style_editor_styles.css";

const fontFamilyOptions = [
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Courier New, monospace', label: 'Courier New' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
];

const fontWeightOptions = [
  { value: '300', label: 'Light' },
  { value: '400', label: 'Normal' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semi-Bold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Extra-Bold' },
  { value: '900', label: 'Black' },
];

const borderStyleOptions = [
  { value: 'none', label: 'None' },
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
];  

const textAlignOptions = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];

interface StyleEditorProps {
    elementId: string;
    initialStyle?: Partial<ElementStyle>;
    onApply: (elementId: string, style: ElementStyle)=> void;
}

const StyleEditor: React.FC<StyleEditorProps> = ({ elementId, initialStyle, onApply }) => {
    const { style, updateStyle, resetStyle } = useElementStyle(initialStyle);

    const handleApply = () => {
        onApply(elementId, style);
    };

    return (
        <div className="style-editor">  
            <PanelSection title="Label">
                <TextInput
                    label="Text"
                    value={style.labelText}
                    onChange={(val) => updateStyle('labelText', val)}
                    placeholder="Element label"
                />
                <SelectInput
                    label="Text Align"
                    value={style.textAlign}
                    onChange={(val) => updateStyle('textAlign', val)}
                    options={textAlignOptions}
                />
            </PanelSection>

            <PanelSection title="Font">
                <SelectInput
                    label="Font Family"
                    value={style.fontFamily}    
                    onChange={(val) => updateStyle('fontFamily', val)}
                    options={fontFamilyOptions}
                />
                <NumberInput
                    label="Font Size"
                    value={style.fontSize}
                    onChange={(val) => updateStyle('fontSize', val)}
                    min={8}
                    max={72}
                    unit="px"
                />
                <SelectInput
                    label="Font Weight"
                    value={style.fontWeight}
                    onChange={(val) => updateStyle('fontWeight', val)}
                    options={fontWeightOptions}
                />
            </PanelSection>

            <PanelSection title="Colors">
                <ColorInput
                    label="Text Color"
                    value={style.textColor}
                    onChange={(val) => updateStyle('textColor', val)}
                />
                <ColorInput
                    label="Background Color"
                    value={style.backgroundColor}
                    onChange={(val) => updateStyle('backgroundColor', val)}
                />
            </PanelSection>

            <PanelSection title="Border">
                <ColorInput
                    label="Border Color"
                    value={style.borderColor}
                    onChange={(val) => updateStyle('borderColor', val)}
                />
                <NumberInput
                    label="Border Width"
                    value={style.borderWidth}
                    onChange={(val) => updateStyle('borderWidth', val)}
                    min={0}
                    max={20}
                    unit="px"
                />
                <SelectInput
                    label="Border Style"
                    value={style.borderStyle}
                    onChange={(val) => updateStyle('borderStyle', val)}
                    options={borderStyleOptions}
                />
                <NumberInput
                    label="Border Radius"
                    value={style.borderRadius}
                    onChange={(val) => updateStyle('borderRadius', val)}
                    min={0}
                    max={50}
                    unit="px"
                />
            </PanelSection>

            <PanelSection title="Dimensions">
                <NumberInput
                    label="Opacity"
                    value={style.opacity}
                    onChange={(val) => updateStyle('opacity', val)}
                    min={0}
                    max={1}
                    step={0.1}
                />
            </PanelSection>
             
            <div className="style-editor__actions">
                <Button onClick={handleApply} variant="primary">Apply Style</Button>
                <Button onClick={resetStyle} variant="secondary">Reset</Button>
            </div>
        </div>
        );
};