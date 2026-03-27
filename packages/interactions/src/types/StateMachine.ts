/**
 * Partial node properties that can be overridden during state transitions.
 * Uses Record<string, unknown> instead of Partial<SceneNode> to avoid
 * discriminated union issues with the SceneNode type.
 */
export type NodePropertyOverrides = Record<string, unknown>;

// ─── Event Types ────────────────────────────────────────────

export type InteractionEventType =
  | 'tap'
  | 'double-tap'
  | 'swipe-left'
  | 'swipe-right'
  | 'swipe-up'
  | 'swipe-down'
  | 'hold'
  | 'hover-enter'
  | 'hover-leave'
  | 'timer'
  | 'state-change'
  | 'variable-change';

// ─── Action Types ───────────────────────────────────────────

export type InteractionActionType =
  | 'show-element'
  | 'hide-element'
  | 'toggle-element'
  | 'change-property'
  | 'navigate-screen'
  | 'play-animation'
  | 'trigger-haptic'
  | 'set-variable'
  | 'increment-variable'
  | 'decrement-variable'
  | 'add-to-set'
  | 'remove-from-set'
  | 'clear-set'
  | 'reset-variable';

export type EasingFunction =
  | 'linear'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'spring';

export interface InteractionAction {
  id: string;
  type: InteractionActionType;
  /** Target node ID (for element actions) or screen ID (for navigate) */
  targetId: string;
  /** Property path for change-property, variable name for variable ops */
  property?: string;
  /** New value or delta for increments */
  value?: unknown;
  /** Delay in ms before executing */
  delay: number;
  /** Animation duration in ms (0 = instant) */
  duration: number;
  /** Easing function */
  easing: EasingFunction;
}

// ─── Variables ──────────────────────────────────────────────

export type VariableType = 'number' | 'boolean' | 'string' | 'set';

export interface Variable {
  id: string;
  name: string;
  type: VariableType;
  defaultValue: unknown;
  /** Scope: 'screen' resets per screen, 'global' persists across screens */
  scope: 'screen' | 'global';
  /** Screen ID if scope is 'screen' */
  screenId?: string;
}

// ─── Conditions ─────────────────────────────────────────────

export type ConditionOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'lt'
  | 'gte'
  | 'lte'
  | 'contains'
  | 'not-contains'
  | 'is-empty'
  | 'is-not-empty';

export interface Condition {
  /** Variable name or special: 'event.targetNodeId', 'currentState' */
  operand: string;
  operator: ConditionOperator;
  value: unknown;
}

export interface ConditionGroup {
  logic: 'and' | 'or';
  conditions: Condition[];
}

// ─── Transition ─────────────────────────────────────────────

export interface Transition {
  id: string;
  /** Source state ID */
  fromStateId: string;
  /** Target state ID */
  toStateId: string;
  /** What triggers this transition */
  event: InteractionEventType;
  /** Which node emits the event (null = any node) */
  sourceNodeId: string | null;
  /** Guard conditions that must be met */
  guard?: ConditionGroup;
  /** Actions to run during the transition */
  actions: InteractionAction[];
  /** Debounce in ms (prevents rapid re-triggering) */
  debounceMs: number;
}

// ─── Interaction State ──────────────────────────────────────

export interface InteractionState {
  id: string;
  name: string;
  /** Entry actions run when entering this state */
  onEnter: InteractionAction[];
  /** Exit actions run when leaving this state */
  onExit: InteractionAction[];
  /** Node property overrides active in this state */
  nodeOverrides: Record<string, NodePropertyOverrides>;
  /** Position on the state machine editor canvas */
  editorPosition: { x: number; y: number };
  /** Color label for visual identification */
  color: 'gray' | 'blue' | 'green' | 'orange' | 'red' | 'purple';
}

// ─── State Machine ──────────────────────────────────────────

export interface StateMachine {
  id: string;
  name: string;
  /** Screen this state machine belongs to */
  screenId: string;
  /** All states */
  states: Record<string, InteractionState>;
  /** All transitions */
  transitions: Record<string, Transition>;
  /** Initial state ID */
  initialStateId: string;
  /** Variables defined for this machine */
  variables: Record<string, Variable>;
  /** Whether this machine is enabled in preview */
  enabled: boolean;
  /** Creation timestamp */
  createdAt: string;
  /** Last modified timestamp */
  updatedAt: string;
}

// ─── Runtime Types ──────────────────────────────────────────

export interface RuntimeEvent {
  type: InteractionEventType;
  sourceNodeId: string | null;
  timestamp: number;
  /** Extra data (swipe direction magnitude, hold duration, etc.) */
  payload?: Record<string, unknown>;
}

export interface TransitionResult {
  /** The transition that fired */
  transition: Transition;
  /** Previous state */
  fromState: InteractionState;
  /** New state */
  toState: InteractionState;
  /** Actions to execute (exit + transition + entry) */
  actions: InteractionAction[];
}

export interface EngineSnapshot {
  machineId: string;
  currentStateId: string;
  variables: Record<string, unknown>;
  timestamp: number;
}
