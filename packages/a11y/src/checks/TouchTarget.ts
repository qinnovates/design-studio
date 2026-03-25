export interface TouchTargetResult {
  nodeId: string;
  nodeName: string;
  width: number;
  height: number;
  minRequired: number;
  passes: boolean;
  message: string;
}

/** Minimum touch target size in pixels (WCAG 2.5.8) */
const MIN_TOUCH_TARGET = 44;

export function checkTouchTarget(
  nodeId: string,
  nodeName: string,
  width: number,
  height: number,
): TouchTargetResult {
  const passes = width >= MIN_TOUCH_TARGET && height >= MIN_TOUCH_TARGET;
  return {
    nodeId,
    nodeName,
    width,
    height,
    minRequired: MIN_TOUCH_TARGET,
    passes,
    message: passes
      ? `Touch target ${width}x${height}px meets minimum ${MIN_TOUCH_TARGET}px`
      : `Touch target ${width}x${height}px is too small. Minimum is ${MIN_TOUCH_TARGET}x${MIN_TOUCH_TARGET}px`,
  };
}
