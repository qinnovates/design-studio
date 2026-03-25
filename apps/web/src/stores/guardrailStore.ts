import { create } from 'zustand';

// ─── Types ───────────────────────────────────────────────────

export type GuardrailSource = 'dislike' | 'manual' | 'quorum-reject' | 'market-intel';
export type PreferenceSource = 'like' | 'manual' | 'quorum-accept' | 'brand-brief';

export interface Guardrail {
  id: string;
  /** What to avoid — plain English */
  rule: string;
  /** Category for grouping */
  category: 'color' | 'typography' | 'layout' | 'component' | 'spacing' | 'style' | 'content' | 'pattern';
  /** Where this guardrail came from */
  source: GuardrailSource;
  /** Reference to the element that was disliked */
  sourceRefId: string | null;
  /** Specific value to avoid (e.g., "#ff0000" or "Comic Sans") */
  avoidValue: string | null;
  /** How strongly to enforce (1-10) */
  strength: number;
  active: boolean;
  createdAt: string;
}

export interface Preference {
  id: string;
  /** What to do more of — plain English */
  rule: string;
  category: 'color' | 'typography' | 'layout' | 'component' | 'spacing' | 'style' | 'content' | 'pattern';
  source: PreferenceSource;
  sourceRefId: string | null;
  /** Specific value to prefer (e.g., "#2563eb" or "Inter") */
  preferValue: string | null;
  strength: number;
  active: boolean;
  createdAt: string;
}

// ─── Store ───────────────────────────────────────────────────

interface GuardrailState {
  guardrails: Record<string, Guardrail>;
  preferences: Record<string, Preference>;

  // Actions — Guardrails (from dislikes)
  addGuardrail: (guardrail: Omit<Guardrail, 'id' | 'createdAt'>) => string;
  removeGuardrail: (id: string) => void;
  toggleGuardrail: (id: string) => void;
  getActiveGuardrails: () => Guardrail[];
  getGuardrailsByCategory: (category: Guardrail['category']) => Guardrail[];

  // Actions — Preferences (from likes)
  addPreference: (pref: Omit<Preference, 'id' | 'createdAt'>) => string;
  removePreference: (id: string) => void;
  togglePreference: (id: string) => void;
  getActivePreferences: () => Preference[];
  getPreferencesByCategory: (category: Preference['category']) => Preference[];

  // Auto-create from feedback
  createFromDislike: (targetType: string, targetLabel: string, targetValue?: string) => string;
  createFromLike: (targetType: string, targetLabel: string, targetValue?: string) => string;
  createFromQuorumReject: (description: string, category: Guardrail['category']) => string;
  createFromQuorumAccept: (description: string, category: Preference['category']) => string;

  /** Build the guardrails section for AI prompts */
  toPromptConstraints: () => string;
  /** Build the preferences section for AI prompts */
  toPromptPreferences: () => string;
  /** Combined prompt section */
  toFullPromptSection: () => string;
}

