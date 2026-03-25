import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  SceneGraph,
  SceneNode,
} from '@design-studio/canvas';
import {
  createSceneGraph,
  addNode,
  removeNode,
  updateNode,
  moveNode,
} from '@design-studio/canvas';

// ─── Annotations (IDA Pro-style notes) ───────────────────────

export interface Annotation {
  id: string;
  nodeId: string | null;         // null = canvas-level note
  x: number;
  y: number;
  content: string;
  author: string;
  color: 'yellow' | 'blue' | 'green' | 'red' | 'purple';
  type: 'note' | 'todo' | 'question' | 'decision' | 'warning';
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Store Types ─────────────────────────────────────────────

interface CanvasState {
  // Scene
  sceneGraph: SceneGraph;
  selectedNodeIds: string[];
  hoveredNodeId: string | null;
  clipboardNodeIds: string[];

  // Viewport
  camera: { x: number; y: number; zoom: number };

  // Annotations
  annotations: Record<string, Annotation>;
  activeAnnotationId: string | null;

  // History
  undoStack: SceneGraph[];
  redoStack: SceneGraph[];
  canUndo: boolean;
  canRedo: boolean;

  // Drag state
  isDragging: boolean;
  dragTarget: string | null;

  // Actions — Scene
  addNodeToScene: (node: SceneNode, parentId?: string) => void;
  removeSelectedNodes: () => void;
  updateNodeProps: (nodeId: string, updates: Partial<SceneNode>) => void;
  moveNodes: (nodeIds: string[], dx: number, dy: number) => void;
  duplicateSelected: () => void;

  // Actions — Selection
  selectNodes: (ids: string[], append?: boolean) => void;
  selectAll: () => void;
  clearSelection: () => void;
  setHoveredNode: (id: string | null) => void;

  // Actions — Viewport
  setCamera: (camera: Partial<{ x: number; y: number; zoom: number }>) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: () => void;
  resetZoom: () => void;

  // Actions — History
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;

