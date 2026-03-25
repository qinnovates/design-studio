import * as Y from 'yjs';

// ─── Comments ────────────────────────────────────────────────

export interface CommentThread {
  id: string;
  pageId: string;
  nodeId: string | null;
  x: number | null;
  y: number | null;
  comments: Comment[];
  resolved: boolean;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  reactions: Reaction[];
}

export interface Reaction {
  emoji: string;
  userId: string;
}

// ─── Presence ────────────────────────────────────────────────

export interface PresenceState {
  userId: string;
  userName: string;
  color: string;
  cursor: { x: number; y: number } | null;
  selectedNodeIds: string[];
  activePageId: string | null;
  lastActive: string;
}

// ─── Yjs Scene Binding ──────────────────────────────────────

/**
 * SceneBinding syncs a Yjs Y.Map to the scene graph.
 *
 * Structure:
 * - Y.Map("nodes") -> Y.Map per node ID -> Y.Map of properties
 * - Y.Array("rootIds") -> ordered root node IDs
 *
 * This enables CRDT-based conflict-free merging of concurrent edits.
 */
export class SceneBinding {
  private doc: Y.Doc;
  private nodesMap: Y.Map<Y.Map<unknown>>;
  private rootIds: Y.Array<string>;
  private onChange: (nodes: Record<string, unknown>, rootIds: string[]) => void;

  constructor(
    doc: Y.Doc,
    onChange: (nodes: Record<string, unknown>, rootIds: string[]) => void,
  ) {
    this.doc = doc;
    this.nodesMap = doc.getMap('nodes') as Y.Map<Y.Map<unknown>>;
    this.rootIds = doc.getArray('rootIds');
    this.onChange = onChange;

    // Listen for remote changes
    this.nodesMap.observeDeep(() => {
      this.notifyChange();
    });
    this.rootIds.observe(() => {
      this.notifyChange();
    });
  }

  /** Load a full scene graph into the Yjs document */
  loadScene(nodes: Record<string, Record<string, unknown>>, rootIds: string[]): void {
    this.doc.transact(() => {
      // Clear existing
      this.nodesMap.forEach((_, key) => this.nodesMap.delete(key));
      while (this.rootIds.length > 0) this.rootIds.delete(0);

      // Load nodes
      for (const [id, props] of Object.entries(nodes)) {
        const yNode = new Y.Map<unknown>();
        for (const [key, value] of Object.entries(props)) {
          if (key === 'children') {
            const yChildren = new Y.Array<string>();
            yChildren.push(value as string[]);
            yNode.set(key, yChildren);
          } else {
            yNode.set(key, value);
          }
        }
        this.nodesMap.set(id, yNode);
      }

      // Load root IDs
      this.rootIds.push(rootIds);
    });
  }

  /** Update a single node property */
  updateNodeProperty(nodeId: string, property: string, value: unknown): void {
    const yNode = this.nodesMap.get(nodeId);
    if (yNode) {
      this.doc.transact(() => {
        yNode.set(property, value);
      });
    }
  }

  /** Add a node to the scene */
  addNode(nodeId: string, props: Record<string, unknown>, parentId?: string): void {
    this.doc.transact(() => {
      const yNode = new Y.Map<unknown>();
      for (const [key, value] of Object.entries(props)) {
        if (key === 'children') {
          const yChildren = new Y.Array<string>();
          yChildren.push((value as string[]) ?? []);
          yNode.set(key, yChildren);
        } else {
          yNode.set(key, value);
        }
      }
      this.nodesMap.set(nodeId, yNode);

      if (parentId) {
        const parent = this.nodesMap.get(parentId);
        if (parent) {
          const children = parent.get('children') as Y.Array<string> | undefined;
          if (children) {
            children.push([nodeId]);
          }
        }
      } else {
        this.rootIds.push([nodeId]);
      }
    });
  }

  /** Remove a node from the scene */
  removeNode(nodeId: string): void {
    this.doc.transact(() => {
      const node = this.nodesMap.get(nodeId);
      if (!node) return;

      // Remove from parent's children
      const parentId = node.get('parentId') as string | null;
      if (parentId) {
        const parent = this.nodesMap.get(parentId);
        if (parent) {
          const children = parent.get('children') as Y.Array<string> | undefined;
          if (children) {
            for (let i = 0; i < children.length; i++) {
              if (children.get(i) === nodeId) {
                children.delete(i);
                break;
              }
            }
          }
        }
      } else {
        // Remove from root IDs
        for (let i = 0; i < this.rootIds.length; i++) {
          if (this.rootIds.get(i) === nodeId) {
            this.rootIds.delete(i);
            break;
          }
        }
      }

      // Delete the node and its children recursively
      this.deleteNodeRecursive(nodeId);
    });
  }

