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