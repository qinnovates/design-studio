/**
 * FontLibrary — browseable font catalog with preview support.
 *
 * Users can browse, search, and preview fonts before selecting them.
 * Each font entry includes:
 * - Metadata (name, category, weights, source)
 * - Preview text rendering info
 * - CSS @font-face or Google Fonts URL for loading
 *
 * This is NOT the full Google Fonts catalog — it's a curated set of
 * high-quality, widely-available fonts organized by personality.
 */

// ─── Types ───────────────────────────────────────────────────

export type FontCategory =
  | 'sans-serif'    // Clean, modern (Inter, Poppins)
  | 'serif'         // Classic, editorial (Playfair, Merriweather)
  | 'monospace'     // Code, technical (JetBrains Mono, Fira Code)
  | 'display'       // Headlines, branding (Clash Display, Cabinet Grotesk)
  | 'handwriting';  // Personal, casual (Caveat, Pacifico)

export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export type FontPersonality =
  | 'professional'  // Corporate, serious
  | 'friendly'      // Warm, approachable
  | 'modern'        // Clean, techy
  | 'elegant'       // Luxury, refined
  | 'playful'       // Fun, young
  | 'editorial'     // Magazine, blog
  | 'minimal'       // Sparse, typographic
  | 'bold';         // Strong, impactful

export interface FontEntry {
  id: string;
  name: string;
  category: FontCategory;
  personalities: FontPersonality[];
  /** Available weights */
  weights: FontWeight[];
  /** Has italic variants */
  hasItalic: boolean;
  /** Google Fonts URL or null for system fonts */
  googleFontsUrl: string | null;
  /** CSS font-family fallback chain */
  fallback: string;
  /** Good pairing IDs (heading + body combos) */
  pairsWith: string[];
  /** Short description for non-designers */
  description: string;
  /** Sample text tuned for this font */
  sampleText: string;
  /** Is this a variable font? */
  isVariable: boolean;
  /** License type */
  license: 'open' | 'free' | 'commercial';
}

export interface FontPairing {
  id: string;
  name: string;
  headingFont: string;
  bodyFont: string;
  description: string;
  bestFor: string[];
}

// ─── Curated Font Library ────────────────────────────────────