  private deleteNodeRecursive(nodeId: string): void {
    const node = this.nodesMap.get(nodeId);
    if (!node) return;

    const children = node.get('children') as Y.Array<string> | undefined;
    if (children) {
      for (let i = 0; i < children.length; i++) {
        this.deleteNodeRecursive(children.get(i));
      }
    }

    this.nodesMap.delete(nodeId);
  }

  /** Get the current state as plain objects */
  getSnapshot(): { nodes: Record<string, Record<string, unknown>>; rootIds: string[] } {
    const nodes: Record<string, Record<string, unknown>> = {};
    this.nodesMap.forEach((yNode, id) => {
      const props: Record<string, unknown> = {};
      yNode.forEach((value, key) => {
        if (value instanceof Y.Array) {
          props[key] = value.toArray();
        } else {
          props[key] = value;
        }
      });
      nodes[id] = props;
    });

    return {
      nodes,
      rootIds: this.rootIds.toArray(),
    };
  }

  private notifyChange(): void {
    const snapshot = this.getSnapshot();
    this.onChange(snapshot.nodes, snapshot.rootIds);
  }

  /** Get the underlying Yjs document */
  getDoc(): Y.Doc {
    return this.doc;
  }
}

// ─── Awareness (Cursors & Presence) ──────────────────────────

const PRESENCE_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
];

export function getPresenceColor(index: number): string {
  return PRESENCE_COLORS[index % PRESENCE_COLORS.length]!;
}

// ─── Version History ─────────────────────────────────────────

export interface VersionSnapshot {
  id: string;
  name: string;
  sceneGraph: string; // JSON stringified
  tokens: string;     // JSON stringified
  createdBy: string;
  createdAt: string;
  nodeCount: number;
}

export class VersionHistory {
  private versions: VersionSnapshot[] = [];
  private maxVersions: number;

  constructor(maxVersions = 50) {
    this.maxVersions = maxVersions;
  }

  /** Save a named version snapshot */
  save(
    name: string,
    sceneGraph: unknown,
    tokens: unknown,
    createdBy: string,
  ): VersionSnapshot {
    const snapshot: VersionSnapshot = {
      id: `v-${Date.now().toString(36)}`,
      name,
      sceneGraph: JSON.stringify(sceneGraph),
      tokens: JSON.stringify(tokens),
      createdBy,
      createdAt: new Date().toISOString(),
      nodeCount: typeof sceneGraph === 'object' && sceneGraph !== null
        ? Object.keys((sceneGraph as any).nodes ?? {}).length
        : 0,
    };

    this.versions.push(snapshot);
    if (this.versions.length > this.maxVersions) {
      this.versions.shift();
    }

    return snapshot;
  }

  /** Auto-save (unnamed, timestamped) */
  autoSave(sceneGraph: unknown, tokens: unknown): VersionSnapshot {
    const now = new Date();
    const name = `Auto-save ${now.toLocaleTimeString()}`;
    return this.save(name, sceneGraph, tokens, 'system');
  }

  /** Get all versions, newest first */
  getAll(): VersionSnapshot[] {
    return [...this.versions].reverse();
  }

  /** Get a specific version by ID */
  get(id: string): VersionSnapshot | undefined {
    return this.versions.find((v) => v.id === id);
  }

  /** Restore returns the parsed scene graph and tokens */
  restore(id: string): { sceneGraph: unknown; tokens: unknown } | null {
    const version = this.get(id);
    if (!version) return null;
    return {
      sceneGraph: JSON.parse(version.sceneGraph),
      tokens: JSON.parse(version.tokens),
    };
  }

  /** Delete a version */
  delete(id: string): void {
    this.versions = this.versions.filter((v) => v.id !== id);
  }

  /** Rename a version */
  rename(id: string, name: string): void {
    const version = this.get(id);
    if (version) version.name = name;
  }

  get count(): number {
    return this.versions.length;
  }
}
