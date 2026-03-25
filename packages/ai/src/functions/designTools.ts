import type { ToolDefinition } from '../providers/ProviderInterface';

/** Tools the AI can call to manipulate the design canvas */
export const DESIGN_TOOLS: ToolDefinition[] = [
  {
    name: 'add_component',
    description: 'Add a UI component to the canvas. Use this when the user asks to add buttons, inputs, cards, text, images, navigation, etc.',
    parameters: [
      { name: 'componentId', type: 'string', description: 'Component type: button, text-input, card, text, heading, image, container, navbar, alert', required: true },
      { name: 'name', type: 'string', description: 'Display name for this component instance', required: true },
      { name: 'x', type: 'number', description: 'X position on canvas', required: true },
      { name: 'y', type: 'number', description: 'Y position on canvas', required: true },
      { name: 'width', type: 'number', description: 'Width in pixels', required: false },
      { name: 'height', type: 'number', description: 'Height in pixels', required: false },
      { name: 'variant', type: 'string', description: 'Visual variant: primary, secondary, outline, ghost', required: false },
      { name: 'props', type: 'object', description: 'Component-specific props like { text: "Click me", size: "large" }', required: false },
    ],
  },
  {
    name: 'add_text',
    description: 'Add a text element to the canvas',
    parameters: [
      { name: 'content', type: 'string', description: 'The text content', required: true },
      { name: 'x', type: 'number', description: 'X position', required: true },
      { name: 'y', type: 'number', description: 'Y position', required: true },
      { name: 'fontSize', type: 'number', description: 'Font size in pixels', required: false },
      { name: 'fontWeight', type: 'number', description: 'Font weight (400=regular, 600=semibold, 700=bold)', required: false },
      { name: 'textAlign', type: 'string', description: 'Text alignment: left, center, right', required: false },
      { name: 'width', type: 'number', description: 'Text box width', required: false },
    ],
  },
  {
    name: 'add_frame',
    description: 'Add a frame/artboard that contains other elements',
    parameters: [
      { name: 'name', type: 'string', description: 'Frame name', required: true },
      { name: 'x', type: 'number', description: 'X position', required: true },
      { name: 'y', type: 'number', description: 'Y position', required: true },
      { name: 'width', type: 'number', description: 'Frame width', required: true },
      { name: 'height', type: 'number', description: 'Frame height', required: true },
      { name: 'fill', type: 'string', description: 'Background color token like {color.surface.primary}', required: false },
    ],
  },
  {
    name: 'modify_element',
    description: 'Change properties of an existing element on the canvas',
    parameters: [
      { name: 'nodeId', type: 'string', description: 'The ID of the element to modify', required: true },
      { name: 'updates', type: 'object', description: 'Properties to update: { x, y, width, height, opacity, name, fill, variant, props, tokenBindings }', required: true },
    ],
  },
  {
    name: 'remove_element',
    description: 'Remove an element from the canvas',
    parameters: [
      { name: 'nodeId', type: 'string', description: 'The ID of the element to remove', required: true },
    ],
  },
  {
    name: 'update_token',
    description: 'Change a design token value (color, spacing, font, etc.)',
    parameters: [
      { name: 'tokenName', type: 'string', description: 'Token path like color.action.primary, spacing.4, font.size.base', required: true },
      { name: 'value', type: 'string', description: 'New value like #3b82f6, 16px, 600', required: true },
    ],
  },
  {
    name: 'suggest_layout',
    description: 'Explain a layout suggestion to the user without making changes. Use this when advising on design improvements.',
    parameters: [
      { name: 'suggestion', type: 'string', description: 'The design suggestion in plain English', required: true },
      { name: 'reason', type: 'string', description: 'Why this change would improve the design', required: true },
    ],
  },
];
