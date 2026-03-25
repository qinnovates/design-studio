// ─── Types ───────────────────────────────────────────────────

export type ComponentCategory =
  | 'layout'
  | 'input'
  | 'display'
  | 'navigation'
  | 'feedback'
  | 'data';

export type PropType = 'string' | 'number' | 'boolean' | 'enum' | 'color' | 'icon';

export interface PropDefinition {
  name: string;
  /** Plain English label shown in inspector */
  label: string;
  type: PropType;
  defaultValue: unknown;
  /** For enum type */
  options?: { label: string; value: string }[];
  /** Help text shown on hover */
  description?: string;
  required?: boolean;
}

export interface SlotDefinition {
  name: string;
  label: string;
  /** Accepted node types */
  accepts: string[];
  /** Max children (null = unlimited) */
  maxChildren: number | null;
}

export interface VariantDefinition {
  name: string;
  label: string;
  /** Token overrides applied when this variant is selected */
  tokenOverrides: Record<string, string>;
}

export interface PlatformSupport {
  react: boolean;
  swiftui: boolean;
  compose: boolean;
  flutter: boolean;
  html: boolean;
}

export interface AccessibilitySpec {
  role: string;
  requiredProps: string[];
  /** Plain English guideline */
  guidelines: string;
}

export interface ComponentDefinition {
  id: string;
  name: string;
  description: string;
  category: ComponentCategory;
  icon: string;
  defaultSize: { width: number; height: number };
  props: PropDefinition[];
  slots: SlotDefinition[];
  variants: VariantDefinition[];
  defaultTokens: Record<string, string>;
  accessibility: AccessibilitySpec;
  platforms: PlatformSupport;
}