let counter = 0;
const genId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${counter++}`;

// Map feedback target types to guardrail categories
function inferCategory(targetType: string): Guardrail['category'] {
  if (targetType.includes('color') || targetType === 'token' && targetType.includes('color')) return 'color';
  if (targetType.includes('font') || targetType.includes('typography')) return 'typography';
  if (targetType.includes('spacing') || targetType.includes('radius')) return 'spacing';
  if (targetType.includes('component')) return 'component';
  if (targetType.includes('layout') || targetType.includes('screen')) return 'layout';
  return 'style';
}

export const useGuardrailStore = create<GuardrailState>()((set, get) => ({
  guardrails: {},
  preferences: {},

  // ── Guardrails ───────────────────────────
  addGuardrail: (data) => {
    const id = genId('guard');
    set((state) => ({
      guardrails: { ...state.guardrails, [id]: { ...data, id, createdAt: new Date().toISOString() } },
    }));
    return id;
  },

  removeGuardrail: (id) => {
    set((state) => {
      const { [id]: _, ...rest } = state.guardrails;
      return { guardrails: rest };
    });
  },

  toggleGuardrail: (id) => {
    set((state) => {
      const g = state.guardrails[id];
      if (!g) return state;
      return { guardrails: { ...state.guardrails, [id]: { ...g, active: !g.active } } };
    });
  },

  getActiveGuardrails: () => Object.values(get().guardrails).filter((g) => g.active),
  getGuardrailsByCategory: (cat) => Object.values(get().guardrails).filter((g) => g.category === cat),

  // ── Preferences ──────────────────────────
  addPreference: (data) => {
    const id = genId('pref');
    set((state) => ({
      preferences: { ...state.preferences, [id]: { ...data, id, createdAt: new Date().toISOString() } },
    }));
    return id;
  },

  removePreference: (id) => {
    set((state) => {
      const { [id]: _, ...rest } = state.preferences;
      return { preferences: rest };
    });
  },

  togglePreference: (id) => {
    set((state) => {
      const p = state.preferences[id];
      if (!p) return state;
      return { preferences: { ...state.preferences, [id]: { ...p, active: !p.active } } };
    });
  },

  getActivePreferences: () => Object.values(get().preferences).filter((p) => p.active),
  getPreferencesByCategory: (cat) => Object.values(get().preferences).filter((p) => p.category === cat),

  // ── Auto-create from feedback ────────────
  createFromDislike: (targetType, targetLabel, targetValue) => {
    return get().addGuardrail({
      rule: `Avoid: ${targetLabel}${targetValue ? ` (value: ${targetValue})` : ''}`,
      category: inferCategory(targetType),
      source: 'dislike',
      sourceRefId: targetLabel,
      avoidValue: targetValue ?? null,
      strength: 7,
      active: true,
    });
  },

  createFromLike: (targetType, targetLabel, targetValue) => {
    return get().addPreference({
      rule: `Prefer: ${targetLabel}${targetValue ? ` (value: ${targetValue})` : ''}`,
      category: inferCategory(targetType),
      source: 'like',
      sourceRefId: targetLabel,
      preferValue: targetValue ?? null,
      strength: 7,
      active: true,
    });
  },

  createFromQuorumReject: (description, category) => {
    return get().addGuardrail({
      rule: `Rejected Quorum suggestion: ${description}`,
      category,
      source: 'quorum-reject',
      sourceRefId: null,
      avoidValue: null,
      strength: 8,
      active: true,
    });
  },

  createFromQuorumAccept: (description, category) => {
    return get().addPreference({
      rule: `Accepted Quorum suggestion: ${description}`,
      category,
      source: 'quorum-accept',
      sourceRefId: null,
      preferValue: null,
      strength: 8,
      active: true,
    });
  },

  // ── Prompt Builders ──────────────────────
  toPromptConstraints: () => {
    const active = get().getActiveGuardrails();
    if (active.length === 0) return '';
    const lines = active.map((g) => `- DO NOT: ${g.rule}${g.avoidValue ? ` (specifically avoid: ${g.avoidValue})` : ''}`);
    return `\nDESIGN GUARDRAILS (the user has explicitly rejected these — NEVER use them):\n${lines.join('\n')}`;
  },

  toPromptPreferences: () => {
    const active = get().getActivePreferences();
    if (active.length === 0) return '';
    const lines = active.map((p) => `- DO MORE: ${p.rule}${p.preferValue ? ` (specifically use: ${p.preferValue})` : ''}`);
    return `\nDESIGN PREFERENCES (the user has explicitly approved these — lean into them):\n${lines.join('\n')}`;
  },

  toFullPromptSection: () => {
    const constraints = get().toPromptConstraints();
    const preferences = get().toPromptPreferences();
    if (!constraints && !preferences) return '';
    return `${preferences}${constraints}`;
  },
}));