export const FONT_LIBRARY: FontEntry[] = [
  // ── Sans-Serif ──────────────────────────────
  {
    id: 'inter',
    name: 'Inter',
    category: 'sans-serif',
    personalities: ['modern', 'professional', 'minimal'],
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    hasItalic: true,
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@100..900',
    fallback: 'system-ui, -apple-system, sans-serif',
    pairsWith: ['playfair-display', 'source-serif-pro'],
    description: 'The default. Clean, highly readable, works everywhere.',
    sampleText: 'Design apps without design skills',
    isVariable: true,
    license: 'open',
  },
  {
    id: 'poppins',
    name: 'Poppins',
    category: 'sans-serif',
    personalities: ['friendly', 'modern', 'playful'],
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    hasItalic: true,
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Poppins:wght@100..900',
    fallback: 'system-ui, sans-serif',
    pairsWith: ['lora', 'source-serif-pro'],
    description: 'Geometric and friendly. Great for apps and marketing.',
    sampleText: 'Make something people love',
    isVariable: false,
    license: 'open',
  },
  {
    id: 'dm-sans',
    name: 'DM Sans',
    category: 'sans-serif',
    personalities: ['modern', 'minimal', 'professional'],
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    hasItalic: true,
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@100..900',
    fallback: 'system-ui, sans-serif',
    pairsWith: ['dm-serif-display', 'playfair-display'],
    description: 'Clean geometric sans. Pairs perfectly with DM Serif.',
    sampleText: 'Simple and sophisticated',
    isVariable: true,
    license: 'open',
  },
  {
    id: 'plus-jakarta-sans',
    name: 'Plus Jakarta Sans',
    category: 'sans-serif',
    personalities: ['modern', 'friendly', 'professional'],
    weights: [200, 300, 400, 500, 600, 700, 800],
    hasItalic: true,
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200..800',
    fallback: 'system-ui, sans-serif',
    pairsWith: ['source-serif-pro', 'lora'],
    description: 'Trending in SaaS. Modern, warm, slightly rounded.',
    sampleText: 'Built for teams who ship fast',
    isVariable: true,
    license: 'open',
  },
  {
    id: 'space-grotesk',
    name: 'Space Grotesk',
    category: 'sans-serif',
    personalities: ['modern', 'bold', 'minimal'],
    weights: [300, 400, 500, 600, 700],
    hasItalic: false,
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700',
    fallback: 'system-ui, sans-serif',
    pairsWith: ['space-mono', 'source-serif-pro'],
    description: 'Techy, bold, great for developer tools and web3.',
    sampleText: 'Code. Build. Deploy.',
    isVariable: true,
    license: 'open',
  },
  {
    id: 'nunito',
    name: 'Nunito',
    category: 'sans-serif',
    personalities: ['friendly', 'playful'],
    weights: [200, 300, 400, 500, 600, 700, 800, 900],
    hasItalic: true,
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Nunito:wght@200..900',
    fallback: 'system-ui, sans-serif',
    pairsWith: ['lora', 'merriweather'],
    description: 'Soft rounded. Perfect for education, kids, health apps.',
    sampleText: 'Learning should be fun',
    isVariable: true,
    license: 'open',
  },

  // ── Serif ───────────────────────────────────
  {
    id: 'playfair-display',
    name: 'Playfair Display',
    category: 'serif',
    personalities: ['elegant', 'editorial'],
    weights: [400, 500, 600, 700, 800, 900],
    hasItalic: true,
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400..900',
    fallback: 'Georgia, serif',
    pairsWith: ['inter', 'dm-sans', 'poppins'],
    description: 'High-contrast serif. Luxury, editorial, elegant headers.',
    sampleText: 'The Art of Design',
    isVariable: true,
    license: 'open',
  },
  {
    id: 'lora',
    name: 'Lora',
    category: 'serif',
    personalities: ['editorial', 'elegant'],
    weights: [400, 500, 600, 700],
    hasItalic: true,
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Lora:wght@400..700',
    fallback: 'Georgia, serif',
    pairsWith: ['poppins', 'nunito', 'dm-sans'],
    description: 'Balanced serif for long reading. Great for blogs.',
    sampleText: 'Stories worth telling',
    isVariable: true,
    license: 'open',
  },
  {
    id: 'source-serif-pro',
    name: 'Source Serif 4',
    category: 'serif',
    personalities: ['professional', 'editorial'],
    weights: [200, 300, 400, 500, 600, 700, 800, 900],
    hasItalic: true,
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@200..900',
    fallback: 'Georgia, serif',
    pairsWith: ['inter', 'plus-jakarta-sans', 'space-grotesk'],
    description: 'Adobe\'s open serif. Professional, highly readable.',
    sampleText: 'Clarity through craft',
    isVariable: true,
    license: 'open',
  },
  {
    id: 'dm-serif-display',
    name: 'DM Serif Display',
    category: 'serif',
    personalities: ['elegant', 'bold'],
    weights: [400],
    hasItalic: true,
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=DM+Serif+Display',
    fallback: 'Georgia, serif',
    pairsWith: ['dm-sans', 'inter'],
    description: 'Bold display serif. Perfect pair with DM Sans.',
    sampleText: 'Make a Statement',
    isVariable: false,
    license: 'open',
  },

  // ── Monospace ───────────────────────────────
  {
    id: 'jetbrains-mono',
    name: 'JetBrains Mono',
    category: 'monospace',
    personalities: ['modern', 'minimal'],
    weights: [100, 200, 300, 400, 500, 600, 700, 800],
    hasItalic: true,
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100..800',
    fallback: 'Menlo, Monaco, monospace',
    pairsWith: ['inter', 'space-grotesk'],
    description: 'Made for code. Ligatures, clear, zero-ambiguity.',
    sampleText: 'const design = await ai.create();',
    isVariable: true,
    license: 'open',
  },
  {
    id: 'space-mono',
    name: 'Space Mono',
    category: 'monospace',
    personalities: ['modern', 'bold'],
    weights: [400, 700],
    hasItalic: true,
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700',
    fallback: 'Menlo, Monaco, monospace',
    pairsWith: ['space-grotesk', 'inter'],
    description: 'Geometric mono. Great for dev tools and terminals.',
    sampleText: '> npm run design',
    isVariable: false,
    license: 'open',
  },

  // ── Display ─────────────────────────────────
  {
    id: 'cabinet-grotesk',
    name: 'Sora',
    category: 'display',
    personalities: ['modern', 'bold'],
    weights: [100, 200, 300, 400, 500, 600, 700, 800],
    hasItalic: false,
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Sora:wght@100..800',
    fallback: 'system-ui, sans-serif',
    pairsWith: ['inter', 'source-serif-pro'],
    description: 'Geometric, expressive headers. Web3 and startup vibes.',
    sampleText: 'THE FUTURE IS NOW',
    isVariable: true,
    license: 'open',
  },

  // ── Handwriting ─────────────────────────────
  {
    id: 'caveat',
    name: 'Caveat',
    category: 'handwriting',
    personalities: ['playful', 'friendly'],
    weights: [400, 500, 600, 700],
    hasItalic: false,
    googleFontsUrl: 'https://fonts.googleapis.com/css2?family=Caveat:wght@400..700',
    fallback: 'cursive',
    pairsWith: ['inter', 'nunito', 'poppins'],
    description: 'Casual handwriting. Annotations, personal touches.',
    sampleText: 'Just a quick note...',
    isVariable: true,
    license: 'open',
  },
];

