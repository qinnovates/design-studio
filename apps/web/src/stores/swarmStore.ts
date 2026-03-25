import { create } from 'zustand';
import type {
  SwarmSession,
  DesignVariation,
  DesignCritique,
  DesignPersona,
  PipelineStage,
} from '@design-studio/ai';
import {
  DESIGN_PERSONAS,
  createSwarmSession,
  createVariation,
  calculateCritiqueScore,
  rankVariations,
} from '@design-studio/ai';

interface SwarmState {
  // Current session
  session: SwarmSession | null;
  isGenerating: boolean;
  isCritiquing: boolean;
  error: string | null;

  // Screen pipeline stages
  screenStages: Record<string, PipelineStage>;

  // Actions — Swarm
  startSession: (prompt: string, personaIds?: string[]) => void;
  addVariation: (variation: DesignVariation) => void;
  updateVariation: (variationId: string, updates: Partial<DesignVariation>) => void;
  addCritique: (variationId: string, critique: DesignCritique) => void;
  userVote: (variationId: string, vote: 'like' | 'dislike' | null) => void;
  selectWinner: (variationId: string) => void;
  setPhase: (phase: SwarmSession['phase']) => void;
  setGenerating: (v: boolean) => void;
  setCritiquing: (v: boolean) => void;
  setError: (error: string | null) => void;
  clearSession: () => void;
  getRankedVariations: () => DesignVariation[];

  // Actions — Pipeline
  setScreenStage: (screenId: string, stage: PipelineStage) => void;
  getScreenStage: (screenId: string) => PipelineStage;
  advanceScreen: (screenId: string) => void;
}

export const useSwarmStore = create<SwarmState>()((set, get) => ({
  session: null,
  isGenerating: false,
  isCritiquing: false,
  error: null,
  screenStages: {},

  startSession: (prompt, personaIds) => {
    const session = createSwarmSession(prompt, personaIds);
    // Pre-create variations for each persona
    const personas = (personaIds ?? DESIGN_PERSONAS.map((p) => p.id))
      .map((id) => DESIGN_PERSONAS.find((p) => p.id === id))
      .filter((p): p is DesignPersona => p !== undefined);

    session.variations = personas.map((persona) => createVariation(persona, prompt));
    session.phase = 'generating';

    set({ session, isGenerating: true, error: null });
  },

  addVariation: (variation) => {
    set((state) => {
      if (!state.session) return state;
      return {
        session: {
          ...state.session,
          variations: [...state.session.variations, variation],
        },
      };
    });
  },

  updateVariation: (variationId, updates) => {
    set((state) => {
      if (!state.session) return state;
      return {
        session: {
          ...state.session,
          variations: state.session.variations.map((v) =>
            v.id === variationId ? { ...v, ...updates } : v,
          ),
        },
      };
    });
  },

  addCritique: (variationId, critique) => {
    set((state) => {
      if (!state.session) return state;
      return {
        session: {
          ...state.session,
          variations: state.session.variations.map((v) => {
            if (v.id !== variationId) return v;
            const critiques = [...v.critiques, critique];
            return {
              ...v,
              critiques,
              critiqueScore: calculateCritiqueScore(critiques),
              status: 'scored' as const,
            };
          }),
        },
      };
    });
  },

  userVote: (variationId, vote) => {
    set((state) => {
      if (!state.session) return state;
      return {
        session: {
          ...state.session,
          variations: state.session.variations.map((v) =>
            v.id === variationId ? { ...v, userVote: vote } : v,
          ),
        },
      };
    });
  },

  selectWinner: (variationId) => {
    set((state) => {
      if (!state.session) return state;
      return {
        session: {
          ...state.session,
          winnerId: variationId,
          phase: 'complete',
          variations: state.session.variations.map((v) => ({
            ...v,
            status: v.id === variationId ? ('selected' as const) : ('rejected' as const),
          })),
        },
      };
    });
  },

  setPhase: (phase) => {
    set((state) => {
      if (!state.session) return state;
      return { session: { ...state.session, phase } };
    });
  },

  setGenerating: (v) => set({ isGenerating: v }),
  setCritiquing: (v) => set({ isCritiquing: v }),
  setError: (error) => set({ error }),

  clearSession: () => set({ session: null, isGenerating: false, isCritiquing: false, error: null }),

  getRankedVariations: () => {
    const session = get().session;
    if (!session) return [];
    return rankVariations(session.variations);
  },

  // Pipeline
  setScreenStage: (screenId, stage) => {
    set((state) => ({
      screenStages: { ...state.screenStages, [screenId]: stage },
    }));
  },

  getScreenStage: (screenId) => {
    return get().screenStages[screenId] ?? 'draft';
  },

  advanceScreen: (screenId) => {
    const stages: PipelineStage[] = ['draft', 'design-review', 'feedback-approved', 'export-ready', 'shipped'];
    const current = get().getScreenStage(screenId);
    const idx = stages.indexOf(current);
    if (idx < stages.length - 1) {
      get().setScreenStage(screenId, stages[idx + 1]!);
    }
  },
}));
