import type {
  SwarmSession,
  DesignVariation,
  DesignCritique,
  DesignPersona,
} from './types';
import { DESIGN_PERSONAS } from './personas';

let counter = 0;
function uid(): string {
  counter += 1;
  return `${Date.now().toString(36)}-${counter.toString(36)}`;
}

/** Create a new swarm session with the given prompt and optional persona filter. */
export function createSwarmSession(
  prompt: string,
  personaIds?: string[],
): SwarmSession {
  const ids = personaIds ?? DESIGN_PERSONAS.map((p) => p.id);
  return {
    id: uid(),
    prompt,
    personaIds: ids,
    variations: [],
    phase: 'idle',
    winnerId: null,
    createdAt: new Date().toISOString(),
  };
}

/** Create an empty variation shell for a persona. */
export function createVariation(
  persona: DesignPersona,
  prompt: string,
): DesignVariation {
  return {
    id: uid(),
    personaId: persona.id,
    persona,
    prompt,
    tokenOverrides: {},
    components: [],
    rationale: '',
    critiques: [],
    critiqueScore: 0,
    userVote: null,
    status: 'generating',
    createdAt: new Date().toISOString(),
  };
}

/** Calculate a weighted critique score from an array of critiques. */
export function calculateCritiqueScore(critiques: DesignCritique[]): number {
  if (critiques.length === 0) return 0;
  const sum = critiques.reduce((acc, c) => acc + c.overall, 0);
  return Math.round((sum / critiques.length) * 10) / 10;
}

/** Rank variations by composite score (critique score + user vote bonus). */
export function rankVariations(variations: DesignVariation[]): DesignVariation[] {
  return [...variations].sort((a, b) => {
    const aBonus = a.userVote === 'like' ? 1 : a.userVote === 'dislike' ? -1 : 0;
    const bBonus = b.userVote === 'like' ? 1 : b.userVote === 'dislike' ? -1 : 0;
    return (b.critiqueScore + bBonus) - (a.critiqueScore + aBonus);
  });
}
