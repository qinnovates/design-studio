import type { ComponentDefinition } from '../../registry/ComponentDefinition';

export const TextDefinition: ComponentDefinition = {
  id: 'text',
  name: 'Text',
  description: 'A block of text content',
  category: 'display',
  icon: 'type',
  defaultSize: { width: 200, height: 24 },
  props: [
    { name: 'content', label: 'Text', type: 'string', defaultValue: 'Hello, World!', required: true },
    {
      name: 'size',
      label: 'Size',
      type: 'enum',
      defaultValue: 'body',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Body', value: 'body' },
        { label: 'Large', value: 'large' },
      ],
    },
    {
      name: 'weight',
      label: 'Weight',
      type: 'enum',
      defaultValue: 'regular',
      options: [
        { label: 'Light', value: 'light' },
        { label: 'Regular', value: 'regular' },
        { label: 'Medium', value: 'medium' },
        { label: 'Bold', value: 'bold' },
      ],
    },
    {
      name: 'align',
      label: 'Alignment',
      type: 'enum',
      defaultValue: 'left',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
  ],
  slots: [],
  variants: [
    { name: 'default', label: 'Default', tokenOverrides: {} },
    { name: 'muted', label: 'Muted', tokenOverrides: { color: '{color.text.secondary}' } },
    { name: 'accent', label: 'Accent', tokenOverrides: { color: '{color.action.primary}' } },
  ],
  defaultTokens: {
    color: '{color.text.primary}',
    fontFamily: '{font.family.body}',
    fontSize: '{font.size.base}',
    lineHeight: '{font.lineHeight.normal}',
  },
  accessibility: {
    role: 'paragraph',
    requiredProps: ['content'],
    guidelines: 'Use appropriate text size for readability. Minimum 16px for body text.',
  },
  platforms: { react: true, swiftui: true, compose: true, flutter: true, html: true },
};
