/**
 * QuorumRefiner — Iterative design improvement, Quorum-style.
 *
 * Instead of dumping N parallel designs (Suno approach), this takes the
 * Quorum approach: each AI persona reviews the CURRENT design and makes
 * ONE targeted improvement. The design gets better with each pass.
 *
 * Flow:
 * 1. Start with the current canvas state
 * 2. First persona reviews it, identifies ONE thing to improve, applies the fix
 * 3. Second persona reviews the improved version, finds the next improvement
 * 4. Each pass is a deliberate, targeted refinement
 * 5. User can stop at any point when satisfied
 * 6. Each step shows: what changed, why, before/after, persona rationale
 *
 * This is how Quorum works for code review — sequential, focused,
 * each reviewer building on the last. Applied to design.
 *
 * Why this is better than parallel generation:
 * - Coherent design (not 6 disconnected visions)
 * - Each step is understandable and reversible
 * - The user learns WHY each change is made
 * - Converges on quality rather than spreading across options
 * - Marketing: "Powered by Quorum — iterative AI design refinement"
 */

import type { DesignPersona } from './types';
import { DESIGN_PERSONAS } from './personas';

// ─── Refinement Step ─────────────────────────────────────────

export interface RefinementStep {
  id: string;
  /** Which pass number (1-indexed) */
  passNumber: number;
  /** Which persona made this refinement */
  persona: DesignPersona;
  /** What aspect they focused on */
  focus: RefinementFocus;
  /** What they changed — plain English */
  description: string;
  /** Why they made this change */
  rationale: string;
  /** Confidence score (1-10) in this improvement */
  confidence: number;
  /** Token changes applied */
  tokenChanges: { name: string; before: string; after: string }[];
  /** Component changes (add/modify/remove) */
  componentChanges: ComponentChange[];
  /** Overall design score BEFORE this step */
  scoreBefore: DesignScore;
  /** Overall design score AFTER this step */
  scoreAfter: DesignScore;
  /** Status */
  status: 'pending' | 'generating' | 'applied' | 'skipped' | 'reverted';
  /** User accepted or rejected */
  userDecision: 'accepted' | 'rejected' | null;
  createdAt: string;
}

export type RefinementFocus =
  | 'color-harmony'      // Color palette improvements
  | 'typography'         // Font choices, sizing, hierarchy
  | 'spacing'            // Layout spacing and alignment
  | 'visual-hierarchy'   // What draws the eye first
  | 'accessibility'      // Contrast, touch targets, readability
  | 'consistency'        // Design system coherence
  | 'emotional-tone'     // Does the design match the intended mood?
  | 'component-choice'   // Better component for the job
  | 'simplification'     // Remove unnecessary elements
  | 'emphasis';          // Make important things stand out

export interface ComponentChange {
  type: 'add' | 'modify' | 'remove';
  nodeId?: string;
  componentId?: string;
  description: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}

export interface DesignScore {
  aesthetics: number;    // 1-10
  usability: number;     // 1-10
  accessibility: number; // 1-10
  consistency: number;   // 1-10
  overall: number;       // average
}

// ─── Refinement Session ──────────────────────────────────────

export interface QuorumSession {
  id: string;
  /** Original user prompt / design intent */
  prompt: string;
  /** The ordered list of personas that will review */
  reviewOrder: DesignPersona[];
  /** Completed refinement steps */
  steps: RefinementStep[];
  /** Current step index (which persona is reviewing) */
  currentStepIndex: number;
  /** Session state */
  phase: 'idle' | 'reviewing' | 'waiting-for-user' | 'complete';
  /** Total improvement (scoreAfter - scoreBefore over all steps) */
  totalImprovement: number;
  createdAt: string;
}

// ─── Smart Review Order ──────────────────────────────────────

/**
 * Determines the optimal order of persona reviews based on the design prompt.
 *
 * The order matters:
 * 1. Accessibility first (foundation — if contrast/targets are wrong, nothing else matters)
 * 2. Content/hierarchy (structure before style)
 * 3. Then aesthetics (polish last)
 *
 * But if the user asks for "bold" or "fun", the relevant style persona goes earlier.
 */
export function determineReviewOrder(prompt: string): DesignPersona[] {
  const lower = prompt.toLowerCase();
  const order: DesignPersona[] = [];
  const used = new Set<string>();

  const add = (id: string) => {
    const persona = DESIGN_PERSONAS.find((p) => p.id === id);
    if (persona && !used.has(id)) {
      order.push(persona);
      used.add(id);
    }
  };

  // Always start with accessibility (foundation)
  add('accessible');

  // Style persona matched to prompt goes second
  if (lower.match(/bold|strong|dark|dramatic|impact/)) add('bold');
  else if (lower.match(/clean|minimal|simple|zen/)) add('minimalist');
  else if (lower.match(/fun|playful|friendly|warm|colorful/)) add('playful');
  else if (lower.match(/elegant|luxury|editorial|magazine|sophisticated/)) add('editorial');
  else if (lower.match(/raw|brutalist|technical|terminal|code/)) add('brutalist');
  else add('minimalist'); // default: start clean

  // Fill remaining personas in a balanced order
  add('editorial');  // typography expertise
  add('bold');       // visual impact
  add('playful');    // delight & approachability
  add('minimalist'); // simplification pass
  add('brutalist');  // structural clarity (optional, last)

  return order;
}

