import type { SceneGraph, SceneNode } from '@design-studio/canvas';
import { ComponentRegistry } from '@design-studio/components';

/** Build the system prompt for the design AI assistant */
export function buildSystemPrompt(sceneContext?: string): string {
  const components = ComponentRegistry.getAll();
  const componentList = components
    .map((c) => `- ${c.id}: ${c.description} [variants: ${c.variants.map((v) => v.name).join(', ')}]`)
    .join('\n');

  return `You are a professional UI designer assistant in Design Studio, an open-source design tool.

Your role is to help users design beautiful, accessible apps by manipulating the canvas directly through tool calls.

AVAILABLE COMPONENTS:
${componentList}

DESIGN TOKENS (available for token bindings):
Colors: color.text.primary, color.text.secondary, color.surface.primary, color.surface.secondary, color.action.primary, color.action.secondary, color.border.primary, color.error, color.success, color.warning
Typography: font.size.xs through font.size.4xl, font.weight.light through font.weight.bold
Spacing: spacing.0 through spacing.16
Radius: radius.none, radius.sm, radius.md, radius.lg, radius.xl, radius.full
Shadows: shadow.none, shadow.sm, shadow.md, shadow.lg, shadow.xl

GUIDELINES:
1. Use tool calls to add/modify elements. Don't just describe what to do — DO it.
2. Place elements at reasonable positions. A typical canvas is 1440x900 for desktop, 375x812 for mobile.
3. Use design tokens for colors, not raw hex values. This ensures theme switching works.
4. Explain your design decisions in plain English between tool calls.
5. Always consider accessibility: sufficient contrast, touch targets >= 44px, descriptive text.
6. Keep layouts clean with consistent spacing.
7. When adding multiple elements, group them logically (e.g., a form has a container, label, inputs, button).

${sceneContext ? `\nCURRENT CANVAS:\n${sceneContext}` : ''}`;
}

/** Serialize the scene graph into a text description for the AI */
export function serializeSceneForAI(graph: SceneGraph): string {
  if (Object.keys(graph.nodes).length === 0) return 'The canvas is empty.';

  const lines: string[] = [`Canvas has ${Object.keys(graph.nodes).length} elements:`];

  for (const nodeId of graph.rootIds) {
    const node = graph.nodes[nodeId];
    if (node) serializeNode(graph, node, 0, lines);
  }

  return lines.join('\n');
}

function serializeNode(graph: SceneGraph, node: SceneNode, depth: number, lines: string[]): void {
  const indent = '  '.repeat(depth);
  const pos = `(${node.x}, ${node.y}) ${node.width}x${node.height}`;

  switch (node.type) {
    case 'component':
      lines.push(`${indent}- [${node.id}] Component: ${node.componentId} "${node.name}" at ${pos} variant=${node.variant}`);
      break;
    case 'text':
      lines.push(`${indent}- [${node.id}] Text: "${node.content.slice(0, 50)}" at ${pos} size=${node.fontSize}`);
      break;
    case 'frame':
      lines.push(`${indent}- [${node.id}] Frame: "${node.name}" at ${pos}`);
      break;
    case 'shape':
      lines.push(`${indent}- [${node.id}] Shape: ${node.shapeKind} at ${pos}`);
      break;
    case 'image':
      lines.push(`${indent}- [${node.id}] Image: "${node.alt}" at ${pos}`);
      break;
    case 'group':
      lines.push(`${indent}- [${node.id}] Group: "${node.name}" at ${pos}`);
      break;
  }

  for (const childId of node.children) {
    const child = graph.nodes[childId];
    if (child) serializeNode(graph, child, depth + 1, lines);
  }
}
