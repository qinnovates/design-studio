import type { ComponentDefinition } from '../../registry/ComponentDefinition';

export const ContainerDefinition: ComponentDefinition = {
  id: 'container',
  name: 'Container',
  description: 'A box that holds other elements',
  category: 'layout',
  icon: 'box',
  defaultSize: { width: 400, height: 300 },
  props: [
    {
      name: 'direction',
      label: 'Direction',
      type: 'enum',
      defaultValue: 'vertical',
      options: [
        { label: 'Vertical (top to bottom)', value: 'vertical' },
        { label: 'Horizontal (left to right)', value: 'horizontal' },
      ],
    },
    {
      name: 'gap',
      label: 'Gap Between Items',
      type: 'enum',
      defaultValue: 'medium',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
      ],
    },
    {
      name: 'align',
      label: 'Alignment',
      type: 'enum',
      defaultValue: 'start',
      options: [
        { label: 'Start', value: 'start' },
        { label: 'Center', value: 'center' },
        { label: 'End', value: 'end' },
        { label: 'Stretch', value: 'stretch' },
      ],
    },
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
    { name: 'children', label: 'Content', accepts: ['*'], maxChildren: null },
  ],
  variants: [
    { name: 'default', label: 'Default', tokenOverrides: {} },
    { name: 'card', label: 'Card Style', tokenOverrides: { background: '{color.surface.primary}', shadow: '{shadow.sm}', cornerRadius: '{radius.lg}' } },
  ],
  defaultTokens: {
    background: 'transparent',
    padding: '{spacing.4}',
    gap: '{spacing.3}',
    cornerRadius: '{radius.none}',
  },
  accessibility: {
    role: 'group',
    requiredProps: [],
    guidelines: 'Containers provide visual grouping. Use sparingly to avoid excessive nesting.',
  },
  platforms: { react: true, swiftui: true, compose: true, flutter: true, html: true },
};
