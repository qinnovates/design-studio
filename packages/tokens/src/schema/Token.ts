export type TokenType =
  | 'color'
  | 'typography'
  | 'spacing'
  | 'shadow'
  | 'border'
  | 'opacity'
  | 'duration'
  | 'radius'
  | 'fontFamily'
  | 'fontSize'
  | 'fontWeight'
  | 'lineHeight';

export interface Token {
  /** Dot-path name, e.g. "color.primary.500" */
  name: string;
  /** Raw value or alias reference like "{color.blue.600}" */
  value: string;
  type: TokenType;
  description?: string;
}

export interface TokenSet {
  id: string;
  name: string;
  tokens: Record<string, Token>;
}

/** Check if a value is a token alias reference */
export function isAlias(value: string): boolean {
  return value.startsWith('{') && value.endsWith('}');
}

/** Extract the referenced token path from an alias */
export function resolveAliasPath(alias: string): string {
  return alias.slice(1, -1);
}
