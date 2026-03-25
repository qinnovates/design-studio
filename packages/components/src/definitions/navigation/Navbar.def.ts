import type { ComponentDefinition } from '../../registry/ComponentDefinition';

export const NavbarDefinition: ComponentDefinition = {
  id: 'navbar',
  name: 'Navigation Bar',
  description: 'A top bar with logo, links, and actions',
  category: 'navigation',
  icon: 'panel-top',
  defaultSize: { width: 1200, height: 64 },
  props: [
    { name: 'brandText', label: 'Brand Name', type: 'string', defaultValue: 'My App' },
    { name: 'sticky', label: 'Stick to Top', type: 'boolean', defaultValue: true },
  ],
  slots: [
    { name: 'left', label: 'Left (Logo/Brand)', accepts: ['text', 'image', 'heading'], maxChildren: 2 },
    { name: 'center', label: 'Center (Links)', accepts: ['link', 'text'], maxChildren: 6 },
    { name: 'right', label: 'Right (Actions)', accepts: ['button', 'avatar', 'link'], maxChildren: 3 },
  ],
  variants: [
    { name: 'default', label: 'Default', tokenOverrides: {} },
    { name: 'transparent', label: 'Transparent', tokenOverrides: { background: 'transparent' } },
    { name: 'bordered', label: 'Bordered', tokenOverrides: { borderBottom: '{color.border.primary}' } },
  ],
  defaultTokens: {
    background: '{color.surface.primary}',
    paddingX: '{spacing.6}',
    paddingY: '{spacing.3}',
    shadow: '{shadow.sm}',
  },
  accessibility: {
    role: 'navigation',
    requiredProps: [],
    guidelines: 'Navigation bars should use the <nav> element. Include skip-to-content link for keyboard users.',
  },
  platforms: { react: true, swiftui: true, compose: true, flutter: true, html: true },
};
