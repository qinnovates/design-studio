import type { TokenResolver } from '../resolver/TokenResolver';

/** Convert resolved tokens to CSS custom properties */
export function toCssVariables(resolver: TokenResolver): string {
  const resolved = resolver.resolveAll();
  const lines: string[] = [':root {'];

  const sortedKeys = Object.keys(resolved).sort();
  for (const name of sortedKeys) {
    const cssName = `--${name.replace(/\./g, '-')}`;
    lines.push(`  ${cssName}: ${resolved[name]};`);
  }

  lines.push('}');
  return lines.join('\n');
}

/** Convert resolved tokens to a flat Record for inline use */
export function toCssVariableMap(resolver: TokenResolver): Record<string, string> {
  const resolved = resolver.resolveAll();
  const map: Record<string, string> = {};
  for (const [name, value] of Object.entries(resolved)) {
    map[`--${name.replace(/\./g, '-')}`] = value;
  }
  return map;
}
