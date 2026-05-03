export interface NodeStyle {
  backgroundColor?: string;
  color?: string;
  borderColor?: string;
  borderWidth?: number | string;
  borderStyle?: string;
  borderRadius?: number | string;
  fontSize?: number | string;
  fontFamily?: string;
  fontWeight?: number | string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  opacity?: number;
}

export interface MindmapNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: { label: string; [key: string]: unknown };
  style?: NodeStyle;
}

export interface MindmapEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  type?: string;
  label?: string;
  animated?: boolean;
  style?: Record<string, unknown>;
}

export interface Mindmap {
  id: string;
  name: string;
  nodes: MindmapNode[];
  edges: MindmapEdge[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMindmapDto {
  name: string;
  nodes?: MindmapNode[];
  edges?: MindmapEdge[];
}

export interface UpdateMindmapDto {
  name?: string;
  nodes?: MindmapNode[];
  edges?: MindmapEdge[];
}
