import type { ComponentDefinition } from '../../registry/ComponentDefinition';

export const ButtonDefinition: ComponentDefinition = {
  id: 'button',
  name: 'Button',
  description: 'A clickable button that triggers an action',
  category: 'input',
  icon: 'mouse-pointer-click',
  defaultSize: { width: 120, height: 44 },
  props: [
    {
      name: 'text',
      label: 'Button Text',
      type: 'string',
      defaultValue: 'Click me',
      required: true,
    },
    {
      name: 'icon',
      label: 'Icon',
      type: 'icon',
      defaultValue: null,
      description: 'Optional icon shown before the text',
    },
    {
      name: 'disabled',
      label: 'Disabled',
      type: 'boolean',
      defaultValue: false,
    },
    {
      name: 'fullWidth',
      label: 'Full Width',
      type: 'boolean',
      defaultValue: false,
      description: 'Stretch to fill the container width',
    },
    {
      name: 'size',
      label: 'Size',
      type: 'enum',
      defaultValue: 'medium',
      options: [
        { label: 'Small', value: 'small' },
        { label: 'Medium', value: 'medium' },
        { label: 'Large', value: 'large' },
      ],
    },
  ],
  slots: [],
  variants: [
    {
      name: 'primary',
      label: 'Primary',
      tokenOverrides: {
        'background': '{color.action.primary}',
        'text': '{color.text.onPrimary}',
        'border': 'none',
      },
    },
    {
      name: 'secondary',
      label: 'Secondary',
      tokenOverrides: {
        'background': '{color.action.secondary}',
        'text': '{color.text.primary}',
        'border': 'none',
      },
    },
    {
      name: 'outline',
      label: 'Outline',
      tokenOverrides: {
        'background': 'transparent',
        'text': '{color.action.primary}',
        'border': '{color.action.primary}',
      },
    },
    {
      name: 'ghost',
      label: 'Ghost',
      tokenOverrides: {
        'background': 'transparent',
        'text': '{color.action.primary}',
        'border': 'none',
      },
    },
  ],
  defaultTokens: {
    'background': '{color.action.primary}',
    'text': '{color.text.onPrimary}',
    'cornerRadius': '{radius.md}',
    'paddingX': '{spacing.4}',
    'paddingY': '{spacing.2}',
    'fontSize': '{font.size.sm}',
    'fontWeight': '{font.weight.medium}',
  },
  accessibility: {
    role: 'button',
    requiredProps: ['text'],
    guidelines: 'Buttons need descriptive text. Avoid vague labels like "Click here". Use action verbs like "Save", "Delete", "Submit".',
  },
  platforms: {
    react: true,
    swiftui: true,
    compose: true,
    flutter: true,
    html: true,
  },
};
