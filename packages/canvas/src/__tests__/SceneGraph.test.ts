import { describe, it, expect } from 'vitest';
import {
  createSceneGraph,
  createFrameNode,
  createComponentNode,
  createTextNode,
  createShapeNode,
  createImageNode,
  createGroupNode,
  addNode,
  removeNode,
  updateNode,
  moveNode,
  getChildren,
  getAncestors,
} from '../scene/SceneGraph';

describe('SceneGraph', () => {
  describe('createSceneGraph', () => {
    it('creates an empty scene graph', () => {
      const graph = createSceneGraph();
      expect(graph.nodes).toEqual({});
      expect(graph.rootIds).toEqual([]);
    });
  });

  describe('Factory functions', () => {
    it('creates a frame node with defaults', () => {
      const node = createFrameNode('Test Frame');
      expect(node.type).toBe('frame');
      expect(node.name).toBe('Test Frame');
      expect(node.clipContent).toBe(true);
      expect(node.width).toBe(100);
      expect(node.height).toBe(100);
      expect(node.visible).toBe(true);
      expect(node.locked).toBe(false);
      expect(node.children).toEqual([]);
    });

    it('creates a frame node with overrides', () => {
      const node = createFrameNode('Big Frame', { width: 1440, height: 900, fill: '#ffffff' });
      expect(node.width).toBe(1440);
      expect(node.height).toBe(900);
      expect(node.fill).toBe('#ffffff');
    });

    it('creates a component node', () => {
      const node = createComponentNode('button', 'My Button');
      expect(node.type).toBe('component');
      expect(node.componentId).toBe('button');
      expect(node.variant).toBe('default');
      expect(node.props).toEqual({});
    });

    it('creates a text node with content', () => {
      const node = createTextNode('Hello World');
      expect(node.type).toBe('text');
      expect(node.content).toBe('Hello World');
      expect(node.fontFamily).toBe('Inter');
      expect(node.fontSize).toBe(16);
    });

    it('creates a shape node', () => {
      const node = createShapeNode('ellipse');
      expect(node.type).toBe('shape');
      expect(node.shapeKind).toBe('ellipse');
    });

    it('creates an image node', () => {
      const node = createImageNode('https://example.com/img.png', 'Test image');
      expect(node.type).toBe('image');
      expect(node.src).toBe('https://example.com/img.png');
      expect(node.alt).toBe('Test image');
    });

    it('generates unique IDs', () => {
      const a = createFrameNode('A');
      const b = createFrameNode('B');
      expect(a.id).not.toBe(b.id);
    });
  });

  describe('addNode', () => {
    it('adds a root node', () => {
      let graph = createSceneGraph();
      const node = createFrameNode('Root');
      graph = addNode(graph, node);
      expect(graph.rootIds).toContain(node.id);
      expect(graph.nodes[node.id]).toBeDefined();
      expect(graph.nodes[node.id]!.parentId).toBeNull();
    });

    it('adds a child node to a parent', () => {
      let graph = createSceneGraph();
      const parent = createFrameNode('Parent');
      graph = addNode(graph, parent);
      const child = createTextNode('Child');
      graph = addNode(graph, child, parent.id);
      expect(graph.nodes[child.id]!.parentId).toBe(parent.id);
      expect(graph.nodes[parent.id]!.children).toContain(child.id);
      expect(graph.rootIds).not.toContain(child.id);
    });

    it('does not mutate the original graph', () => {
      const graph = createSceneGraph();
      const node = createFrameNode('Test');
      const newGraph = addNode(graph, node);
      expect(graph.rootIds).toEqual([]);
      expect(newGraph.rootIds).toContain(node.id);
    });
  });

  describe('removeNode', () => {
    it('removes a root node', () => {
      let graph = createSceneGraph();
      const node = createFrameNode('Root');
      graph = addNode(graph, node);
      graph = removeNode(graph, node.id);
      expect(graph.rootIds).not.toContain(node.id);
      expect(graph.nodes[node.id]).toBeUndefined();
    });

    it('removes a child and updates parent', () => {
      let graph = createSceneGraph();
      const parent = createFrameNode('Parent');
      graph = addNode(graph, parent);
      const child = createTextNode('Child');
      graph = addNode(graph, child, parent.id);
      graph = removeNode(graph, child.id);
      expect(graph.nodes[child.id]).toBeUndefined();
      expect(graph.nodes[parent.id]!.children).not.toContain(child.id);
    });

    it('removes descendants recursively', () => {
      let graph = createSceneGraph();
      const root = createFrameNode('Root');
      graph = addNode(graph, root);
      const child = createGroupNode('Group');
      graph = addNode(graph, child, root.id);
      const grandchild = createTextNode('Deep');
      graph = addNode(graph, grandchild, child.id);
      graph = removeNode(graph, child.id);
      expect(graph.nodes[child.id]).toBeUndefined();
      expect(graph.nodes[grandchild.id]).toBeUndefined();
    });

    it('returns unchanged graph for non-existent node', () => {
      const graph = createSceneGraph();
      const result = removeNode(graph, 'non-existent');
      expect(result).toBe(graph);
    });
  });

  describe('updateNode', () => {
    it('updates node properties', () => {
      let graph = createSceneGraph();
      const node = createFrameNode('Test');
      graph = addNode(graph, node);
      graph = updateNode(graph, node.id, { x: 100, y: 200, name: 'Updated' });
      expect(graph.nodes[node.id]!.x).toBe(100);
      expect(graph.nodes[node.id]!.y).toBe(200);
      expect(graph.nodes[node.id]!.name).toBe('Updated');
    });

    it('does not mutate the original', () => {
      let graph = createSceneGraph();
      const node = createFrameNode('Test');
      graph = addNode(graph, node);
      const original = graph.nodes[node.id]!;
      updateNode(graph, node.id, { x: 999 });
      expect(original.x).toBe(0);
    });
  });

  describe('moveNode', () => {
    it('moves a node by delta', () => {
      let graph = createSceneGraph();
      const node = createFrameNode('Test', { x: 10, y: 20 });
      graph = addNode(graph, node);
      graph = moveNode(graph, node.id, 5, -3);
      expect(graph.nodes[node.id]!.x).toBe(15);
      expect(graph.nodes[node.id]!.y).toBe(17);
    });
  });

  describe('getChildren', () => {
    it('returns child nodes', () => {
      let graph = createSceneGraph();
      const parent = createFrameNode('Parent');
      graph = addNode(graph, parent);
      const c1 = createTextNode('C1');
      const c2 = createTextNode('C2');
      graph = addNode(graph, c1, parent.id);
      graph = addNode(graph, c2, parent.id);
      const children = getChildren(graph, parent.id);
      expect(children).toHaveLength(2);
    });

    it('returns empty for node with no children', () => {
      let graph = createSceneGraph();
      const node = createTextNode('Leaf');
      graph = addNode(graph, node);
      expect(getChildren(graph, node.id)).toEqual([]);
    });
  });

  describe('getAncestors', () => {
    it('returns ancestors from leaf to root', () => {
      let graph = createSceneGraph();
      const root = createFrameNode('Root');
      graph = addNode(graph, root);
      const mid = createGroupNode('Mid');
      graph = addNode(graph, mid, root.id);
      const leaf = createTextNode('Leaf');
      graph = addNode(graph, leaf, mid.id);
      const ancestors = getAncestors(graph, leaf.id);
      expect(ancestors).toHaveLength(2);
      expect(ancestors[0]!.id).toBe(mid.id);
      expect(ancestors[1]!.id).toBe(root.id);
    });
  });
});
