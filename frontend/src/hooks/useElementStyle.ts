import  {useCallback,useState} from "react";

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