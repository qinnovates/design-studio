import type { ASTNode, StyleDeclaration } from '../ast/ASTNode';
import type { GeneratorOutput, Generator } from '../pipeline/ExportPipeline';

/** Escape a string for safe use in JSX attribute or text context */
function escapeJSX(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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
  const tokenPath = value.replace(/^\{|\}$/g, '');

  // Dynamic mapping from token path segments
  const parts = tokenPath.split('.');

  // Color tokens
  if (parts[0] === 'color') {
    const colorMap: Record<string, Record<string, string>> = {
      'color.action.primary': { background: 'bg-blue-600', text: 'text-blue-600', color: 'text-blue-600', border: 'border-blue-600' },
      'color.action.secondary': { background: 'bg-gray-100', text: 'text-gray-600', color: 'text-gray-600' },
      'color.text.primary': { color: 'text-gray-900', fill: 'text-gray-900', text: 'text-gray-900' },
      'color.text.secondary': { color: 'text-gray-500', fill: 'text-gray-500', text: 'text-gray-500' },
      'color.text.onPrimary': { color: 'text-white', text: 'text-white' },
      'color.surface.primary': { background: 'bg-white' },
      'color.surface.secondary': { background: 'bg-gray-50' },
      'color.border.primary': { border: 'border-gray-200', borderBottom: 'border-b border-gray-200' },
      'color.error': { color: 'text-red-500', background: 'bg-red-500', border: 'border-red-500' },
      'color.success': { color: 'text-green-500', background: 'bg-green-500' },
      'color.warning': { color: 'text-yellow-500', background: 'bg-yellow-500' },
    };
    return colorMap[tokenPath]?.[prop] ?? '';
  }

  // Radius tokens
  if (parts[0] === 'radius') {
    const radiusMap: Record<string, string> = {
      'radius.none': 'rounded-none', 'radius.sm': 'rounded-sm', 'radius.md': 'rounded-md',
      'radius.lg': 'rounded-lg', 'radius.xl': 'rounded-xl', 'radius.full': 'rounded-full',
    };
    return radiusMap[tokenPath] ?? '';
  }

  // Shadow tokens
  if (parts[0] === 'shadow') {
    const shadowMap: Record<string, string> = {
      'shadow.none': 'shadow-none', 'shadow.sm': 'shadow-sm', 'shadow.md': 'shadow-md',
      'shadow.lg': 'shadow-lg', 'shadow.xl': 'shadow-xl',
    };
    return shadowMap[tokenPath] ?? '';
  }

  // Spacing tokens
  if (parts[0] === 'spacing') {
    const spacingMap: Record<string, Record<string, string>> = {
      'spacing.0': { padding: 'p-0', paddingX: 'px-0', paddingY: 'py-0', gap: 'gap-0', margin: 'm-0' },
      'spacing.1': { padding: 'p-1', paddingX: 'px-1', paddingY: 'py-1', gap: 'gap-1', margin: 'm-1' },
      'spacing.2': { padding: 'p-2', paddingX: 'px-2', paddingY: 'py-2', gap: 'gap-2', margin: 'm-2' },
      'spacing.3': { padding: 'p-3', paddingX: 'px-3', paddingY: 'py-3', gap: 'gap-3', margin: 'm-3' },
      'spacing.4': { padding: 'p-4', paddingX: 'px-4', paddingY: 'py-4', gap: 'gap-4', margin: 'm-4' },
      'spacing.5': { padding: 'p-5', paddingX: 'px-5', paddingY: 'py-5', gap: 'gap-5', margin: 'm-5' },
      'spacing.6': { padding: 'p-6', paddingX: 'px-6', paddingY: 'py-6', gap: 'gap-6', margin: 'm-6' },
      'spacing.8': { padding: 'p-8', paddingX: 'px-8', paddingY: 'py-8', gap: 'gap-8', margin: 'm-8' },
      'spacing.10': { padding: 'p-10', paddingX: 'px-10', paddingY: 'py-10', gap: 'gap-10', margin: 'm-10' },
      'spacing.12': { padding: 'p-12', paddingX: 'px-12', paddingY: 'py-12', gap: 'gap-12', margin: 'm-12' },
      'spacing.16': { padding: 'p-16', paddingX: 'px-16', paddingY: 'py-16', gap: 'gap-16', margin: 'm-16' },
    };
    return spacingMap[tokenPath]?.[prop] ?? '';
  }

  // Font size tokens
  if (parts[0] === 'font' && parts[1] === 'size') {
    const sizeMap: Record<string, string> = {
      'font.size.xs': 'text-xs', 'font.size.sm': 'text-sm', 'font.size.base': 'text-base',
      'font.size.lg': 'text-lg', 'font.size.xl': 'text-xl', 'font.size.2xl': 'text-2xl',
      'font.size.3xl': 'text-3xl', 'font.size.4xl': 'text-4xl',
    };
    return sizeMap[tokenPath] ?? '';
  }

  // Font weight tokens
  if (parts[0] === 'font' && parts[1] === 'weight') {
    const weightMap: Record<string, string> = {
      'font.weight.light': 'font-light', 'font.weight.regular': 'font-normal',
      'font.weight.medium': 'font-medium', 'font.weight.semibold': 'font-semibold',
      'font.weight.bold': 'font-bold',
    };
    return weightMap[tokenPath] ?? '';
  }

  return '';
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
    const children = escapeJSX(node.props['text']);
    attrs.push(`onClick={() => { /* TODO: Add handler */ }}`);
    return `${pad}<${tag} ${attrs.join(' ')}>${children}</${tag}>`;
  }

  if (node.componentId === 'text-input') {
    attrs.push(`type="${escapeJSX(node.props['inputType'] ?? 'text')}"`);
    if (node.props['placeholder']) attrs.push(`placeholder="${escapeJSX(node.props['placeholder'])}"`);
    attrs.push(`onChange={(e) => { /* TODO: Add handler */ }}`);
    if (node.props['label']) {
      return `${pad}<label>\n${pad}  ${escapeJSX(node.props['label'])}\n${pad}  <${tag} ${attrs.join(' ')} />\n${pad}</label>`;
    }
    return `${pad}<${tag} ${attrs.join(' ')} />`;
  }

  if (node.componentId === 'image') {
    attrs.push(`src="${escapeJSX(node.props['src'])}"`);
    attrs.push(`alt="${escapeJSX(node.props['alt'])}"`);
    return `${pad}<${tag} ${attrs.join(' ')} />`;
  }

  if (node.componentId === 'heading') {
    const level = node.props['level'] ?? 'h2';
    const content = escapeJSX(node.props['content']);
    return `${pad}<${level} ${attrs.join(' ')}>${content}</${level}>`;
  }

  if (node.componentId === 'text') {
    const content = escapeJSX(node.props['content']);
    return `${pad}<${tag} ${attrs.join(' ')}>${content}</${tag}>`;
  }

  // Accessibility attributes
  if (node.accessibility.role) attrs.push(`role="${escapeJSX(node.accessibility.role)}"`);
  if (node.accessibility.label) attrs.push(`aria-label="${escapeJSX(node.accessibility.label)}"`);

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
