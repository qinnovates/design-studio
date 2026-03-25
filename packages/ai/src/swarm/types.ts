// ─── Design Persona ──────────────────────────────────────────

export interface DesignPersona {
  id: string;
  name: string;
  avatar: string;
  philosophy: string;
  styleKeywords: string[];
  density: 'compact' | 'balanced' | 'spacious';
  colorTemperature: 'warm' | 'neutral' | 'cool';
}

// ─── Critique & Scoring ──────────────────────────────────────

export interface CritiqueScores {
  aesthetics: number;
  usability: number;
  accessibility: number;
  creativity: number;
  consistency: number;
}

export interface DesignCritique {
  fromPersonaId: string;
  fromPersonaName: string;
  scores: CritiqueScores;
  overall: number;
  feedback: string;
  suggestions: string[];
}

// ─── Variation ───────────────────────────────────────────────

export type VariationStatus =
  | 'generating'
  | 'ready'
  | 'scored'
  | 'selected'
  | 'rejected';

export interface VariationComponent {
  componentId: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  variant: string;
  props: Record<string, unknown>;
  tokenBindings: Record<string, string>;
}

export interface DesignVariation {
  id: string;
  personaId: string;
  persona: DesignPersona;
  prompt: string;
  tokenOverrides: Record<string, string>;
  components: VariationComponent[];
  rationale: string;
  critiques: DesignCritique[];
  critiqueScore: number;
  userVote: 'like' | 'dislike' | null;
  status: VariationStatus;
  createdAt: string;
}

// ─── Swarm Session ───────────────────────────────────────────

export type SwarmPhase =
  | 'idle'
  | 'generating'
  | 'critiquing'
  | 'voting'
  | 'complete';

export interface SwarmSession {
  id: string;
  prompt: string;
  personaIds: string[];
  variations: DesignVariation[];
  phase: SwarmPhase;
  winnerId: string | null;
  createdAt: string;
}
