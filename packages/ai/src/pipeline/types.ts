// ─── Pipeline Stages ─────────────────────────────────────────

export type PipelineStage =
  | 'draft'
  | 'design-review'
  | 'feedback-approved'
  | 'export-ready'
  | 'shipped';

export interface PipelineStageInfo {
  id: PipelineStage;
  label: string;
  description: string;
}

// ─── Gates ───────────────────────────────────────────────────

export interface GateResult {
  passed: boolean;
  message: string;
}

export interface Gate {
  id: string;
  name: string;
  stage: PipelineStage;
  required: boolean;
  check: (context: GateContext) => GateResult;
}

export interface GateContext {
  screenId: string;
  a11yScore: number;
  feedbackScore: number;
  commentCount: number;
  unresolvedBlockingComments: number;
  approvalCount: number;
  requiredApprovals: number;
  openUrgentTasks: number;
  openTasks: number;
  componentCount: number;
}

export interface PipelineGateCheckResult {
  canAdvance: boolean;
  targetStage: PipelineStage | null;
  requiredGates: Array<{ gate: Gate; result: GateResult }>;
  optionalGates: Array<{ gate: Gate; result: GateResult }>;
}
