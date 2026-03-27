import type {
  StateMachine,
  InteractionState,
  Transition,
  RuntimeEvent,
  TransitionResult,
  ConditionGroup,
  Condition,
  InteractionAction,
  EngineSnapshot,
} from '../types/StateMachine';
import { VariableStore } from './VariableStore';

/**
 * Pure state machine interpreter.
 * Takes a machine definition + event => computes next state + actions.
 * No side effects. The caller (ActionExecutor) handles mutations.
 */
export class StateMachineEngine {
  private machine: StateMachine;
  private currentStateId: string;
  private variables: VariableStore;
  private debounceTimers: Map<string, number> = new Map();

  constructor(machine: StateMachine) {
    this.machine = machine;
    this.currentStateId = machine.initialStateId;
    this.variables = new VariableStore();
    this.variables.initialize(machine.variables);
  }

  /** Get the current state */
  get currentState(): InteractionState {
    return this.machine.states[this.currentStateId]!;
  }

  /** Get the current state ID */
  get stateId(): string {
    return this.currentStateId;
  }

  /** Get the variable store for external reads */
  get vars(): VariableStore {
    return this.variables;
  }

  /**
   * Process an event and return the transition result (if any).
   * Returns null if no transition fires.
   */
  processEvent(event: RuntimeEvent): TransitionResult | null {
    // Find all transitions from the current state that match this event
    const candidates = Object.values(this.machine.transitions).filter(
      (t) =>
        t.fromStateId === this.currentStateId &&
        t.event === event.type &&
        (t.sourceNodeId === null || t.sourceNodeId === event.sourceNodeId),
    );

    // Evaluate candidates in order, first match wins
    for (const transition of candidates) {
      // Check debounce
      if (this.isDebounced(transition)) continue;

      // Evaluate guard conditions
      if (transition.guard && !this.evaluateGuard(transition.guard)) continue;

      // Transition fires
      const fromState = this.machine.states[transition.fromStateId]!;
      const toState = this.machine.states[transition.toStateId]!;

      // Collect actions: exit current state + transition actions + enter new state
      const actions: InteractionAction[] = [
        ...fromState.onExit,
        ...transition.actions,
        ...toState.onEnter,
      ];

      // Update state
      this.currentStateId = transition.toStateId;

      // Set debounce
      if (transition.debounceMs > 0) {
        this.setDebounce(transition);
      }

      return { transition, fromState, toState, actions };
    }

    return null;
  }

  /** Reset the engine to the initial state */
  reset(): void {
    this.currentStateId = this.machine.initialStateId;
    this.variables.reset();
    this.debounceTimers.clear();
  }

  /** Take a snapshot for save/restore */
  snapshot(): EngineSnapshot {
    return {
      machineId: this.machine.id,
      currentStateId: this.currentStateId,
      variables: this.variables.snapshot(),
      timestamp: Date.now(),
    };
  }

  /** Restore from a snapshot */
  restore(snapshot: EngineSnapshot): void {
    if (snapshot.machineId !== this.machine.id) return;
    this.currentStateId = snapshot.currentStateId;
    this.variables.loadSnapshot(snapshot.variables);
  }

  /** Get all node overrides for the current state */
  getNodeOverrides(): Record<string, Record<string, unknown>> {
    return this.currentState.nodeOverrides;
  }

  /** Get transitions available from the current state */
  getAvailableTransitions(): Transition[] {
    return Object.values(this.machine.transitions).filter(
      (t) => t.fromStateId === this.currentStateId,
    );
  }

  // ─── Guard Evaluation ───────────────────────────────────────

  private evaluateGuard(group: ConditionGroup): boolean {
    if (group.logic === 'and') {
      return group.conditions.every((c) => this.evaluateCondition(c));
    }
    return group.conditions.some((c) => this.evaluateCondition(c));
  }

  private evaluateCondition(condition: Condition): boolean {
    const actual = this.resolveOperand(condition.operand);
    const expected = condition.value;

    switch (condition.operator) {
      case 'eq':
        return actual === expected;
      case 'neq':
        return actual !== expected;
      case 'gt':
        return typeof actual === 'number' && typeof expected === 'number' && actual > expected;
      case 'lt':
        return typeof actual === 'number' && typeof expected === 'number' && actual < expected;
      case 'gte':
        return typeof actual === 'number' && typeof expected === 'number' && actual >= expected;
      case 'lte':
        return typeof actual === 'number' && typeof expected === 'number' && actual <= expected;
      case 'contains':
        return Array.isArray(actual) && actual.includes(expected);
      case 'not-contains':
        return Array.isArray(actual) && !actual.includes(expected);
      case 'is-empty':
        return Array.isArray(actual) ? actual.length === 0 : !actual;
      case 'is-not-empty':
        return Array.isArray(actual) ? actual.length > 0 : !!actual;
      default:
        return false;
    }
  }

  private resolveOperand(operand: string): unknown {
    if (operand === 'currentState') return this.currentStateId;
    // Everything else is a variable name
    return this.variables.get(operand);
  }

  // ─── Debounce ───────────────────────────────────────────────

  private isDebounced(transition: Transition): boolean {
    if (transition.debounceMs <= 0) return false;
    const lastFired = this.debounceTimers.get(transition.id);
    if (!lastFired) return false;
    return Date.now() - lastFired < transition.debounceMs;
  }

  private setDebounce(transition: Transition): void {
    this.debounceTimers.set(transition.id, Date.now());
  }
}