  // Actions — Annotations
  addAnnotation: (annotation: Omit<Annotation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  removeAnnotation: (id: string) => void;
  resolveAnnotation: (id: string) => void;
  setActiveAnnotation: (id: string | null) => void;
  getAnnotationsForNode: (nodeId: string) => Annotation[];
  getUnresolvedAnnotations: () => Annotation[];

  // Actions — Drag
  setDragging: (isDragging: boolean, target?: string | null) => void;

  // Actions — Load
  loadSceneGraph: (graph: SceneGraph) => void;
}

let annotationCounter = 0;

export const useCanvasStore = create<CanvasState>()(
  immer((set, get) => ({
    // Initial state
    sceneGraph: createSceneGraph(),
    selectedNodeIds: [],
    hoveredNodeId: null,
    clipboardNodeIds: [],
    camera: { x: 0, y: 0, zoom: 1 },
    annotations: {},
    activeAnnotationId: null,
    undoStack: [],
    redoStack: [],
    canUndo: false,
    canRedo: false,
    isDragging: false,
    dragTarget: null,

    // ── Scene Actions ──────────────────────────
    addNodeToScene: (node, parentId) => {
      set((state) => {
        state.pushHistory();
        state.sceneGraph = addNode(state.sceneGraph, node, parentId);
        state.selectedNodeIds = [node.id];
      });
    },

    removeSelectedNodes: () => {
      set((state) => {
        if (state.selectedNodeIds.length === 0) return;
        state.pushHistory();
        for (const id of state.selectedNodeIds) {
          state.sceneGraph = removeNode(state.sceneGraph, id);
        }
        state.selectedNodeIds = [];
      });
    },

    updateNodeProps: (nodeId, updates) => {
      set((state) => {
        state.sceneGraph = updateNode(state.sceneGraph, nodeId, updates);
      });
    },

    moveNodes: (nodeIds, dx, dy) => {
      set((state) => {
        for (const id of nodeIds) {
          state.sceneGraph = moveNode(state.sceneGraph, id, dx, dy);
        }
      });
    },

    duplicateSelected: () => {
      const state = get();
      if (state.selectedNodeIds.length === 0) return;
      // Deep copy selected nodes with new IDs
      const newIds: string[] = [];
      set((s) => {
        s.pushHistory();
        for (const id of s.selectedNodeIds) {
          const node = s.sceneGraph.nodes[id];
          if (!node) continue;
          const newId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
          const clone: SceneNode = {
            ...structuredClone(node),
            id: newId,
            name: `${node.name} copy`,
            x: node.x + 20,
            y: node.y + 20,
          };
          s.sceneGraph = addNode(s.sceneGraph, clone, node.parentId ?? undefined);
          newIds.push(newId);
        }
        s.selectedNodeIds = newIds;
      });
    },

    // ── Selection Actions ──────────────────────
    selectNodes: (ids, append = false) => {
      set((state) => {
        state.selectedNodeIds = append
          ? [...new Set([...state.selectedNodeIds, ...ids])]
          : ids;
      });
    },

    selectAll: () => {
      set((state) => {
        state.selectedNodeIds = Object.keys(state.sceneGraph.nodes);
      });
    },

    clearSelection: () => {
      set((state) => {
        state.selectedNodeIds = [];
      });
    },

    setHoveredNode: (id) => {
      set((state) => {
        state.hoveredNodeId = id;
      });
    },

    // ── Viewport Actions ───────────────────────
    setCamera: (camera) => {
      set((state) => {
        Object.assign(state.camera, camera);
      });
    },

    zoomIn: () => {
      set((state) => {
        state.camera.zoom = Math.min(state.camera.zoom * 1.2, 5);
      });
    },

    zoomOut: () => {
      set((state) => {
        state.camera.zoom = Math.max(state.camera.zoom / 1.2, 0.1);
      });
    },

    zoomToFit: () => {
      set((state) => {
        state.camera = { x: 0, y: 0, zoom: 1 };
      });
    },

    resetZoom: () => {
      set((state) => {
        state.camera.zoom = 1;
      });
    },

    // ── History Actions ────────────────────────
    pushHistory: () => {
      set((state) => {
        state.undoStack.push(structuredClone(state.sceneGraph));
        if (state.undoStack.length > 50) state.undoStack.shift();
        state.redoStack = [];
        state.canUndo = true;
        state.canRedo = false;
      });
    },

    undo: () => {
      set((state) => {
        const prev = state.undoStack.pop();
        if (!prev) return;
        state.redoStack.push(structuredClone(state.sceneGraph));
        state.sceneGraph = prev;
        state.canUndo = state.undoStack.length > 0;
        state.canRedo = true;
        state.selectedNodeIds = [];
      });
    },

    redo: () => {
      set((state) => {
        const next = state.redoStack.pop();
        if (!next) return;
        state.undoStack.push(structuredClone(state.sceneGraph));
        state.sceneGraph = next;
        state.canUndo = true;
        state.canRedo = state.redoStack.length > 0;
        state.selectedNodeIds = [];
      });
    },

    // ── Annotation Actions ─────────────────────
    addAnnotation: (annotation) => {
      const id = `ann-${Date.now().toString(36)}-${annotationCounter++}`;
      const now = new Date().toISOString();
      set((state) => {
        state.annotations[id] = {
          ...annotation,
          id,
          createdAt: now,
          updatedAt: now,
        };
        state.activeAnnotationId = id;
      });
    },

    updateAnnotation: (id, updates) => {
      set((state) => {
        const ann = state.annotations[id];
        if (!ann) return;
        Object.assign(ann, updates, { updatedAt: new Date().toISOString() });
      });
    },

    removeAnnotation: (id) => {
      set((state) => {
        delete state.annotations[id];
        if (state.activeAnnotationId === id) state.activeAnnotationId = null;
      });
    },

    resolveAnnotation: (id) => {
      set((state) => {
        const ann = state.annotations[id];
        if (ann) {
          ann.resolved = true;
          ann.updatedAt = new Date().toISOString();
        }
      });
    },

    setActiveAnnotation: (id) => {
      set((state) => {
        state.activeAnnotationId = id;
      });
    },

    getAnnotationsForNode: (nodeId) => {
      const state = get();
      return Object.values(state.annotations).filter((a) => a.nodeId === nodeId);
    },

    getUnresolvedAnnotations: () => {
      const state = get();
      return Object.values(state.annotations).filter((a) => !a.resolved);
    },

    // ── Drag Actions ───────────────────────────
    setDragging: (isDragging, target = null) => {
      set((state) => {
        state.isDragging = isDragging;
        state.dragTarget = target;
      });
    },

    // ── Load ───────────────────────────────────
    loadSceneGraph: (graph) => {
      set((state) => {
        state.sceneGraph = graph;
        state.selectedNodeIds = [];
        state.undoStack = [];
        state.redoStack = [];
        state.canUndo = false;
        state.canRedo = false;
      });
    },
  })),
);
