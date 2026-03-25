export type {
  DesignPersona,
  CritiqueScores,
  DesignCritique,
  VariationStatus,
  VariationComponent,
  DesignVariation,
  SwarmPhase,
  SwarmSession,
} from './types';

export { DESIGN_PERSONAS, createCustomPersona, getAllPersonas, PERSONA_INSPIRATIONS } from './personas';
export type { CreatePersonaOptions } from './personas';

export {
  createSwarmSession,
  createVariation,
  calculateCritiqueScore,
  rankVariations,
} from './session';

// Quorum-style iterative refinement
export type {
  RefinementStep,
  RefinementFocus,
  ComponentChange,
  DesignScore,
  QuorumSession,
} from './QuorumRefiner';

export {
  determineReviewOrder,
  buildRefinementPrompt,
  createQuorumSession,
  createRefinementStep,
  calculateOverall,
  calculateTotalImprovement,
  getQuorumAttribution,
} from './QuorumRefiner';
