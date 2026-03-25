import type { ComponentDefinition } from '../../registry/ComponentDefinition';

export const ImageDefinition: ComponentDefinition = {
  id: 'image',
  name: 'Image',
  description: 'A picture or graphic',
  category: 'display',
  icon: 'image',
  defaultSize: { width: 300, height: 200 },
  props: [
    { name: 'src', label: 'Image URL', type: 'string', defaultValue: '', required: true },
    { name: 'alt', label: 'Description (for screen readers)', type: 'string', defaultValue: '', required: true },
    {
      name: 'fit',
      label: 'Fit',
      type: 'enum',
      defaultValue: 'cover',
      options: [
        { label: 'Cover (fill, may crop)', value: 'cover' },
        { label: 'Contain (fit inside)', value: 'contain' },
        { label: 'Stretch', value: 'fill' },
      ],
    },
  ],
  slots: [],
  variants: [
    { name: 'default', label: 'Default', tokenOverrides: {} },
    { name: 'rounded', label: 'Rounded', tokenOverrides: { cornerRadius: '{radius.lg}' } },
    { name: 'circle', label: 'Circle', tokenOverrides: { cornerRadius: '50%' } },
  ],
  defaultTokens: {
    cornerRadius: '{radius.none}',
  },
  accessibility: {
    role: 'img',
    requiredProps: ['alt'],
    guidelines: 'Every image needs a description for screen readers. If decorative, set alt to empty string.',
  },
  platforms: { react: true, swiftui: true, compose: true, flutter: true, html: true },
};
