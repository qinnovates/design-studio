import type { ComponentDefinition } from '../../registry/ComponentDefinition';

export const AlertDefinition: ComponentDefinition = {
  id: 'alert',
  name: 'Alert',
  description: 'A message box that shows important information',
  category: 'feedback',
  icon: 'alert-circle',
  defaultSize: { width: 400, height: 56 },
  props: [
    { name: 'message', label: 'Message', type: 'string', defaultValue: 'This is an alert', required: true },
    {
      name: 'severity',
      label: 'Type',
      type: 'enum',
      defaultValue: 'info',
      options: [
        { label: 'Info', value: 'info' },
        { label: 'Success', value: 'success' },
        { label: 'Warning', value: 'warning' },
        { label: 'Error', value: 'error' },
      ],
    },
    { name: 'dismissible', label: 'Can Dismiss', type: 'boolean', defaultValue: false },
  ],
  slots: [],
  variants: [
    { name: 'filled', label: 'Filled', tokenOverrides: {} },
    { name: 'outlined', label: 'Outlined', tokenOverrides: { background: 'transparent' } },
  ],
  defaultTokens: {
    cornerRadius: '{radius.md}',
    padding: '{spacing.3}',
    fontSize: '{font.size.sm}',
  },
  accessibility: {
    role: 'alert',
    requiredProps: ['message'],
    guidelines: 'Alerts should be announced by screen readers. Use role="alert" for important messages.',
  },
  platforms: { react: true, swiftui: true, compose: true, flutter: true, html: true },
};
