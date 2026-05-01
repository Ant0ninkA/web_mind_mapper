export interface MindmapNode {
  id: string;
  position: { x: number; y: number };
  data: { label: string; [key: string]: unknown };
}

export interface MindmapEdge {
  id: string;
  source: string;
  target: string;
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
