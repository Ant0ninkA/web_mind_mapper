import  {useCallback,useState} from "react";
import type { CSSProperties } from "react";

export interface ElementStyle {
    labelText: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    textAlign: string;
    textColor: string;
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    borderStyle: string;
    borderRadius: number;
    opacity: number;
}

export const defaultStyle: ElementStyle = {
    labelText: '',
    fontFamily: 'Arial, sans-serif',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    textColor: '#333333',
    backgroundColor: '#FFFFFF',
    borderColor: '#d0d0d0',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 6,
    opacity: 1,
};

/** Map the editor's ElementStyle to the CSS object ReactFlow renders on a node. */
export function elementStyleToCss(s: ElementStyle): CSSProperties {
    return {
        backgroundColor: s.backgroundColor,
        color: s.textColor,
        borderColor: s.borderColor,
        borderWidth: `${s.borderWidth}px`,
        borderStyle: s.borderStyle,
        borderRadius: `${s.borderRadius}px`,
        fontSize: `${s.fontSize}px`,
        fontFamily: s.fontFamily,
        fontWeight: s.fontWeight,
        textAlign: s.textAlign as CSSProperties['textAlign'],
        opacity: s.opacity,
    };
}

function parseNumeric(value: unknown, fallback: number): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const n = parseFloat(value);
        return Number.isNaN(n) ? fallback : n;
    }
    return fallback;
}

/**
 * Inverse of elementStyleToCss: read a node's stored CSS + label back into an
 * ElementStyle (e.g. to prefill the editor or to snapshot for undo). Missing or
 * non-parseable fields fall back to defaultStyle.
 */
export function cssToElementStyle(css: CSSProperties | undefined, label: string): ElementStyle {
    const s = css ?? {};
    return {
        labelText: label,
        fontFamily: typeof s.fontFamily === 'string' ? s.fontFamily : defaultStyle.fontFamily,
        fontSize: parseNumeric(s.fontSize, defaultStyle.fontSize),
        fontWeight: s.fontWeight != null ? String(s.fontWeight) : defaultStyle.fontWeight,
        textAlign: typeof s.textAlign === 'string' ? s.textAlign : defaultStyle.textAlign,
        textColor: typeof s.color === 'string' ? s.color : defaultStyle.textColor,
        backgroundColor: typeof s.backgroundColor === 'string' ? s.backgroundColor : defaultStyle.backgroundColor,
        borderColor: typeof s.borderColor === 'string' ? s.borderColor : defaultStyle.borderColor,
        borderWidth: parseNumeric(s.borderWidth, defaultStyle.borderWidth),
        borderStyle: typeof s.borderStyle === 'string' ? s.borderStyle : defaultStyle.borderStyle,
        borderRadius: parseNumeric(s.borderRadius, defaultStyle.borderRadius),
        opacity: typeof s.opacity === 'number' ? s.opacity : defaultStyle.opacity,
    };
}

export function useElementStyle(initialStyle?: Partial<ElementStyle>) {
    const [style, setStyle] = useState<ElementStyle>({
        ...defaultStyle, 
        ...initialStyle
    });

    const updateStyle = useCallback(<K extends keyof ElementStyle>(key: K, value: ElementStyle[K]) => {
        setStyle(prev => ({ ...prev, [key]: value }));}, []);

    const resetStyle = useCallback(() =>{
        setStyle({ ...defaultStyle, ...initialStyle});}, [initialStyle]);

    return { style, updateStyle, resetStyle };  
}