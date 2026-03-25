import { describe, it, expect, beforeEach } from 'vitest';
import { TokenResolver } from '../resolver/TokenResolver';
import type { TokenSet } from '../schema/Token';
import { isAlias, resolveAliasPath } from '../schema/Token';

const testLight: TokenSet = {
  id: 'test-light',
  name: 'Light',
  tokens: {
    'color.blue.500': { name: 'color.blue.500', value: '#3b82f6', type: 'color' },
    'color.blue.600': { name: 'color.blue.600', value: '#2563eb', type: 'color' },
    'color.action.primary': { name: 'color.action.primary', value: '{color.blue.600}', type: 'color' },
    'color.text.primary': { name: 'color.text.primary', value: '#111827', type: 'color' },
    'spacing.4': { name: 'spacing.4', value: '16px', type: 'spacing' },
  },
};

const testDark: TokenSet = {
  id: 'test-dark',
  name: 'Dark',
  tokens: {
    'color.blue.500': { name: 'color.blue.500', value: '#3b82f6', type: 'color' },
    'color.action.primary': { name: 'color.action.primary', value: '{color.blue.500}', type: 'color' },
    'color.text.primary': { name: 'color.text.primary', value: '#f9fafb', type: 'color' },
  },
};

describe('Token utilities', () => {
  it('detects alias references', () => {
    expect(isAlias('{color.blue.500}')).toBe(true);
    expect(isAlias('#3b82f6')).toBe(false);
    expect(isAlias('16px')).toBe(false);
  });

  it('extracts alias path', () => {
    expect(resolveAliasPath('{color.blue.500}')).toBe('color.blue.500');
  });
});

describe('TokenResolver', () => {
  let resolver: TokenResolver;

  beforeEach(() => {
    resolver = new TokenResolver();
    resolver.addTokenSet(testLight);
    resolver.setActiveSet('test-light');
  });

  describe('resolve', () => {
    it('resolves a direct value', () => {
      expect(resolver.resolve('color.blue.500')).toBe('#3b82f6');
    });

    it('resolves an alias chain', () => {
      // color.action.primary -> {color.blue.600} -> #2563eb
      expect(resolver.resolve('color.action.primary')).toBe('#2563eb');
    });

    it('resolves alias syntax with braces', () => {
      expect(resolver.resolve('{color.blue.600}')).toBe('#2563eb');
    });

    it('returns raw value for non-existent token', () => {
      expect(resolver.resolve('nonexistent')).toBe('nonexistent');
    });

    it('returns raw value for non-token string', () => {
      expect(resolver.resolve('#ff0000')).toBe('#ff0000');
    });
  });

  describe('resolveAll', () => {
    it('returns all resolved tokens', () => {
      const all = resolver.resolveAll();
      expect(all['color.blue.500']).toBe('#3b82f6');
      expect(all['color.action.primary']).toBe('#2563eb');
      expect(all['spacing.4']).toBe('16px');
    });
  });

  describe('theme switching', () => {
    it('switches active set and resolves differently', () => {
      resolver.addTokenSet(testDark);
      expect(resolver.resolve('color.action.primary')).toBe('#2563eb'); // light
      resolver.setActiveSet('test-dark');
      expect(resolver.resolve('color.action.primary')).toBe('#3b82f6'); // dark -> blue.500
      expect(resolver.resolve('color.text.primary')).toBe('#f9fafb');
    });
  });

  describe('updateToken', () => {
    it('updates a token value', () => {
      resolver.updateToken('color.blue.500', '#0000ff');
      expect(resolver.resolve('color.blue.500')).toBe('#0000ff');
    });

    it('clears cache after update', () => {
      expect(resolver.resolve('color.action.primary')).toBe('#2563eb');
      resolver.updateToken('color.blue.600', '#000000');
      expect(resolver.resolve('color.action.primary')).toBe('#000000');
    });
  });

  describe('search', () => {
    it('finds tokens by name', () => {
      const results = resolver.search('blue');
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it('returns empty for no match', () => {
      expect(resolver.search('zzzzz')).toEqual([]);
    });
  });

  describe('circular reference detection', () => {
    it('handles circular aliases without infinite loop', () => {
      const circular: TokenSet = {
        id: 'circular',
        name: 'Circular',
        tokens: {
          'a': { name: 'a', value: '{b}', type: 'color' },
          'b': { name: 'b', value: '{a}', type: 'color' },
        },
      };
      resolver.addTokenSet(circular);
      resolver.setActiveSet('circular');
      // Should not throw, should return the alias path
      const result = resolver.resolve('a');
      expect(typeof result).toBe('string');
    });
  });
});
