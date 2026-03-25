import type { TokenSet } from '../schema/Token';

export const defaultLightTokens: TokenSet = {
  id: 'default-light',
  name: 'Light',
  tokens: {
    // ── Primitive Colors ──────────────────────
    'color.white': { name: 'color.white', value: '#ffffff', type: 'color' },
    'color.black': { name: 'color.black', value: '#0a0a0a', type: 'color' },
    'color.blue.50': { name: 'color.blue.50', value: '#eff6ff', type: 'color' },
    'color.blue.100': { name: 'color.blue.100', value: '#dbeafe', type: 'color' },
    'color.blue.500': { name: 'color.blue.500', value: '#3b82f6', type: 'color' },
    'color.blue.600': { name: 'color.blue.600', value: '#2563eb', type: 'color' },
    'color.blue.700': { name: 'color.blue.700', value: '#1d4ed8', type: 'color' },
    'color.gray.50': { name: 'color.gray.50', value: '#f9fafb', type: 'color' },
    'color.gray.100': { name: 'color.gray.100', value: '#f3f4f6', type: 'color' },
    'color.gray.200': { name: 'color.gray.200', value: '#e5e7eb', type: 'color' },
    'color.gray.300': { name: 'color.gray.300', value: '#d1d5db', type: 'color' },
    'color.gray.400': { name: 'color.gray.400', value: '#9ca3af', type: 'color' },
    'color.gray.500': { name: 'color.gray.500', value: '#6b7280', type: 'color' },
    'color.gray.600': { name: 'color.gray.600', value: '#4b5563', type: 'color' },
    'color.gray.700': { name: 'color.gray.700', value: '#374151', type: 'color' },
    'color.gray.800': { name: 'color.gray.800', value: '#1f2937', type: 'color' },
    'color.gray.900': { name: 'color.gray.900', value: '#111827', type: 'color' },
    'color.red.500': { name: 'color.red.500', value: '#ef4444', type: 'color' },
    'color.green.500': { name: 'color.green.500', value: '#22c55e', type: 'color' },
    'color.yellow.500': { name: 'color.yellow.500', value: '#eab308', type: 'color' },

    // ── Semantic Colors (aliases) ─────────────
    'color.text.primary': { name: 'color.text.primary', value: '{color.gray.900}', type: 'color', description: 'Main text color' },
    'color.text.secondary': { name: 'color.text.secondary', value: '{color.gray.500}', type: 'color', description: 'Secondary/muted text' },
    'color.text.onPrimary': { name: 'color.text.onPrimary', value: '{color.white}', type: 'color', description: 'Text on primary-colored backgrounds' },
    'color.surface.primary': { name: 'color.surface.primary', value: '{color.white}', type: 'color', description: 'Main background' },
    'color.surface.secondary': { name: 'color.surface.secondary', value: '{color.gray.50}', type: 'color', description: 'Secondary background' },
    'color.action.primary': { name: 'color.action.primary', value: '{color.blue.600}', type: 'color', description: 'Primary action color (buttons, links)' },
    'color.action.secondary': { name: 'color.action.secondary', value: '{color.gray.100}', type: 'color', description: 'Secondary action color' },
    'color.border.primary': { name: 'color.border.primary', value: '{color.gray.200}', type: 'color', description: 'Default border color' },
    'color.error': { name: 'color.error', value: '{color.red.500}', type: 'color' },
    'color.success': { name: 'color.success', value: '{color.green.500}', type: 'color' },
    'color.warning': { name: 'color.warning', value: '{color.yellow.500}', type: 'color' },

    // ── Typography ────────────────────────────
    'font.family.body': { name: 'font.family.body', value: 'Inter, system-ui, sans-serif', type: 'fontFamily' },
    'font.family.heading': { name: 'font.family.heading', value: 'Inter, system-ui, sans-serif', type: 'fontFamily' },
    'font.family.mono': { name: 'font.family.mono', value: 'JetBrains Mono, monospace', type: 'fontFamily' },
    'font.size.xs': { name: 'font.size.xs', value: '12px', type: 'fontSize' },
    'font.size.sm': { name: 'font.size.sm', value: '14px', type: 'fontSize' },
    'font.size.base': { name: 'font.size.base', value: '16px', type: 'fontSize' },
    'font.size.lg': { name: 'font.size.lg', value: '18px', type: 'fontSize' },
    'font.size.xl': { name: 'font.size.xl', value: '20px', type: 'fontSize' },
    'font.size.2xl': { name: 'font.size.2xl', value: '24px', type: 'fontSize' },
    'font.size.3xl': { name: 'font.size.3xl', value: '30px', type: 'fontSize' },
    'font.size.4xl': { name: 'font.size.4xl', value: '36px', type: 'fontSize' },
    'font.weight.light': { name: 'font.weight.light', value: '300', type: 'fontWeight' },
    'font.weight.regular': { name: 'font.weight.regular', value: '400', type: 'fontWeight' },
    'font.weight.medium': { name: 'font.weight.medium', value: '500', type: 'fontWeight' },
    'font.weight.semibold': { name: 'font.weight.semibold', value: '600', type: 'fontWeight' },
    'font.weight.bold': { name: 'font.weight.bold', value: '700', type: 'fontWeight' },
    'font.lineHeight.tight': { name: 'font.lineHeight.tight', value: '1.25', type: 'lineHeight' },
    'font.lineHeight.normal': { name: 'font.lineHeight.normal', value: '1.5', type: 'lineHeight' },
    'font.lineHeight.relaxed': { name: 'font.lineHeight.relaxed', value: '1.75', type: 'lineHeight' },

    // ── Spacing ───────────────────────────────
    'spacing.0': { name: 'spacing.0', value: '0px', type: 'spacing' },
    'spacing.1': { name: 'spacing.1', value: '4px', type: 'spacing' },
    'spacing.2': { name: 'spacing.2', value: '8px', type: 'spacing' },
    'spacing.3': { name: 'spacing.3', value: '12px', type: 'spacing' },
    'spacing.4': { name: 'spacing.4', value: '16px', type: 'spacing' },
    'spacing.5': { name: 'spacing.5', value: '20px', type: 'spacing' },
    'spacing.6': { name: 'spacing.6', value: '24px', type: 'spacing' },
    'spacing.8': { name: 'spacing.8', value: '32px', type: 'spacing' },
    'spacing.10': { name: 'spacing.10', value: '40px', type: 'spacing' },
    'spacing.12': { name: 'spacing.12', value: '48px', type: 'spacing' },
    'spacing.16': { name: 'spacing.16', value: '64px', type: 'spacing' },

    // ── Radius ────────────────────────────────
    'radius.none': { name: 'radius.none', value: '0px', type: 'radius' },
    'radius.sm': { name: 'radius.sm', value: '4px', type: 'radius' },
    'radius.md': { name: 'radius.md', value: '8px', type: 'radius' },
    'radius.lg': { name: 'radius.lg', value: '12px', type: 'radius' },
    'radius.xl': { name: 'radius.xl', value: '16px', type: 'radius' },
    'radius.full': { name: 'radius.full', value: '9999px', type: 'radius' },

    // ── Shadows ───────────────────────────────
    'shadow.none': { name: 'shadow.none', value: 'none', type: 'shadow' },
    'shadow.sm': { name: 'shadow.sm', value: '0 1px 2px 0 rgba(0,0,0,0.05)', type: 'shadow' },
    'shadow.md': { name: 'shadow.md', value: '0 4px 6px -1px rgba(0,0,0,0.1)', type: 'shadow' },
    'shadow.lg': { name: 'shadow.lg', value: '0 10px 15px -3px rgba(0,0,0,0.1)', type: 'shadow' },
    'shadow.xl': { name: 'shadow.xl', value: '0 20px 25px -5px rgba(0,0,0,0.1)', type: 'shadow' },
  },
};

