import { create } from 'zustand';

// ─── Brand Brief ─────────────────────────────────────────────
// Everything about the project identity. Filled out at project start.
// Feeds into: design tokens, AI prompts, market intelligence,
// export code, Quorum persona context.

export interface BrandBrief {
  // ── Identity ────────────────────────────────
  appName: string;
  tagline: string;
  description: string;
  /** One-sentence elevator pitch */
  elevatorPitch: string;

  // ── Audience ────────────────────────────────
  targetAudience: string;
  ageRange: string;
  userPersona: string;
  /** e.g., "tech-savvy professionals" or "first-time smartphone users" */
  techLevel: 'beginner' | 'intermediate' | 'advanced' | 'mixed';

  // ── Market ──────────────────────────────────
  category: string;
  competitors: string[];
  differentiator: string;

  // ── Visual Identity ─────────────────────────
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  /** e.g., "warm", "cool", "neutral", "vibrant" */
  colorMood: string;

  // ── Typography ──────────────────────────────
  headingFont: string;
  bodyFont: string;
  /** e.g., "modern", "classic", "playful", "technical" */
  fontMood: string;

  // ── Tone & Voice ────────────────────────────
  /** e.g., "professional", "casual", "authoritative", "friendly" */
  voiceTone: string;
  /** e.g., "We help you...", "Your AI-powered..." */
  sampleCopy: string;

  // ── Technical Requirements ──────────────────
  platforms: ('web' | 'ios' | 'android' | 'desktop')[];
  requiresAuth: boolean;
  authMethods: string[];
  hasDarkMode: boolean;
  languages: string[];
  /** e.g., "must be WCAG AA compliant" */
  accessibilityRequirements: string;

  // ── Business Requirements ───────────────────
  monetization: string;
  launchDate: string;
  mvpFeatures: string[];
  niceToHaveFeatures: string[];

  // ── Assets ──────────────────────────────────
  logoUrl: string;
  iconUrl: string;
  /** Any existing brand guidelines URL */
  brandGuidelinesUrl: string;
  /** Favicon URL (16x16 or 32x32) */
  faviconUrl: string;
  /** App icon URL (512x512 for PWA/app stores) */
  appIconUrl: string;
  /** Social share image (1200x630 for OG tags) */
  ogImageUrl: string;
  /** Apple touch icon (180x180) */
  appleTouchIconUrl: string;

  // ── Meta ────────────────────────────────────
  completedSections: string[];
  completionPercent: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Store ───────────────────────────────────────────────────

interface BrandState {
  brief: BrandBrief;
  isOnboarding: boolean;

  // Actions
  updateBrief: (updates: Partial<BrandBrief>) => void;
  setBriefField: <K extends keyof BrandBrief>(field: K, value: BrandBrief[K]) => void;
  resetBrief: () => void;
  setOnboarding: (v: boolean) => void;
  calculateCompletion: () => number;
  getCompletedSections: () => string[];

