export type A11ySeverity = 'critical' | 'serious' | 'moderate' | 'minor';

export interface A11yIssue {
  id: string;
  nodeId: string;
  nodeName: string;
  severity: A11ySeverity;
  message: string;
  /** Plain English fix suggestion */
  suggestion: string;
  /** WCAG criterion reference */
  wcag?: string;
}

export interface A11yReport {
  issues: A11yIssue[];
  passes: number;
  warnings: number;
  errors: number;
  score: number; // 0-100
}

export function createReport(issues: A11yIssue[]): A11yReport {
  const errors = issues.filter((i) => i.severity === 'critical' || i.severity === 'serious').length;
  const warnings = issues.filter((i) => i.severity === 'moderate').length;
  const total = issues.length;
  const score = total === 0 ? 100 : Math.max(0, 100 - errors * 15 - warnings * 5);

  return {
    issues,
    passes: 0, // Will be calculated by the runner
    warnings,
    errors,
    score,
  };
}
