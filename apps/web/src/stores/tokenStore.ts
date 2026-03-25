import { create } from 'zustand';
import {
  TokenResolver,
  defaultLightTokens,
  defaultDarkTokens,
  toCssVariables,
} from '@design-studio/tokens';
import type { TokenSet } from '@design-studio/tokens';

// ─── Store Types ─────────────────────────────────────────────

interface TokenState {
  activeSetId: string;
  tokenSets: Record<string, TokenSet>;
  resolvedTokens: Record<string, string>;
  cssOutput: string;
  headingFontId: string;
  bodyFontId: string;

  initialize: () => void;
  switchTheme: (setId: string) => void;
  updateToken: (name: string, value: string) => void;
  addTokenSet: (set: TokenSet) => void;
  getResolvedValue: (nameOrAlias: string) => string;
  refreshResolved: () => void;
  setHeadingFont: (fontId: string) => void;
  setBodyFont: (fontId: string) => void;
}

// Keep resolver outside of Zustand state to avoid immer draft issues
let resolver = new TokenResolver();

export const useTokenStore = create<TokenState>()((set, get) => ({
  activeSetId: 'default-light',
  tokenSets: {},
  resolvedTokens: {},
  cssOutput: '',
  headingFontId: 'inter',
  bodyFontId: 'inter',

  initialize: () => {
    resolver = new TokenResolver();
    resolver.addTokenSet(defaultLightTokens);
    resolver.addTokenSet(defaultDarkTokens);
    resolver.setActiveSet('default-light');

    set({
      activeSetId: 'default-light',
      tokenSets: {
        'default-light': defaultLightTokens,
        'default-dark': defaultDarkTokens,
      },
      resolvedTokens: resolver.resolveAll(),
      cssOutput: toCssVariables(resolver),
    });
  },

  switchTheme: (setId) => {
    resolver.setActiveSet(setId);
    set({
      activeSetId: setId,
      resolvedTokens: resolver.resolveAll(),
      cssOutput: toCssVariables(resolver),
    });
  },

  updateToken: (name, value) => {
    resolver.updateToken(name, value);
    const state = get();
    const activeSet = state.tokenSets[state.activeSetId];
    const updatedTokenSets = { ...state.tokenSets };
    if (activeSet?.tokens[name]) {
      updatedTokenSets[state.activeSetId] = {
        ...activeSet,
        tokens: {
          ...activeSet.tokens,
          [name]: { ...activeSet.tokens[name]!, value },
        },
      };
    }
    set({
      resolvedTokens: resolver.resolveAll(),
      cssOutput: toCssVariables(resolver),
      tokenSets: updatedTokenSets,
    });
  },

  addTokenSet: (tokenSet) => {
    resolver.addTokenSet(tokenSet);
    set((state) => ({
      tokenSets: { ...state.tokenSets, [tokenSet.id]: tokenSet },
    }));
  },

  getResolvedValue: (nameOrAlias) => {
    return resolver.resolve(nameOrAlias);
  },

  refreshResolved: () => {
    set({
      resolvedTokens: resolver.resolveAll(),
      cssOutput: toCssVariables(resolver),
    });
  },

  setHeadingFont: (fontId) => set({ headingFontId: fontId }),
  setBodyFont: (fontId) => set({ bodyFontId: fontId }),
}));
