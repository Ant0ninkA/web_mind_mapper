// Note on dates: the backend types `createdAt`/`updatedAt` as `Date`, but they
// arrive over the wire as JSON ISO-8601 strings, so they are `string` here.

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
  createdAt: string;
  updatedAt: string;
}

/** Body for `POST /mindmaps`. `name` is required; the graph defaults to empty. */
export interface CreateMindmapDto {
  name: string;
  nodes?: MindmapNode[];
  edges?: MindmapEdge[];
}

/**
 * Body for `PUT /mindmaps/:id`. The backend only supports a full replace, so a
 * caller updating the graph should send the complete `nodes` + `edges` arrays,
 * not a partial diff.
 */
export interface UpdateMindmapDto {
  name?: string;
  nodes?: MindmapNode[];
  edges?: MindmapEdge[];
}
