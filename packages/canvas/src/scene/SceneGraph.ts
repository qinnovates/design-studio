import { generateId } from '../utils/id';

// ─── Node Types ──────────────────────────────────────────────
export type NodeType =
  | 'frame'
  | 'group'
  | 'component'
  | 'text'
  | 'shape'
  | 'image';

export type ShapeKind = 'rectangle' | 'ellipse' | 'line' | 'polygon';

// ─── Token Bindings ──────────────────────────────────────────
export interface TokenBindings {
  /** Maps property paths to token references, e.g. { "fill": "{color.primary.500}" } */
  [propertyPath: string]: string;
}

// ─── Base Node ───────────────────────────────────────────────
export interface BaseNode {
  id: string;
  type: NodeType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  parentId: string | null;
  children: string[]; // ordered child IDs
  tokenBindings: TokenBindings;
  metadata: Record<string, unknown>;
}

// ─── Specialized Nodes ───────────────────────────────────────
export interface FrameNode extends BaseNode {
  type: 'frame';
  /** Clip children to frame bounds */
  clipContent: boolean;
  /** Background fill (token ref or raw value) */
  fill: string | null;
  /** Responsive breakpoint label */
  breakpoint: 'phone' | 'tablet' | 'desktop' | 'custom' | null;
}

export interface GroupNode extends BaseNode {
  type: 'group';
}

export interface ComponentNode extends BaseNode {
  type: 'component';
  /** Reference to ComponentDefinition.id */
  componentId: string;
  /** Variant key, e.g. "primary", "outline" */
  variant: string;
  /** Props override for the component instance */
  props: Record<string, unknown>;
}

export interface TextNode extends BaseNode {
  type: 'text';
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  fill: string;
}

export interface ShapeNode extends BaseNode {
  type: 'shape';
  shapeKind: ShapeKind;
  fill: string | null;
  stroke: string | null;
  strokeWidth: number;
  cornerRadius: number;
}

export interface ImageNode extends BaseNode {
  type: 'image';
  src: string;
  alt: string;
  objectFit: 'cover' | 'contain' | 'fill' | 'none';
}

export type SceneNode =
  | FrameNode
  | GroupNode
  | ComponentNode
  | TextNode
  | ShapeNode
  | ImageNode;

// ─── Scene Graph ─────────────────────────────────────────────
export interface SceneGraph {
  /** Map of node ID -> node */
  nodes: Record<string, SceneNode>;
  /** Ordered root-level node IDs */
  rootIds: string[];
}

// ─── Factory Functions ───────────────────────────────────────
export function createSceneGraph(): SceneGraph {
  return { nodes: {}, rootIds: [] };
}

function baseDefaults(type: NodeType, name: string): BaseNode {
  return {
    id: generateId(),
    type,
    name,
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    parentId: null,
    children: [],
    tokenBindings: {},
    metadata: {},
  };
}

export function createFrameNode(name = 'Frame', overrides?: Partial<FrameNode>): FrameNode {
  return {
    ...baseDefaults('frame', name),
    clipContent: true,
    fill: null,
    breakpoint: null,
    ...overrides,
  } as FrameNode;
}

export function createGroupNode(name = 'Group', overrides?: Partial<GroupNode>): GroupNode {
  return {
    ...baseDefaults('group', name),
    ...overrides,
  } as GroupNode;
}

export function createComponentNode(
  componentId: string,
  name = 'Component',
  overrides?: Partial<ComponentNode>,
): ComponentNode {
  return {
    ...baseDefaults('component', name),
    componentId,
    variant: 'default',
    props: {},
    ...overrides,
  } as ComponentNode;
}

export function createTextNode(content = 'Text', overrides?: Partial<TextNode>): TextNode {
  return {
    ...baseDefaults('text', 'Text'),
    content,
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: 0,
    textAlign: 'left',
    fill: '{color.text.primary}',
    ...overrides,
  } as TextNode;
}

export function createShapeNode(
  shapeKind: ShapeKind = 'rectangle',
  overrides?: Partial<ShapeNode>,
): ShapeNode {
  return {
    ...baseDefaults('shape', shapeKind),
    shapeKind,
    fill: '{color.surface.primary}',
    stroke: null,
    strokeWidth: 0,
    cornerRadius: 0,
    ...overrides,
  } as ShapeNode;
}

export function createImageNode(src = '', alt = '', overrides?: Partial<ImageNode>): ImageNode {
  return {
    ...baseDefaults('image', 'Image'),
    src,
    alt,
    objectFit: 'cover',
    ...overrides,
  } as ImageNode;
}

// ─── Scene Graph Operations ──────────────────────────────────
export function addNode(graph: SceneGraph, node: SceneNode, parentId?: string): SceneGraph {
  const nodes = { ...graph.nodes, [node.id]: { ...node, parentId: parentId ?? null } };

  if (parentId && nodes[parentId]) {
    const parent = { ...nodes[parentId]!, children: [...nodes[parentId]!.children, node.id] };
    nodes[parentId] = parent;
    return { nodes, rootIds: graph.rootIds };
  }

  return { nodes, rootIds: [...graph.rootIds, node.id] };
}

export function removeNode(graph: SceneGraph, nodeId: string): SceneGraph {
  const node = graph.nodes[nodeId];
  if (!node) return graph;

  // Collect all descendant IDs
  const toRemove = new Set<string>();
  const collect = (id: string) => {
    toRemove.add(id);
    const n = graph.nodes[id];
    if (n) n.children.forEach(collect);
  };
  collect(nodeId);

  // Remove from parent's children
  const nodes = { ...graph.nodes };
  if (node.parentId && nodes[node.parentId]) {
    nodes[node.parentId] = {
      ...nodes[node.parentId]!,
      children: nodes[node.parentId]!.children.filter((id) => id !== nodeId),
    };
  }

  // Delete all collected nodes
  for (const id of toRemove) {
    delete nodes[id];
  }

  return {
    nodes,
    rootIds: graph.rootIds.filter((id) => !toRemove.has(id)),
  };
}

export function updateNode(
  graph: SceneGraph,
  nodeId: string,
  updates: Partial<SceneNode>,
): SceneGraph {
  const node = graph.nodes[nodeId];
  if (!node) return graph;

  return {
    ...graph,
    nodes: {
      ...graph.nodes,
      [nodeId]: { ...node, ...updates } as SceneNode,
    },
  };
}

export function moveNode(
  graph: SceneGraph,
  nodeId: string,
  dx: number,
  dy: number,
): SceneGraph {
  const node = graph.nodes[nodeId];
  if (!node) return graph;
  return updateNode(graph, nodeId, { x: node.x + dx, y: node.y + dy });
}

export function getChildren(graph: SceneGraph, nodeId: string): SceneNode[] {
  const node = graph.nodes[nodeId];
  if (!node) return [];
  return node.children
    .map((id) => graph.nodes[id])
    .filter((n): n is SceneNode => n !== undefined);
}

export function getAncestors(graph: SceneGraph, nodeId: string): SceneNode[] {
  const ancestors: SceneNode[] = [];
  let current = graph.nodes[nodeId];
  while (current?.parentId) {
    const parent = graph.nodes[current.parentId];
    if (!parent) break;
    ancestors.push(parent);
    current = parent;
  }
  return ancestors;
}
