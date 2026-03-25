import type { ComponentDefinition } from '../../registry/ComponentDefinition';

export const TextInputDefinition: ComponentDefinition = {
  id: 'text-input',
  name: 'Text Input',
  description: 'A text field where users can type information',
  category: 'input',
  icon: 'text-cursor-input',
  defaultSize: { width: 280, height: 44 },
  props: [
    { name: 'label', label: 'Label', type: 'string', defaultValue: 'Label', required: true },
    { name: 'placeholder', label: 'Placeholder', type: 'string', defaultValue: 'Enter text...' },
    { name: 'helperText', label: 'Helper Text', type: 'string', defaultValue: '' },
    {
      name: 'inputType',
      label: 'Input Type',
      type: 'enum',
      defaultValue: 'text',
      options: [
        { label: 'Text', value: 'text' },
        { label: 'Email', value: 'email' },
        { label: 'Password', value: 'password' },
        { label: 'Number', value: 'number' },
        { label: 'Phone', value: 'tel' },
        { label: 'URL', value: 'url' },
      ],
    },
    { name: 'required', label: 'Required', type: 'boolean', defaultValue: false },
    { name: 'disabled', label: 'Disabled', type: 'boolean', defaultValue: false },
  ],
  slots: [],
  variants: [
    {
      name: 'default',
      label: 'Default',
      tokenOverrides: { border: '{color.border.primary}' },
    },
    {
      name: 'filled',
      label: 'Filled',
      tokenOverrides: { background: '{color.surface.secondary}', border: 'none' },
    },
  ],
  defaultTokens: {
    background: '{color.surface.primary}',
    border: '{color.border.primary}',
    text: '{color.text.primary}',
    cornerRadius: '{radius.md}',
    paddingX: '{spacing.3}',
    paddingY: '{spacing.2}',
    fontSize: '{font.size.sm}',
    labelColor: '{color.text.secondary}',
  },
  accessibility: {
    role: 'textbox',
    requiredProps: ['label'],
    guidelines: 'Every text input needs a visible label. Placeholder text is not a substitute for a label.',
  },
  platforms: { react: true, swiftui: true, compose: true, flutter: true, html: true },
};
