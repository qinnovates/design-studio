import type { Variable } from '../types/StateMachine';

/**
 * Runtime variable store for state machine execution.
 * Manages typed variables with scope awareness.
 */
export class VariableStore {
  private values: Map<string, unknown> = new Map();
  private definitions: Map<string, Variable> = new Map();

  /** Load variable definitions and set defaults */
  initialize(variables: Record<string, Variable>): void {
    this.values.clear();
    this.definitions.clear();
    for (const v of Object.values(variables)) {
      this.definitions.set(v.name, v);
      this.values.set(v.name, structuredClone(v.defaultValue));
    }
  }

  /** Reset all variables to defaults */
  reset(): void {
    for (const [name, def] of this.definitions) {
      this.values.set(name, structuredClone(def.defaultValue));
    }
  }

  /** Reset only screen-scoped variables for a given screen */
  resetScreen(screenId: string): void {
    for (const [name, def] of this.definitions) {
      if (def.scope === 'screen' && def.screenId === screenId) {
        this.values.set(name, structuredClone(def.defaultValue));
      }
    }
  }

  get(name: string): unknown {
    return this.values.get(name);
  }

  set(name: string, value: unknown): void {
    this.values.set(name, value);
  }

  increment(name: string, delta: number = 1): void {
    const current = this.values.get(name);
    if (typeof current === 'number') {
      this.values.set(name, current + delta);
    }
  }

  decrement(name: string, delta: number = 1): void {
    const current = this.values.get(name);
    if (typeof current === 'number') {
      this.values.set(name, current - delta);
    }
  }

  addToSet(name: string, value: unknown): void {
    const current = this.values.get(name);
    if (Array.isArray(current)) {
      if (!current.includes(value)) {
        this.values.set(name, [...current, value]);
      }
    }
  }

  removeFromSet(name: string, value: unknown): void {
    const current = this.values.get(name);
    if (Array.isArray(current)) {
      this.values.set(name, current.filter((v) => v !== value));
    }
  }

  clearSet(name: string): void {
    const current = this.values.get(name);
    if (Array.isArray(current)) {
      this.values.set(name, []);
    }
  }

  /** Check if a set variable contains a value */
  setContains(name: string, value: unknown): boolean {
    const current = this.values.get(name);
    if (Array.isArray(current)) {
      return current.includes(value);
    }
    return false;
  }

  /** Get a snapshot of all current values */
  snapshot(): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [name, value] of this.values) {
      result[name] = structuredClone(value);
    }
    return result;
  }

  /** Load from a snapshot */
  loadSnapshot(snapshot: Record<string, unknown>): void {
    this.values.clear();
    for (const [name, value] of Object.entries(snapshot)) {
      this.values.set(name, structuredClone(value));
    }
  }
}
