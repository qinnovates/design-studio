import { describe, it, expect } from 'vitest';
import { contrastRatio, checkContrast } from '../checks/ColorContrast';
import { checkTouchTarget } from '../checks/TouchTarget';

describe('ColorContrast', () => {
  it('calculates contrast between black and white', () => {
    const ratio = contrastRatio('#000000', '#ffffff');
    expect(ratio).toBeCloseTo(21, 0);
  });

  it('calculates contrast between same colors', () => {
    const ratio = contrastRatio('#3b82f6', '#3b82f6');
    expect(ratio).toBeCloseTo(1, 0);
  });

  it('checks AA pass for high contrast', () => {
    const result = checkContrast('#111827', '#ffffff');
    expect(result.passesAA).toBe(true);
    expect(result.ratio).toBeGreaterThan(4.5);
  });

  it('checks AA fail for low contrast', () => {
    const result = checkContrast('#9ca3af', '#ffffff');
    expect(result.passesAA).toBe(false);
  });

  it('checks AAA requires 7:1', () => {
    const result = checkContrast('#111827', '#ffffff');
    expect(result.passesAAA).toBe(true);
    const low = checkContrast('#6b7280', '#ffffff');
    expect(low.passesAAA).toBe(false);
  });

  it('handles 3-char hex', () => {
    const ratio = contrastRatio('#000', '#fff');
    expect(ratio).toBeCloseTo(21, 0);
  });

  it('returns 0 for invalid hex', () => {
    expect(contrastRatio('invalid', '#fff')).toBe(0);
  });
});

describe('TouchTarget', () => {
  it('passes for 44x44 target', () => {
    const result = checkTouchTarget('n1', 'Button', 44, 44);
    expect(result.passes).toBe(true);
  });

  it('passes for larger target', () => {
    const result = checkTouchTarget('n1', 'Button', 100, 60);
    expect(result.passes).toBe(true);
  });

  it('fails for too small width', () => {
    const result = checkTouchTarget('n1', 'Button', 30, 44);
    expect(result.passes).toBe(false);
  });

  it('fails for too small height', () => {
    const result = checkTouchTarget('n1', 'Button', 44, 30);
    expect(result.passes).toBe(false);
  });

  it('includes descriptive message', () => {
    const result = checkTouchTarget('n1', 'Tiny', 20, 20);
    expect(result.message).toContain('too small');
    expect(result.message).toContain('44');
  });
});
