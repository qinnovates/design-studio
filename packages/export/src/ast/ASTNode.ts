// ─── Platform-Neutral AST ────────────────────────────────────

export type ASTNodeType =
  | 'root'
  | 'component'
  | 'text'
  | 'image'
  | 'container'
  | 'slot';

export interface StyleDeclaration {
  property: string;
  /** Raw value or token reference like "{spacing.4}" */
  value: string;
  /** Whether this value references a design token */
  isToken: boolean;
}

export interface ASTNode {
  type: ASTNodeType;
  /** Component type ID (e.g., "button", "card") */
  componentId?: string;
  /** Component variant */
  variant?: string;
  /** Props to pass through */
  props: Record<string, unknown>;
  /** Style declarations */
  styles: StyleDeclaration[];
  /** Child nodes */
  children: ASTNode[];
  /** Accessibility attributes */
  accessibility: {
    role?: string;
    label?: string;
    [key: string]: unknown;
  };
}

export function createRootNode(children: ASTNode[] = []): ASTNode {
  return {
    type: 'root',
    props: {},
    styles: [],
    children,
    accessibility: {},
  };
}

export function createComponentASTNode(
  componentId: string,
  props: Record<string, unknown> = {},
  styles: StyleDeclaration[] = [],
  children: ASTNode[] = [],
): ASTNode {
  return {
    type: 'component',
    componentId,
    props,
    styles,
    children,
    accessibility: {},
  };
}