  /** Export the brief as seed data for AI prompts */
  toBriefContext: () => string;
  /** Export as design token overrides */
  toTokenOverrides: () => Record<string, string>;
}

const DEFAULT_BRIEF: BrandBrief = {
  appName: '',
  tagline: '',
  description: '',
  elevatorPitch: '',
  targetAudience: '',
  ageRange: '',
  userPersona: '',
  techLevel: 'mixed',
  category: 'saas',
  competitors: [],
  differentiator: '',
  primaryColor: '#2563eb',
  secondaryColor: '#6b7280',
  accentColor: '#f59e0b',
  backgroundColor: '#ffffff',
  textColor: '#111827',
  colorMood: 'professional',
  headingFont: 'Inter',
  bodyFont: 'Inter',
  fontMood: 'modern',
  voiceTone: 'professional',
  sampleCopy: '',
  platforms: ['web'],
  requiresAuth: false,
  authMethods: [],
  hasDarkMode: false,
  languages: ['en'],
  accessibilityRequirements: 'WCAG AA',
  monetization: '',
  launchDate: '',
  mvpFeatures: [],
  niceToHaveFeatures: [],
  logoUrl: '',
  iconUrl: '',
  brandGuidelinesUrl: '',
  faviconUrl: '',
  appIconUrl: '',
  ogImageUrl: '',
  appleTouchIconUrl: '',
  completedSections: [],
  completionPercent: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const SECTIONS: { id: string; label: string; fields: (keyof BrandBrief)[] }[] = [
  { id: 'identity', label: 'Identity', fields: ['appName', 'tagline', 'description', 'elevatorPitch'] },
  { id: 'audience', label: 'Audience', fields: ['targetAudience', 'ageRange', 'userPersona', 'techLevel'] },
  { id: 'market', label: 'Market', fields: ['category', 'competitors', 'differentiator'] },
  { id: 'visual', label: 'Visual Identity', fields: ['primaryColor', 'secondaryColor', 'accentColor', 'backgroundColor', 'textColor'] },
  { id: 'typography', label: 'Typography', fields: ['headingFont', 'bodyFont', 'fontMood'] },
  { id: 'tone', label: 'Tone & Voice', fields: ['voiceTone', 'sampleCopy'] },
  { id: 'technical', label: 'Technical', fields: ['platforms', 'requiresAuth', 'hasDarkMode', 'languages', 'accessibilityRequirements'] },
  { id: 'business', label: 'Business', fields: ['monetization', 'launchDate', 'mvpFeatures'] },
  { id: 'assets', label: 'Assets', fields: ['logoUrl', 'iconUrl', 'faviconUrl', 'appIconUrl', 'ogImageUrl', 'appleTouchIconUrl', 'brandGuidelinesUrl'] },
];

export { SECTIONS as BRAND_SECTIONS };

export const useBrandStore = create<BrandState>()((set, get) => ({
  brief: { ...DEFAULT_BRIEF },
  isOnboarding: false,

  updateBrief: (updates) => {
    set((state) => ({
      brief: { ...state.brief, ...updates, updatedAt: new Date().toISOString() },
    }));
  },

  setBriefField: (field, value) => {
    set((state) => ({
      brief: { ...state.brief, [field]: value, updatedAt: new Date().toISOString() },
    }));
  },

  resetBrief: () => set({ brief: { ...DEFAULT_BRIEF, createdAt: new Date().toISOString() } }),

  setOnboarding: (v) => set({ isOnboarding: v }),

  calculateCompletion: () => {
    const brief = get().brief;
    let filled = 0;
    let total = 0;

    for (const section of SECTIONS) {
      for (const field of section.fields) {
        total++;
        const val = brief[field];
        if (Array.isArray(val)) { if (val.length > 0) filled++; }
        else if (typeof val === 'boolean') { filled++; } // booleans always count
        else if (typeof val === 'string') { if (val.trim() !== '') filled++; }
        else { filled++; }
      }
    }

    return total === 0 ? 0 : Math.round((filled / total) * 100);
  },

  getCompletedSections: () => {
    const brief = get().brief;
    const completed: string[] = [];

    for (const section of SECTIONS) {
      const allFilled = section.fields.every((field) => {
        const val = brief[field];
        if (Array.isArray(val)) return val.length > 0;
        if (typeof val === 'boolean') return true;
        if (typeof val === 'string') return val.trim() !== '';
        return true;
      });
      if (allFilled) completed.push(section.id);
    }

    return completed;
  },

  /** Build a context string for AI prompts — seeds the brand into every AI interaction */
  toBriefContext: () => {
    const b = get().brief;
    const lines = [
      `APP: ${b.appName}${b.tagline ? ` — "${b.tagline}"` : ''}`,
      b.description && `DESCRIPTION: ${b.description}`,
      b.elevatorPitch && `PITCH: ${b.elevatorPitch}`,
      b.targetAudience && `AUDIENCE: ${b.targetAudience} (${b.ageRange}, ${b.techLevel} tech level)`,
      b.category && `CATEGORY: ${b.category}`,
      b.competitors.length > 0 && `COMPETITORS: ${b.competitors.join(', ')}`,
      b.differentiator && `DIFFERENTIATOR: ${b.differentiator}`,
      `BRAND COLORS: primary=${b.primaryColor}, secondary=${b.secondaryColor}, accent=${b.accentColor} (mood: ${b.colorMood})`,
      `FONTS: heading=${b.headingFont}, body=${b.bodyFont} (mood: ${b.fontMood})`,
      b.voiceTone && `VOICE: ${b.voiceTone}`,
      `PLATFORMS: ${b.platforms.join(', ')}`,
      b.hasDarkMode && `Dark mode required`,
      b.accessibilityRequirements && `ACCESSIBILITY: ${b.accessibilityRequirements}`,
      b.monetization && `MONETIZATION: ${b.monetization}`,
      b.launchDate && `LAUNCH: ${b.launchDate}`,
      b.mvpFeatures.length > 0 && `MVP FEATURES: ${b.mvpFeatures.join(', ')}`,
    ];

    return lines.filter(Boolean).join('\n');
  },

  /** Convert brand colors to design token overrides */
  toTokenOverrides: () => {
    const b = get().brief;
    return {
      'color.action.primary': b.primaryColor,
      'color.text.secondary': b.secondaryColor,
      'color.warning': b.accentColor,
      'color.surface.primary': b.backgroundColor,
      'color.text.primary': b.textColor,
    };
  },
}));
