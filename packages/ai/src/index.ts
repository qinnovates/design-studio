// Provider types
export type {
  AIProvider,
  ChatChunk,
  ChatChunkType,
  ChatParams,
  CostEstimate,
  Message,
  MessageRole,
  ModelInfo,
  ProviderConfig,
  ToolDefinition,
  ToolParameter,
} from './providers/ProviderInterface';

// Registry
export { ProviderRegistry } from './providers/ProviderRegistry';

// Concrete providers
export { OpenAIProvider, createOpenAIProvider } from './providers/OpenAIProvider';
export { AnthropicProvider, createAnthropicProvider } from './providers/AnthropicProvider';
export { OllamaProvider, createOllamaProvider } from './providers/OllamaProvider';

// Task routing
export { classifyTask, type DesignTaskType } from './tasks/TaskRouter';

// Design tools for function calling
export { DESIGN_TOOLS } from './functions/designTools';

// URL validation
export { validateBaseUrl, isLocalhost } from './providers/urlValidation';

// Prompts
export { buildSystemPrompt, serializeSceneForAI } from './prompts/system';

// Swarm — multi-persona design generation + critique
export type {
  DesignPersona,
  CritiqueScores,
  DesignCritique,
  VariationStatus,
  VariationComponent,
  DesignVariation,
  SwarmPhase,
  SwarmSession,
} from './swarm';
export {
  DESIGN_PERSONAS,
  createSwarmSession,
  createVariation,
  calculateCritiqueScore,
  rankVariations,
} from './swarm';

// Quorum — iterative design refinement
export type {
  RefinementStep,
  RefinementFocus,
  ComponentChange,
  DesignScore,
  QuorumSession,
} from './swarm/QuorumRefiner';
export {
  determineReviewOrder,
  buildRefinementPrompt,
  createQuorumSession,
  createRefinementStep,
  calculateOverall,
  calculateTotalImprovement,
  getQuorumAttribution,
} from './swarm/QuorumRefiner';

// Pipeline — CI/CD stages and gates for design screens
export type {
  PipelineStage,
  PipelineStageInfo,
  GateResult,
  Gate,
  GateContext,
  PipelineGateCheckResult,
} from './pipeline';
export {
  PIPELINE_STAGES,
  STAGE_COLORS,
  checkPipelineGates,
} from './pipeline';