export const defaultDarkTokens: TokenSet = {
  id: 'default-dark',
  name: 'Dark',
  tokens: {
    // Primitives are inherited from light. Dark only overrides semantic tokens.
    ...defaultLightTokens.tokens,

    // ── Override Semantic Colors for Dark Mode ─
    'color.text.primary': { name: 'color.text.primary', value: '{color.gray.50}', type: 'color', description: 'Main text color' },
    'color.text.secondary': { name: 'color.text.secondary', value: '{color.gray.400}', type: 'color', description: 'Secondary/muted text' },
    'color.text.onPrimary': { name: 'color.text.onPrimary', value: '{color.white}', type: 'color', description: 'Text on primary-colored backgrounds' },
    'color.surface.primary': { name: 'color.surface.primary', value: '{color.gray.900}', type: 'color', description: 'Main background' },
    'color.surface.secondary': { name: 'color.surface.secondary', value: '{color.gray.800}', type: 'color', description: 'Secondary background' },
    'color.action.primary': { name: 'color.action.primary', value: '{color.blue.500}', type: 'color', description: 'Primary action color' },
    'color.action.secondary': { name: 'color.action.secondary', value: '{color.gray.700}', type: 'color', description: 'Secondary action color' },
    'color.border.primary': { name: 'color.border.primary', value: '{color.gray.700}', type: 'color', description: 'Default border color' },

    // ── Shadows (darker in dark mode) ─────────
    'shadow.sm': { name: 'shadow.sm', value: '0 1px 2px 0 rgba(0,0,0,0.3)', type: 'shadow' },
    'shadow.md': { name: 'shadow.md', value: '0 4px 6px -1px rgba(0,0,0,0.4)', type: 'shadow' },
    'shadow.lg': { name: 'shadow.lg', value: '0 10px 15px -3px rgba(0,0,0,0.5)', type: 'shadow' },
    'shadow.xl': { name: 'shadow.xl', value: '0 20px 25px -5px rgba(0,0,0,0.5)', type: 'shadow' },
  },
};
