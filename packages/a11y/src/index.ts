// Checks
export { checkContrast, contrastRatio, type ContrastResult } from './checks/ColorContrast';
export { checkTouchTarget, type TouchTargetResult } from './checks/TouchTarget';

// Engine
export { createReport, type A11yIssue, type A11yReport, type A11ySeverity } from './engine/A11yRunner';
