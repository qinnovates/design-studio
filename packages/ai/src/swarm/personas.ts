import type { DesignPersona } from './types';

export const DESIGN_PERSONAS: DesignPersona[] = [
  {
    id: 'minimalist',
    name: 'Dieter',
    avatar: '\u{25CB}',
    philosophy: 'Less, but better. Good design is as little design as possible.',
    styleKeywords: ['clean', 'whitespace', 'restrained', 'elegant'],
    density: 'spacious',
    colorTemperature: 'cool',
    source: 'built-in',
    inspiredBy: 'Dieter Rams',
    inspiredByEra: '1932-present',
    inspiredByReason: 'His 10 principles of good design shaped modern minimalism at Braun and influenced Apple.',
  },
  {
    id: 'bold',
    name: 'Da Vinci',
    avatar: '\u{25C6}',
    philosophy: 'Simplicity is the ultimate sophistication, but boldness captures the soul.',
    styleKeywords: ['vibrant', 'high-contrast', 'dramatic', 'impactful'],
    density: 'compact',
    colorTemperature: 'warm',
    source: 'built-in',
    inspiredBy: 'Leonardo da Vinci',
    inspiredByEra: '1452-1519',
    inspiredByReason: 'Merged art and engineering into singular vision. The original polymath who saw no boundary between beauty and function.',
  },
  {
    id: 'accessible',
    name: 'Braille',
    avatar: '\u{267F}',
    philosophy: 'Design for everyone. What is essential must be accessible to all.',
    styleKeywords: ['inclusive', 'readable', 'structured', 'clear'],
    density: 'balanced',
    colorTemperature: 'neutral',
    source: 'built-in',
    inspiredBy: 'Louis Braille',
    inspiredByEra: '1809-1852',
    inspiredByReason: 'At 15, invented a system that gave millions access to written language. Proved that the best design removes barriers.',
  },
  {
    id: 'editorial',
    name: 'Gutenberg',
    avatar: '\u{2726}',
    philosophy: 'Typography is the voice of the page. Let the content breathe and the hierarchy lead.',
    styleKeywords: ['typographic', 'editorial', 'refined', 'literary'],
    density: 'spacious',
    colorTemperature: 'warm',
    source: 'built-in',
    inspiredBy: 'Johannes Gutenberg',
    inspiredByEra: '1400-1468',
    inspiredByReason: 'His printing press democratized knowledge. Typography went from craft to communication at scale.',
  },
  {
    id: 'playful',
    name: 'Haring',
    avatar: '\u{273F}',
    philosophy: 'Art is for everybody. Design should bring joy and make people smile.',
    styleKeywords: ['colorful', 'rounded', 'friendly', 'whimsical'],
    density: 'balanced',
    colorTemperature: 'warm',
    source: 'built-in',
    inspiredBy: 'Keith Haring',
    inspiredByEra: '1958-1990',
    inspiredByReason: 'Turned public spaces into galleries with radiant, accessible art. Believed creativity should never be exclusive.',
  },
  {
    id: 'brutalist',
    name: 'Corbusier',
    avatar: '\u{25A6}',
    philosophy: 'A house is a machine for living in. Raw structure over decoration. Function is beauty.',
    styleKeywords: ['raw', 'structural', 'monospace', 'grid-heavy'],
    density: 'compact',
    colorTemperature: 'cool',
    source: 'built-in',
    inspiredBy: 'Le Corbusier',
    inspiredByEra: '1887-1965',
    inspiredByReason: 'Father of brutalist architecture. Believed honest materials and visible structure were more beautiful than ornament.',
  },
];

// ─── Custom Persona Factory ──────────────────────────────────

export interface CreatePersonaOptions {
  name: string;
  philosophy: string;
  styleKeywords: string[];
  density: DesignPersona['density'];
  colorTemperature: DesignPersona['colorTemperature'];
  avatar?: string;
  inspiredBy?: string;
  inspiredByEra?: string;
  inspiredByReason?: string;
}

let customCounter = 0;

export function createCustomPersona(options: CreatePersonaOptions): DesignPersona {
  return {
    id: `custom-${Date.now().toString(36)}-${customCounter++}`,
    name: options.name,
    avatar: options.avatar ?? options.name.charAt(0).toUpperCase(),
    philosophy: options.philosophy,
    styleKeywords: options.styleKeywords,
    density: options.density,
    colorTemperature: options.colorTemperature,
    source: 'custom',
    inspiredBy: options.inspiredBy,
    inspiredByEra: options.inspiredByEra,
    inspiredByReason: options.inspiredByReason,
  };
}

/** Merge built-in and custom personas */
export function getAllPersonas(custom: DesignPersona[] = []): DesignPersona[] {
  return [...DESIGN_PERSONAS, ...custom];
}

/** Suggested historical figures for custom persona inspiration */
export const PERSONA_INSPIRATIONS = [
  { name: 'Coco Chanel', era: '1883-1971', domain: 'fashion', suggestion: 'Elegance through simplicity. "Before you leave the house, look in the mirror and take one thing off."' },
  { name: 'Buckminster Fuller', era: '1895-1983', domain: 'systems', suggestion: 'Doing more with less. Geodesic thinking — maximum strength from minimum material.' },
  { name: 'Saul Bass', era: '1920-1996', domain: 'graphic design', suggestion: 'Iconic simplification. Distill complex ideas into a single powerful image.' },
  { name: 'Zaha Hadid', era: '1950-2016', domain: 'architecture', suggestion: 'Fluid, gravity-defying forms. Challenge every assumption about what a structure can be.' },
  { name: 'Massimo Vignelli', era: '1931-2014', domain: 'design systems', suggestion: 'Discipline in design. The NYC subway map, American Airlines identity — systems that scale.' },
  { name: 'Yayoi Kusama', era: '1929-present', domain: 'art', suggestion: 'Infinite repetition, immersive environments. Pattern as identity.' },
  { name: 'Issey Miyake', era: '1938-2022', domain: 'textile/tech', suggestion: 'Technology serves form. Pleats Please — engineering as aesthetic.' },
  { name: 'William Morris', era: '1834-1896', domain: 'arts & crafts', suggestion: 'Have nothing you do not know to be useful or believe to be beautiful.' },
  { name: 'Eileen Gray', era: '1878-1976', domain: 'furniture/architecture', suggestion: 'Design for the human body first. Every object should respond to the person using it.' },
  { name: 'Otl Aicher', era: '1922-1991', domain: 'information design', suggestion: 'Universal visual communication. His Munich Olympics pictograms spoke every language.' },
];
