import type { ASTNode, StyleDeclaration } from '../ast/ASTNode';
import type { GeneratorOutput, Generator } from '../pipeline/ExportPipeline';

/** Map component IDs to React element names */
const COMPONENT_MAP: Record<string, string> = {
  button: 'button',
  'text-input': 'input',
  card: 'div',
  text: 'p',
  heading: 'h2',
  image: 'img',
  container: 'div',
  navbar: 'nav',
  alert: 'div',
};

/** Map token references to Tailwind classes where possible */
function tokenToTailwind(prop: string, value: string): string {
  // Strip {} from token refs
  const tokenPath = value.replace(/^\{|\}$/g, '');

  const mappings: Record<string, Record<string, string>> = {
    'color.action.primary': { background: 'bg-blue-600', text: 'text-blue-600', color: 'text-blue-600' },
    'color.text.primary': { color: 'text-gray-900', fill: 'text-gray-900', text: 'text-gray-900' },
    'color.text.secondary': { color: 'text-gray-500', fill: 'text-gray-500', text: 'text-gray-500' },
    'color.text.onPrimary': { color: 'text-white', text: 'text-white' },
    'color.surface.primary': { background: 'bg-white' },
    'color.surface.secondary': { background: 'bg-gray-50' },
    'color.border.primary': { border: 'border-gray-200' },
    'radius.none': { cornerRadius: 'rounded-none' },
    'radius.sm': { cornerRadius: 'rounded-sm' },
    'radius.md': { cornerRadius: 'rounded-md' },
    'radius.lg': { cornerRadius: 'rounded-lg' },
    'radius.xl': { cornerRadius: 'rounded-xl' },
    'radius.full': { cornerRadius: 'rounded-full' },
    'shadow.none': { shadow: 'shadow-none' },
    'shadow.sm': { shadow: 'shadow-sm' },
    'shadow.md': { shadow: 'shadow-md' },
    'shadow.lg': { shadow: 'shadow-lg' },
    'shadow.xl': { shadow: 'shadow-xl' },
    'spacing.1': { padding: 'p-1', paddingX: 'px-1', paddingY: 'py-1', gap: 'gap-1' },
    'spacing.2': { padding: 'p-2', paddingX: 'px-2', paddingY: 'py-2', gap: 'gap-2' },
    'spacing.3': { padding: 'p-3', paddingX: 'px-3', paddingY: 'py-3', gap: 'gap-3' },
    'spacing.4': { padding: 'p-4', paddingX: 'px-4', paddingY: 'py-4', gap: 'gap-4' },
    'spacing.6': { padding: 'p-6', paddingX: 'px-6', paddingY: 'py-6', gap: 'gap-6' },
    'spacing.8': { padding: 'p-8', paddingX: 'px-8', paddingY: 'py-8', gap: 'gap-8' },
  };

  return mappings[tokenPath]?.[prop] ?? '';
}

function generateTailwindClasses(styles: StyleDeclaration[]): string {
  const classes: string[] = [];

  for (const style of styles) {
    if (style.isToken) {
      const tw = tokenToTailwind(style.property, style.value);
      if (tw) classes.push(tw);
    }
  }

  return classes.join(' ');
}

function generateInlineStyles(styles: StyleDeclaration[]): Record<string, string> {
  const inline: Record<string, string> = {};

  for (const style of styles) {
    if (!style.isToken) {
      inline[style.property] = style.value;
    }
  }

  return inline;
}

function renderNode(node: ASTNode, indent: number): string {
  const pad = '  '.repeat(indent);

  if (node.type === 'root') {
    return node.children.map((c) => renderNode(c, indent)).join('\n');
  }

  const tag = node.componentId ? (COMPONENT_MAP[node.componentId] ?? 'div') : 'div';
  const twClasses = generateTailwindClasses(node.styles);
  const inlineStyles = generateInlineStyles(node.styles);

  const attrs: string[] = [];
  if (twClasses) attrs.push(`className="${twClasses}"`);
  if (Object.keys(inlineStyles).length > 0) {
    attrs.push(`style={${JSON.stringify(inlineStyles)}}`);
  }

  // Handle specific component props
  if (node.componentId === 'button' && node.props['text']) {
    const children = String(node.props['text']);
    return `${pad}<${tag} ${attrs.join(' ')}>${children}</${tag}>`;
  }

  if (node.componentId === 'text-input') {
    attrs.push(`type="${node.props['inputType'] ?? 'text'}"`);
    if (node.props['placeholder']) attrs.push(`placeholder="${node.props['placeholder']}"`);
    if (node.props['label']) {
      return `${pad}<label>\n${pad}  ${node.props['label']}\n${pad}  <${tag} ${attrs.join(' ')} />\n${pad}</label>`;
    }
    return `${pad}<${tag} ${attrs.join(' ')} />`;
  }

  if (node.componentId === 'image') {
    attrs.push(`src="${node.props['src'] ?? ''}"`);
    attrs.push(`alt="${node.props['alt'] ?? ''}"`);
    return `${pad}<${tag} ${attrs.join(' ')} />`;
  }

  if (node.componentId === 'heading') {
    const level = node.props['level'] ?? 'h2';
    const content = String(node.props['content'] ?? '');
    return `${pad}<${level} ${attrs.join(' ')}>${content}</${level}>`;
  }

  if (node.componentId === 'text') {
    const content = String(node.props['content'] ?? '');
    return `${pad}<${tag} ${attrs.join(' ')}>${content}</${tag}>`;
  }

  // Accessibility attributes
  if (node.accessibility.role) attrs.push(`role="${node.accessibility.role}"`);
  if (node.accessibility.label) attrs.push(`aria-label="${node.accessibility.label}"`);

  if (node.children.length === 0) {
    return `${pad}<${tag} ${attrs.join(' ')} />`;
  }

  const childrenStr = node.children.map((c) => renderNode(c, indent + 1)).join('\n');
  return `${pad}<${tag} ${attrs.join(' ')}>\n${childrenStr}\n${pad}</${tag}>`;
}

export class ReactGenerator implements Generator {
  name = 'React + Tailwind';
  platform = 'react';

  generate(ast: ASTNode): GeneratorOutput[] {
    const jsx = renderNode(ast, 2);

    const component = `import React from 'react';

export default function Page() {
  return (
${jsx}
  );
}
`;

    return [
      { filename: 'Page.tsx', content: component, language: 'tsx' },
    ];
  }
}
