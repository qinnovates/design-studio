import type { SceneGraph, SceneNode, ComponentNode, TextNode } from '@design-studio/canvas';
import type { ASTNode, StyleDeclaration } from '../ast/ASTNode';
import { createRootNode, createComponentASTNode } from '../ast/ASTNode';

/** Convert a scene graph to the platform-neutral AST */
export function sceneToAST(graph: SceneGraph): ASTNode {
  const children = graph.rootIds
    .map((id) => graph.nodes[id])
    .filter((n): n is SceneNode => n !== undefined)
    .map((n) => convertNode(n, graph));

  return createRootNode(children);
}

function convertNode(node: SceneNode, graph: SceneGraph): ASTNode {
  const children = node.children
    .map((id) => graph.nodes[id])
    .filter((n): n is SceneNode => n !== undefined)
    .map((n) => convertNode(n, graph));

  const styles = tokenBindingsToStyles(node.tokenBindings);

  switch (node.type) {
    case 'component':
      return createComponentASTNode(
        node.componentId,
        { ...node.props, variant: node.variant },
        styles,
        children,
      );

    case 'text':
      return {
        type: 'text',
        props: { content: node.content },
        styles: [
          ...styles,
          { property: 'fontSize', value: `${node.fontSize}px`, isToken: false },
          { property: 'fontWeight', value: `${node.fontWeight}`, isToken: false },
          { property: 'textAlign', value: node.textAlign, isToken: false },
        ],
        children: [],
        accessibility: {},
      };

    case 'image':
      return {
        type: 'image',
        props: { src: node.src, alt: node.alt, fit: node.objectFit },
        styles,
        children: [],
        accessibility: { role: 'img', label: node.alt },
      };

    case 'frame':
      return {
        type: 'container',
        props: { name: node.name },
        styles: [
          ...styles,
          ...(node.fill ? [{ property: 'background', value: node.fill, isToken: node.fill.startsWith('{') }] : []),
        ],
        children,
        accessibility: {},
      };

    case 'shape':
      return {
        type: 'container',
        props: {},
        styles: [
          ...styles,
          ...(node.fill ? [{ property: 'background', value: node.fill, isToken: node.fill.startsWith('{') }] : []),
          { property: 'cornerRadius', value: `${node.cornerRadius}px`, isToken: false },
        ],
        children,
        accessibility: {},
      };

    case 'group':
    default:
      return {
        type: 'container',
        props: {},
        styles,
        children,
        accessibility: {},
      };
  }
}

function tokenBindingsToStyles(bindings: Record<string, string>): StyleDeclaration[] {
  return Object.entries(bindings).map(([property, value]) => ({
    property,
    value,
    isToken: value.startsWith('{'),
  }));
}
