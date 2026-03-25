import type { ComponentDefinition } from '../../registry/ComponentDefinition';

export const CardDefinition: ComponentDefinition = {
  id: 'card',
  name: 'Card',
  description: 'A container that groups related content with a border and shadow',
  category: 'display',
  icon: 'square',
  defaultSize: { width: 320, height: 200 },
  props: [
    { name: 'title', label: 'Title', type: 'string', defaultValue: '' },
    { name: 'elevated', label: 'Show Shadow', type: 'boolean', defaultValue: true },
    {
      name: 'padding',
      label: 'Inner Spacing',
      type: 'enum',
      defaultValue: 'medium',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
      ],
    },
  ],
  slots: [
    { name: 'content', label: 'Content', accepts: ['*'], maxChildren: null },
    { name: 'header', label: 'Header', accepts: ['text', 'heading', 'image'], maxChildren: 3 },
    { name: 'footer', label: 'Footer', accepts: ['button', 'link', 'text'], maxChildren: 3 },
  ],
  variants: [
    {
      name: 'default',
      label: 'Default',
      tokenOverrides: {},
    },
    {
      name: 'outlined',
      label: 'Outlined',
      tokenOverrides: { shadow: 'none', border: '{color.border.primary}' },
    },
  ],
  defaultTokens: {
    background: '{color.surface.primary}',
    cornerRadius: '{radius.lg}',
    shadow: '{shadow.md}',
    padding: '{spacing.4}',
    border: 'none',
  },
  accessibility: {
    role: 'article',
    requiredProps: [],
    guidelines: 'Cards should have a clear heading or purpose. Use semantic grouping for screen readers.',
  },
  platforms: { react: true, swiftui: true, compose: true, flutter: true, html: true },
};
