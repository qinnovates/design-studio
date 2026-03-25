import { type Token, type TokenSet, isAlias, resolveAliasPath } from '../schema/Token';

const MAX_DEPTH = 10;

export class TokenResolver {
  private tokenSets: Map<string, TokenSet> = new Map();
  private activeSetId: string | null = null;
  private resolvedCache: Map<string, string> = new Map();

  addTokenSet(set: TokenSet): void {
    this.tokenSets.set(set.id, set);
    this.clearCache();
  }

  removeTokenSet(id: string): void {
    this.tokenSets.delete(id);
    if (this.activeSetId === id) this.activeSetId = null;
    this.clearCache();
  }

  setActiveSet(id: string): void {
    if (!this.tokenSets.has(id)) {
      throw new Error(`Token set "${id}" not found`);
    }
    this.activeSetId = id;
    this.clearCache();
  }

  getActiveSet(): TokenSet | null {
    if (!this.activeSetId) return null;
    return this.tokenSets.get(this.activeSetId) ?? null;
  }

  getAllSets(): TokenSet[] {
    return Array.from(this.tokenSets.values());
  }

  /** Resolve a token value, following alias chains */
  resolve(nameOrAlias: string): string {
    const cached = this.resolvedCache.get(nameOrAlias);
    if (cached !== undefined) return cached;

    const resolved = this.resolveInternal(nameOrAlias, 0, new Set());
    this.resolvedCache.set(nameOrAlias, resolved);
    return resolved;
  }

  /** Resolve all tokens in the active set, returning a flat map */
  resolveAll(): Record<string, string> {
    const set = this.getActiveSet();
    if (!set) return {};

    const result: Record<string, string> = {};
    for (const [name] of Object.entries(set.tokens)) {
      result[name] = this.resolve(name);
    }
    return result;
  }

  /** Update a token value in the active set */
  updateToken(name: string, value: string): void {
    const set = this.getActiveSet();
    if (!set) throw new Error('No active token set');

    const existing = set.tokens[name];
    if (!existing) throw new Error(`Token "${name}" not found in active set`);

    set.tokens[name] = { ...existing, value };
    this.clearCache();
  }

  /** Get a token by name from the active set */
  getToken(name: string): Token | undefined {
    const set = this.getActiveSet();
    if (!set) return undefined;
    return set.tokens[name];
  }

  /** Search tokens by name or description */
  search(query: string): Token[] {
    const set = this.getActiveSet();
    if (!set) return [];
    const q = query.toLowerCase();
    return Object.values(set.tokens).filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.description?.toLowerCase().includes(q) ?? false),
    );
  }

  private resolveInternal(nameOrAlias: string, depth: number, visited: Set<string>): string {
    if (depth >= MAX_DEPTH) {
      console.warn(`Token alias chain exceeded max depth for "${nameOrAlias}"`);
      return nameOrAlias;
    }

    // If it's an alias like {color.primary.500}, extract the path
    const tokenName = isAlias(nameOrAlias) ? resolveAliasPath(nameOrAlias) : nameOrAlias;

    if (visited.has(tokenName)) {
      console.warn(`Circular token alias detected: "${tokenName}"`);
      return tokenName;
    }
    visited.add(tokenName);

    // Look up in active set first, then fall back to other sets
    const token = this.findToken(tokenName);
    if (!token) return nameOrAlias; // Return as-is if not found (could be a raw value)

    // If the value is itself an alias, resolve recursively
    if (isAlias(token.value)) {
      return this.resolveInternal(token.value, depth + 1, visited);
    }

    return token.value;
  }

  private findToken(name: string): Token | undefined {
    // Active set takes priority
    if (this.activeSetId) {
      const activeSet = this.tokenSets.get(this.activeSetId);
      const token = activeSet?.tokens[name];
      if (token) return token;
    }

    // Fall back to any set that has it
    for (const set of this.tokenSets.values()) {
      if (set.tokens[name]) return set.tokens[name];
    }

    return undefined;
  }

  private clearCache(): void {
    this.resolvedCache.clear();
  }
}
