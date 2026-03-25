import type { ComponentDefinition } from '../../registry/ComponentDefinition';

export const HeadingDefinition: ComponentDefinition = {
  id: 'heading',
  name: 'Heading',
  description: 'A title or heading text',
  category: 'display',
  icon: 'heading',
  defaultSize: { width: 300, height: 40 },
  props: [
    { name: 'content', label: 'Text', type: 'string', defaultValue: 'Heading', required: true },
    {
      name: 'level',
      label: 'Level',
      type: 'enum',
      defaultValue: 'h2',
      options: [
        { label: 'H1 — Page Title', value: 'h1' },
        { label: 'H2 — Section', value: 'h2' },
        { label: 'H3 — Subsection', value: 'h3' },
        { label: 'H4 — Label', value: 'h4' },
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
  ],
  defaultTokens: {
    color: '{color.text.primary}',
    fontFamily: '{font.family.heading}',
    fontWeight: '{font.weight.bold}',
  },
  accessibility: {
    role: 'heading',
    requiredProps: ['content', 'level'],
    guidelines: 'Maintain heading hierarchy (H1 > H2 > H3). Do not skip levels.',
  },
  platforms: { react: true, swiftui: true, compose: true, flutter: true, html: true },
};