// ─── Prompt Builders ─────────────────────────────────────────

export function buildRefinementPrompt(
  persona: DesignPersona,
  passNumber: number,
  userPrompt: string,
  currentDesignDescription: string,
  previousSteps: RefinementStep[],
): string {
  const previousChangesText = previousSteps.length > 0
    ? `\nPrevious improvements:\n${previousSteps.map((s, i) =>
        `  ${i + 1}. ${s.persona.avatar} ${s.persona.name}: ${s.description} (confidence: ${s.confidence}/10)`,
      ).join('\n')}`
    : '\nThis is the first review pass — no previous changes.';

  return `You are ${persona.name}, a designer whose philosophy is: "${persona.philosophy}".
Your style keywords: ${persona.styleKeywords.join(', ')}.
Your preferred density: ${persona.density}. Color temperature: ${persona.colorTemperature}.

You are performing pass #${passNumber} of a Quorum design review.

USER'S DESIGN INTENT: "${userPrompt}"

CURRENT DESIGN STATE:
${currentDesignDescription}
${previousChangesText}

YOUR TASK: Review the current design and identify the SINGLE most impactful improvement you can make from your design perspective. Do NOT try to redesign everything — make ONE focused change.

Rules:
1. Focus on ONE thing. Not two, not three. ONE.
2. The change should be the highest-impact improvement available.
3. Explain WHY this change improves the design.
4. Be specific — give exact values (hex codes, pixel sizes, font names).
5. Score the design before and after your change (1-10 on aesthetics, usability, accessibility, consistency).
6. If the design is already excellent from your perspective, say so and skip (confidence: 0).

Return JSON:
{
  "focus": "color-harmony|typography|spacing|visual-hierarchy|accessibility|consistency|emotional-tone|component-choice|simplification|emphasis",
  "description": "What you changed, in one sentence",
  "rationale": "Why this is the highest-impact improvement",
  "confidence": 1-10,
  "tokenChanges": [{ "name": "token.name", "before": "old-value", "after": "new-value" }],
  "componentChanges": [{ "type": "add|modify|remove", "description": "what changed" }],
  "scoreBefore": { "aesthetics": N, "usability": N, "accessibility": N, "consistency": N },
  "scoreAfter": { "aesthetics": N, "usability": N, "accessibility": N, "consistency": N }
}`;
}

// ─── Session Factory ─────────────────────────────────────────

export function createQuorumSession(prompt: string, maxPasses?: number): QuorumSession {
  const reviewOrder = determineReviewOrder(prompt);
  const limited = maxPasses ? reviewOrder.slice(0, maxPasses) : reviewOrder;

  return {
    id: `quorum-${Date.now().toString(36)}`,
    prompt,
    reviewOrder: limited,
    steps: [],
    currentStepIndex: 0,
    phase: 'idle',
    totalImprovement: 0,
    createdAt: new Date().toISOString(),
  };
}

export function createRefinementStep(
  passNumber: number,
  persona: DesignPersona,
): RefinementStep {
  return {
    id: `step-${passNumber}-${persona.id}-${Date.now().toString(36)}`,
    passNumber,
    persona,
    focus: 'consistency',
    description: '',
    rationale: '',
    confidence: 0,
    tokenChanges: [],
    componentChanges: [],
    scoreBefore: { aesthetics: 5, usability: 5, accessibility: 5, consistency: 5, overall: 5 },
    scoreAfter: { aesthetics: 5, usability: 5, accessibility: 5, consistency: 5, overall: 5 },
    status: 'pending',
    userDecision: null,
    createdAt: new Date().toISOString(),
  };
}

/** Calculate overall score from dimensions */
export function calculateOverall(score: Omit<DesignScore, 'overall'>): number {
  return Math.round(((score.aesthetics + score.usability + score.accessibility + score.consistency) / 4) * 10) / 10;
}

/** Calculate total improvement across all accepted steps */
export function calculateTotalImprovement(steps: RefinementStep[]): number {
  const accepted = steps.filter((s) => s.userDecision === 'accepted');
  if (accepted.length === 0) return 0;
  const first = accepted[0]!;
  const last = accepted[accepted.length - 1]!;
  return Math.round((last.scoreAfter.overall - first.scoreBefore.overall) * 10) / 10;
}

// ─── Quorum Attribution ──────────────────────────────────────

/** Generate the "Powered by Quorum" attribution text for exports */
export function getQuorumAttribution(session: QuorumSession): string {
  const acceptedSteps = session.steps.filter((s) => s.userDecision === 'accepted');
  if (acceptedSteps.length === 0) return '';

  const personas = acceptedSteps.map((s) => `${s.persona.avatar} ${s.persona.name}`);
  const improvement = calculateTotalImprovement(acceptedSteps);

  return `Design refined by Quorum AI — ${acceptedSteps.length} iterative passes by ${personas.join(', ')}. Overall improvement: +${improvement} points. Powered by Design Studio (github.com/qinnovates/design-studio)`;
}
