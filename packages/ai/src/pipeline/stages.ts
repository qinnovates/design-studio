import type { PipelineStage, PipelineStageInfo, Gate, GateContext, PipelineGateCheckResult } from './types';

// ─── Stage Definitions ───────────────────────────────────────

export const PIPELINE_STAGES: PipelineStageInfo[] = [
  {
    id: 'draft',
    label: 'Draft',
    description: 'Work in progress. Not ready for review.',
  },
  {
    id: 'design-review',
    label: 'Design Review',
    description: 'Ready for team feedback and critique.',
  },
  {
    id: 'feedback-approved',
    label: 'Approved',
    description: 'Feedback addressed. Approved for export.',
  },
  {
    id: 'export-ready',
    label: 'Export Ready',
    description: 'Tokens resolved, a11y passed. Ready to export code.',
  },
  {
    id: 'shipped',
    label: 'Shipped',
    description: 'Exported and handed off to development.',
  },
];

export const STAGE_COLORS: Record<PipelineStage, string> = {
  'draft': '#6b7280',
  'design-review': '#3b82f6',
  'feedback-approved': '#f59e0b',
  'export-ready': '#10b981',
  'shipped': '#8b5cf6',
};

// ─── Gate Definitions ────────────────────────────────────────

const GATES: Gate[] = [
  // draft -> design-review
  {
    id: 'has-components',
    name: 'Has Components',
    stage: 'draft',
    required: true,
    check: (ctx: GateContext) => ({
      passed: ctx.componentCount > 0,
      message: ctx.componentCount > 0
        ? `${ctx.componentCount} components on canvas`
        : 'Add at least one component to the canvas',
    }),
  },

  // design-review -> feedback-approved
  {
    id: 'has-feedback',
    name: 'Has Feedback',
    stage: 'design-review',
    required: true,
    check: (ctx: GateContext) => ({
      passed: ctx.commentCount >= 1,
      message: ctx.commentCount >= 1
        ? `${ctx.commentCount} comments received`
        : 'At least 1 feedback comment required',
    }),
  },
  {
    id: 'no-blocking-comments',
    name: 'No Blockers',
    stage: 'design-review',
    required: true,
    check: (ctx: GateContext) => ({
      passed: ctx.unresolvedBlockingComments === 0,
      message: ctx.unresolvedBlockingComments === 0
        ? 'No unresolved blocking comments'
        : `${ctx.unresolvedBlockingComments} blocking comments to resolve`,
    }),
  },

  // feedback-approved -> export-ready
  {
    id: 'a11y-pass',
    name: 'A11y Check',
    stage: 'feedback-approved',
    required: true,
    check: (ctx: GateContext) => ({
      passed: ctx.a11yScore >= 80,
      message: ctx.a11yScore >= 80
        ? `A11y score: ${ctx.a11yScore}/100`
        : `A11y score ${ctx.a11yScore}/100 — needs 80+`,
    }),
  },
  {
    id: 'no-urgent-tasks',
    name: 'No Urgent Tasks',
    stage: 'feedback-approved',
    required: true,
    check: (ctx: GateContext) => ({
      passed: ctx.openUrgentTasks === 0,
      message: ctx.openUrgentTasks === 0
        ? 'No open urgent tasks'
        : `${ctx.openUrgentTasks} urgent tasks remaining`,
    }),
  },

  // export-ready -> shipped (optional gates only)
  {
    id: 'all-tasks-done',
    name: 'Tasks Complete',
    stage: 'export-ready',
    required: false,
    check: (ctx: GateContext) => ({
      passed: ctx.openTasks === 0,
      message: ctx.openTasks === 0
        ? 'All tasks complete'
        : `${ctx.openTasks} tasks still open`,
    }),
  },
];

// ─── Gate Checker ────────────────────────────────────────────

const STAGE_ORDER: PipelineStage[] = [
  'draft',
  'design-review',
  'feedback-approved',
  'export-ready',
  'shipped',
];

/** Check all gates for the current stage and determine if the screen can advance. */
export function checkPipelineGates(
  currentStage: PipelineStage,
  context: GateContext,
): PipelineGateCheckResult {
  const stageGates = GATES.filter((g) => g.stage === currentStage);
  const required: Array<{ gate: Gate; result: ReturnType<Gate['check']> }> = [];
  const optional: Array<{ gate: Gate; result: ReturnType<Gate['check']> }> = [];

  for (const gate of stageGates) {
    const result = gate.check(context);
    if (gate.required) {
      required.push({ gate, result });
    } else {
      optional.push({ gate, result });
    }
  }

  const allRequiredPassed = required.every((r) => r.result.passed);
  const idx = STAGE_ORDER.indexOf(currentStage);
  const targetStage = idx < STAGE_ORDER.length - 1 ? STAGE_ORDER[idx + 1]! : null;

  return {
    canAdvance: allRequiredPassed && targetStage !== null,
    targetStage,
    requiredGates: required,
    optionalGates: optional,
  };
}
