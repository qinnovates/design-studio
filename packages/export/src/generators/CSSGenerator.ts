import type { ASTNode, StyleDeclaration } from '../ast/ASTNode';
import type { GeneratorOutput, Generator } from '../pipeline/ExportPipeline';

/** Generates a standalone CSS file with custom properties from token references */
export class CSSGenerator implements Generator {
  name = 'CSS Variables';
  platform = 'css';

  generate(ast: ASTNode): GeneratorOutput[] {
    const tokens = new Set<string>();
    this.collectTokens(ast, tokens);

    const lines = [
      '/* Design Studio — Generated CSS Variables */',
      '/* Edit these values to customize your design system */',
      '',
      ':root {',
    ];

    for (const token of Array.from(tokens).sort()) {
      const cssVar = `--${token.replace(/\./g, '-')}`;
      lines.push(`  ${cssVar}: var(--ds-${token.replace(/\./g, '-')});`);
    }

    lines.push('}');
    lines.push('');
    lines.push('/* Component styles */');
    this.generateComponentStyles(ast, lines, '');

    return [
      { filename: 'design-tokens.css', content: lines.join('\n'), language: 'css' },
    ];
  }

  private collectTokens(node: ASTNode, tokens: Set<string>): void {
    for (const style of node.styles) {
      if (style.isToken) {
        tokens.add(style.value.replace(/^\{|\}$/g, ''));
      }
    }
    for (const child of node.children) {
      this.collectTokens(child, tokens);
    }
  }

  private generateComponentStyles(node: ASTNode, lines: string[], selector: string): void {
    if (node.componentId && node.styles.length > 0) {
      const className = `.ds-${node.componentId}`;
      lines.push(`${className} {`);
      for (const style of node.styles) {
        const cssProperty = this.toCSSProperty(style.property);
        const cssValue = style.isToken
          ? `var(--${style.value.replace(/^\{|\}$/g, '').replace(/\./g, '-')})`
          : style.value;
        lines.push(`  ${cssProperty}: ${cssValue};`);
      }
      lines.push('}');
      lines.push('');
    }
    for (const child of node.children) {
      this.generateComponentStyles(child, lines, selector);
    }
  }

  private toCSSProperty(prop: string): string {
    const map: Record<string, string> = {
      background: 'background-color',
      text: 'color',
      fill: 'background-color',
      cornerRadius: 'border-radius',
      shadow: 'box-shadow',
      padding: 'padding',
      paddingX: 'padding-inline',
      paddingY: 'padding-block',
      gap: 'gap',
      fontSize: 'font-size',
      fontWeight: 'font-weight',
      lineHeight: 'line-height',
      letterSpacing: 'letter-spacing',
      border: 'border',
    };
    return map[prop] ?? prop.replace(/([A-Z])/g, '-$1').toLowerCase();
  }
}
