import React, { useEffect, useRef, useState } from "react";
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
    elementType: 'node' | 'edge';
    initialStyle?: Partial<ElementStyle>;
    onChange: (elementId: string, style: ElementStyle) => void;
    onUndo?: (elementId: string) => void;
    canUndo?: boolean;
    onSave?: () => Promise<void>;
}

const StyleEditor: React.FC<StyleEditorProps> = ({ elementId, elementType, initialStyle, onChange, onUndo, canUndo = false, onSave }) => {
    const { style, updateStyle} = useElementStyle(initialStyle);
    const [isSaving, setIsSaving] = useState(false);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    const lastEmitted = useRef(style);
    useEffect(() => {
        if (style === lastEmitted.current) return;
        lastEmitted.current = style;
        onChangeRef.current(elementId, style);
    }, [style, elementId]);


    const handleUndo = () => {
        if (onUndo) onUndo(elementId);
    };

    const handleSave = async () => {
        if (!onSave) return;
        setIsSaving(true);
        try {
            await onSave();
        } catch (error) {
            console.error("Failed to save style changes to the database:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (elementType === 'edge') {
        return (
            <div className="style-editor">
                <PanelSection title="Edge Label">
                    <TextInput
                        label="Text"
                        value={style.labelText}
                        onChange={(val) => updateStyle('labelText', val)}
                        placeholder="Edge label"
                    />
                </PanelSection>

                <PanelSection title="Line Style">
                    <ColorInput
                        label="Line Color"
                        value={style.borderColor} 
                        onChange={(val) => updateStyle('borderColor', val)}
                    />
                    <NumberInput
                        label="Line Width"
                        value={style.borderWidth} // Дебелина на реброто
                        onChange={(val) => updateStyle('borderWidth', val)}
                        min={1}
                        max={15}
                        unit="px"
                    />
                </PanelSection>

                <PanelSection title="Animation">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0' }}>
                        <label style={{ fontSize: '14px', color: '#555' }}>Animated Flow:</label>
                        <input 
                            type="checkbox" 
                            checked={!!style.animated} 
                            onChange={(e) => updateStyle('animated', e.target.checked)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                    </div>
                </PanelSection>

                <div className="style-editor__actions">
                    <Button onClick={handleUndo} variant="primary" disabled={!canUndo}>Undo</Button>
                    {onSave && <Button onClick={handleSave} variant="primary" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</Button>}
                </div>
            </div>
        );
    }

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
                <Button onClick={handleUndo} variant="primary" disabled={!canUndo}>Undo</Button>
                {onSave && <Button onClick={handleSave} variant="primary" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</Button>}
            </div>
        </div>
        );
};

export default StyleEditor;