// ─── Font Pairings (curated heading + body combos) ───────────

export const FONT_PAIRINGS: FontPairing[] = [
  {
    id: 'modern-professional',
    name: 'Modern Professional',
    headingFont: 'inter',
    bodyFont: 'inter',
    description: 'Clean, unified. Works for everything.',
    bestFor: ['SaaS', 'productivity', 'tools'],
  },
  {
    id: 'editorial-elegance',
    name: 'Editorial Elegance',
    headingFont: 'playfair-display',
    bodyFont: 'inter',
    description: 'Serif headlines, sans body. Magazine feel.',
    bestFor: ['editorial', 'luxury', 'fashion'],
  },
  {
    id: 'friendly-startup',
    name: 'Friendly Startup',
    headingFont: 'poppins',
    bodyFont: 'inter',
    description: 'Warm headers, clean body. Approachable tech.',
    bestFor: ['startups', 'social', 'marketplace'],
  },
  {
    id: 'geometric-bold',
    name: 'Geometric Bold',
    headingFont: 'space-grotesk',
    bodyFont: 'dm-sans',
    description: 'Techy and confident. Developer-forward.',
    bestFor: ['dev tools', 'web3', 'API products'],
  },
  {
    id: 'warm-readable',
    name: 'Warm & Readable',
    headingFont: 'plus-jakarta-sans',
    bodyFont: 'source-serif-pro',
    description: 'Modern sans headers, serif body. Long-form content.',
    bestFor: ['blogs', 'documentation', 'education'],
  },
  {
    id: 'dm-classic',
    name: 'DM Classic',
    headingFont: 'dm-serif-display',
    bodyFont: 'dm-sans',
    description: 'Bold serif display + clean geometric body. Sophisticated.',
    bestFor: ['luxury', 'finance', 'portfolio'],
  },
  {
    id: 'playful-soft',
    name: 'Playful & Soft',
    headingFont: 'nunito',
    bodyFont: 'nunito',
    description: 'Rounded and friendly throughout. Non-intimidating.',
    bestFor: ['education', 'kids', 'health', 'wellness'],
  },
  {
    id: 'code-native',
    name: 'Code Native',
    headingFont: 'space-grotesk',
    bodyFont: 'jetbrains-mono',
    description: 'Everything monospace. For developer audiences.',
    bestFor: ['terminal tools', 'CLI docs', 'hacker aesthetic'],
  },
];

// ─── Search & Filter ─────────────────────────────────────────

export function searchFonts(query: string): FontEntry[] {
  const q = query.toLowerCase();
  return FONT_LIBRARY.filter(
    (f) =>
      f.name.toLowerCase().includes(q) ||
      f.category.includes(q) ||
      f.personalities.some((p) => p.includes(q)) ||
      f.description.toLowerCase().includes(q),
  );
}

export function getFontsByCategory(category: FontCategory): FontEntry[] {
  return FONT_LIBRARY.filter((f) => f.category === category);
}

export function getFontsByPersonality(personality: FontPersonality): FontEntry[] {
  return FONT_LIBRARY.filter((f) => f.personalities.includes(personality));
}

export function getFont(id: string): FontEntry | undefined {
  return FONT_LIBRARY.find((f) => f.id === id);
}

export function getPairingById(id: string): FontPairing | undefined {
  return FONT_PAIRINGS.find((p) => p.id === id);
}

export function getPairingsForFont(fontId: string): FontPairing[] {
  return FONT_PAIRINGS.filter(
    (p) => p.headingFont === fontId || p.bodyFont === fontId,
  );
}

/** Get the Google Fonts import URL for a set of font IDs */
export function getGoogleFontsImportUrl(fontIds: string[]): string {
  const fonts = fontIds
    .map((id) => getFont(id))
    .filter((f): f is FontEntry => f !== undefined && f.googleFontsUrl !== null);

  if (fonts.length === 0) return '';

  const families = fonts
    .map((f) => {
      const name = f.name.replace(/ /g, '+');
      if (f.isVariable) {
        return `family=${name}:wght@${f.weights[0]}..${f.weights[f.weights.length - 1]}`;
      }
      return `family=${name}:wght@${f.weights.join(';')}`;
    })
    .join('&');

  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}
