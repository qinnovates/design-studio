import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { NodePropertyOverrides } from '@design-studio/interactions';
import { generateId } from '@design-studio/canvas';
import type {
  StateMachine,
  InteractionState,
  Transition,
  Variable,
  InteractionAction,
  InteractionEventType,
  RuntimeEvent,
  TransitionResult,
} from '@design-studio/interactions';
import { StateMachineEngine, ActionExecutor, VariableStore } from '@design-studio/interactions';

// ─── Store Types ─────────────────────────────────────────────

interface InteractionStoreState {
  // Data
  stateMachines: Record<string, StateMachine>;
  activeStateMachineId: string | null;
  selectedStateId: string | null;
  selectedTransitionId: string | null;

  // Preview runtime
  isPreviewActive: boolean;
  previewCurrentStateId: string | null;
  runtimeVariables: Record<string, unknown>;
  previewNodeOverrides: Record<string, NodePropertyOverrides>;
  previewLog: { timestamp: number; event: string; from: string; to: string }[];

  // ── CRUD: State Machines ──────────────────────
  createStateMachine: (screenId: string, name: string) => string;
  deleteStateMachine: (id: string) => void;
  renameStateMachine: (id: string, name: string) => void;
  duplicateStateMachine: (id: string) => string;

  // ── CRUD: States ──────────────────────────────
  addState: (machineId: string, name: string, position?: { x: number; y: number }) => string;
  updateState: (machineId: string, stateId: string, updates: Partial<InteractionState>) => void;
  removeState: (machineId: string, stateId: string) => void;
  setInitialState: (machineId: string, stateId: string) => void;
  addNodeOverride: (machineId: string, stateId: string, nodeId: string, overrides: NodePropertyOverrides) => void;
  removeNodeOverride: (machineId: string, stateId: string, nodeId: string) => void;
  addEntryAction: (machineId: string, stateId: string, action: Omit<InteractionAction, 'id'>) => void;
  addExitAction: (machineId: string, stateId: string, action: Omit<InteractionAction, 'id'>) => void;
  removeEntryAction: (machineId: string, stateId: string, actionId: string) => void;
  removeExitAction: (machineId: string, stateId: string, actionId: string) => void;

  // ── CRUD: Transitions ─────────────────────────
  addTransition: (
    machineId: string,
    fromStateId: string,
    toStateId: string,
    event: InteractionEventType,
    sourceNodeId?: string | null,
  ) => string;
  updateTransition: (machineId: string, transitionId: string, updates: Partial<Transition>) => void;
  removeTransition: (machineId: string, transitionId: string) => void;
  addTransitionAction: (machineId: string, transitionId: string, action: Omit<InteractionAction, 'id'>) => void;
  removeTransitionAction: (machineId: string, transitionId: string, actionId: string) => void;

  // ── CRUD: Variables ───────────────────────────
  addVariable: (machineId: string, variable: Omit<Variable, 'id'>) => string;
  updateVariable: (machineId: string, variableId: string, updates: Partial<Variable>) => void;
  removeVariable: (machineId: string, variableId: string) => void;

  // ── Selection ─────────────────────────────────
  selectState: (id: string | null) => void;
  selectTransition: (id: string | null) => void;
  setActiveStateMachine: (id: string | null) => void;

  // ── Preview Runtime ───────────────────────────
  startPreview: (machineId: string) => void;
  stopPreview: () => void;
  handlePreviewEvent: (event: RuntimeEvent) => TransitionResult | null;
  resetPreview: () => void;

  // ── Getters ───────────────────────────────────
  getStateMachinesForScreen: (screenId: string) => StateMachine[];
  getTransitionsForNode: (nodeId: string) => { machine: StateMachine; transition: Transition }[];
  getStateMachineById: (id: string) => StateMachine | undefined;
}

// ─── Engine instances (outside store for performance) ────────

let activeEngine: StateMachineEngine | null = null;
const actionExecutor = new ActionExecutor();

// ─── Store ───────────────────────────────────────────────────

export const useInteractionStore = create<InteractionStoreState>()(
  immer((set, get) => ({
    // Initial state
    stateMachines: {},
    activeStateMachineId: null,
    selectedStateId: null,
    selectedTransitionId: null,
    isPreviewActive: false,
    previewCurrentStateId: null,
    runtimeVariables: {},
    previewNodeOverrides: {},
    previewLog: [],

    // ── CRUD: State Machines ──────────────────────

    createStateMachine: (screenId, name) => {
      const id = generateId();
      const initialStateId = generateId();
      const now = new Date().toISOString();

      set((state) => {
        state.stateMachines[id] = {
          id,
          name,
          screenId,
          states: {
            [initialStateId]: {
              id: initialStateId,
              name: 'Idle',
              onEnter: [],
              onExit: [],
              nodeOverrides: {},
              editorPosition: { x: 200, y: 200 },
              color: 'gray',
            },
          },
          transitions: {},
          initialStateId,
          variables: {},
          enabled: true,
          createdAt: now,
          updatedAt: now,
        };
        state.activeStateMachineId = id;
      });

      return id;
    },

    deleteStateMachine: (id) => {
      set((state) => {
        delete state.stateMachines[id];
        if (state.activeStateMachineId === id) {
          state.activeStateMachineId = null;
        }
      });
    },

    renameStateMachine: (id, name) => {
      set((state) => {
        const machine = state.stateMachines[id];
        if (machine) {
          machine.name = name;
          machine.updatedAt = new Date().toISOString();
        }
      });
    },

    duplicateStateMachine: (id) => {
      const machine = get().stateMachines[id];
      if (!machine) return '';

      // Deep clone via JSON to escape immer draft types
      const clone: StateMachine = JSON.parse(JSON.stringify(machine));
      const newId = generateId();
      const now = new Date().toISOString();

      // Remap all IDs
      const stateIdMap: Record<string, string> = {};
      const transitionIdMap: Record<string, string> = {};
      const variableIdMap: Record<string, string> = {};

      for (const stateId of Object.keys(clone.states)) {
        stateIdMap[stateId] = generateId();
      }
      for (const transId of Object.keys(clone.transitions)) {
        transitionIdMap[transId] = generateId();
      }
      for (const varId of Object.keys(clone.variables)) {
        variableIdMap[varId] = generateId();
      }

      const newStates: Record<string, InteractionState> = {};
      for (const [oldId, state] of Object.entries(clone.states)) {
        const newStateId = stateIdMap[oldId]!;
        newStates[newStateId] = { ...state, id: newStateId };
      }

      const newTransitions: Record<string, Transition> = {};
      for (const [oldId, trans] of Object.entries(clone.transitions)) {
        const newTransId = transitionIdMap[oldId]!;
        newTransitions[newTransId] = {
          ...trans,
          id: newTransId,
          fromStateId: stateIdMap[trans.fromStateId]!,
          toStateId: stateIdMap[trans.toStateId]!,
        };
      }

      const newVariables: Record<string, Variable> = {};
      for (const [oldId, variable] of Object.entries(clone.variables)) {
        const newVarId = variableIdMap[oldId]!;
        newVariables[newVarId] = { ...variable, id: newVarId };
      }

      set((s) => {
        s.stateMachines[newId] = {
          id: newId,
          name: `${clone.name} (copy)`,
          screenId: clone.screenId,
          states: newStates,
          transitions: newTransitions,
          initialStateId: stateIdMap[clone.initialStateId]!,
          variables: newVariables,
          enabled: true,
          createdAt: now,
          updatedAt: now,
        };
      });

      return newId;
    },

    // ── CRUD: States ──────────────────────────────

    addState: (machineId, name, position) => {
      const id = generateId();
      set((state) => {
        const machine = state.stateMachines[machineId];
        if (!machine) return;
        machine.states[id] = {
          id,
          name,
          onEnter: [],
          onExit: [],
          nodeOverrides: {},
          editorPosition: position ?? { x: 300, y: 300 },
          color: 'blue',
        };
        machine.updatedAt = new Date().toISOString();
      });
      return id;
    },

    updateState: (machineId, stateId, updates) => {
      set((state) => {
        const machine = state.stateMachines[machineId];
        if (!machine?.states[stateId]) return;
        Object.assign(machine.states[stateId], updates);
        machine.updatedAt = new Date().toISOString();
      });
    },

    removeState: (machineId, stateId) => {
      set((state) => {
        const machine = state.stateMachines[machineId];
        if (!machine) return;
        if (machine.initialStateId === stateId) return; // Can't remove initial state
        delete machine.states[stateId];
        // Remove transitions to/from this state
        for (const tid of Object.keys(machine.transitions)) {
          const trans = machine.transitions[tid];
          if (trans && (trans.fromStateId === stateId || trans.toStateId === stateId)) {
            delete machine.transitions[tid];
          }
        }
        machine.updatedAt = new Date().toISOString();
      });
    },

    setInitialState: (machineId, stateId) => {
      set((state) => {
        const machine = state.stateMachines[machineId];
        if (!machine?.states[stateId]) return;
        machine.initialStateId = stateId;
        machine.updatedAt = new Date().toISOString();
      });
    },

    addNodeOverride: (machineId, stateId, nodeId, overrides) => {
      set((state) => {
        const machine = state.stateMachines[machineId];
        if (!machine?.states[stateId]) return;
        machine.states[stateId].nodeOverrides[nodeId] = {
          ...machine.states[stateId].nodeOverrides[nodeId],
          ...overrides,
        };
        machine.updatedAt = new Date().toISOString();
      });
    },

    removeNodeOverride: (machineId, stateId, nodeId) => {
      set((state) => {
        const machine = state.stateMachines[machineId];
        if (!machine?.states[stateId]) return;
        delete machine.states[stateId].nodeOverrides[nodeId];
        machine.updatedAt = new Date().toISOString();
      });
    },

    addEntryAction: (machineId, stateId, action) => {
      set((state) => {
        const machine = state.stateMachines[machineId];
        if (!machine?.states[stateId]) return;
        machine.states[stateId].onEnter.push({ ...action, id: generateId() });
        machine.updatedAt = new Date().toISOString();
      });
    },

    addExitAction: (machineId, stateId, action) => {
      set((state) => {
        const machine = state.stateMachines[machineId];
        if (!machine?.states[stateId]) return;
        machine.states[stateId].onExit.push({ ...action, id: generateId() });
        machine.updatedAt = new Date().toISOString();
      });
    },

    removeEntryAction: (machineId, stateId, actionId) => {
      set((state) => {
        const machine = state.stateMachines[machineId];
        if (!machine?.states[stateId]) return;
        const s = machine.states[stateId];
        s.onEnter = s.onEnter.filter(
          (a: InteractionAction) => a.id !== actionId,
        );
        machine.updatedAt = new Date().toISOString();
      });
    },

    removeExitAction: (machineId, stateId, actionId) => {
      set((state) => {
        const machine = state.stateMachines[machineId];
        if (!machine?.states[stateId]) return;
        const s = machine.states[stateId];
        s.onExit = s.onExit.filter(
          (a: InteractionAction) => a.id !== actionId,
        );
        machine.updatedAt = new Date().toISOString();
      });
    },

    // ── CRUD: Transitions ─────────────────────────

    addTransition: (machineId, fromStateId, toStateId, event, sourceNodeId = null) => {
      const id = generateId();
      set((state) => {
        const machine = state.stateMachines[machineId];
        if (!machine) return;
        machine.transitions[id] = {
          id,
          fromStateId,
          toStateId,
          event,
          sourceNodeId: sourceNodeId ?? null,
          actions: [],
          debounceMs: 0,
        };
        machine.updatedAt = new Date().toISOString();
      });
      return id;
    },

    updateTransition: (machineId, transitionId, updates) => {
      set((state) => {
        const machine = state.stateMachines[machineId];
        if (!machine?.transitions[transitionId]) return;
        Object.assign(machine.transitions[transitionId], updates);
        machine.updatedAt = new Date().toISOString();
      });
    },

    removeTransition: (machineId, transitionId) => {
      set((state) => {
        const machine = state.stateMachines[machineId];
        if (!machine) return;
        delete machine.transitions[transitionId];
        machine.updatedAt = new Date().toISOString();
      });
    },

    addTransitionAction: (machineId, transitionId, action) => {
      set((state) => {
        const machine = state.stateMachines[machineId];
        if (!machine?.transitions[transitionId]) return;
        machine.transitions[transitionId].actions.push({ ...action, id: generateId() });
        machine.updatedAt = new Date().toISOString();
      });
    },

    removeTransitionAction: (machineId, transitionId, actionId) => {
      set((state) => {
        const machine = state.stateMachines[machineId];
        if (!machine?.transitions[transitionId]) return;
        const t = machine.transitions[transitionId];
        t.actions = t.actions.filter((a: InteractionAction) => a.id !== actionId);
        machine.updatedAt = new Date().toISOString();
      });
    },

    // ── CRUD: Variables ───────────────────────────

    addVariable: (machineId, variable) => {
      const id = generateId();
      set((state) => {
        const machine = state.stateMachines[machineId];
        if (!machine) return;
        machine.variables[id] = { ...variable, id };
        machine.updatedAt = new Date().toISOString();
      });
      return id;
    },

    updateVariable: (machineId, variableId, updates) => {
      set((state) => {
        const machine = state.stateMachines[machineId];
        if (!machine?.variables[variableId]) return;
        Object.assign(machine.variables[variableId], updates);
        machine.updatedAt = new Date().toISOString();
      });
    },

    removeVariable: (machineId, variableId) => {
      set((state) => {
        const machine = state.stateMachines[machineId];
        if (!machine) return;
        delete machine.variables[variableId];
        machine.updatedAt = new Date().toISOString();
      });
    },

    // ── Selection ─────────────────────────────────

    selectState: (id) => {
      set((state) => {
        state.selectedStateId = id;
        state.selectedTransitionId = null;
      });
    },

    selectTransition: (id) => {
      set((state) => {
        state.selectedTransitionId = id;
        state.selectedStateId = null;
      });
    },

    setActiveStateMachine: (id) => {
      set((state) => {
        state.activeStateMachineId = id;
        state.selectedStateId = null;
        state.selectedTransitionId = null;
      });
    },

    // ── Preview Runtime ───────────────────────────

    startPreview: (machineId) => {
      const machine = get().stateMachines[machineId];
      if (!machine) return;

      activeEngine = new StateMachineEngine(machine);

      set((state) => {
        state.isPreviewActive = true;
        state.previewCurrentStateId = machine.initialStateId;
        state.runtimeVariables = activeEngine!.vars.snapshot();
        state.previewNodeOverrides = activeEngine!.getNodeOverrides();
        state.previewLog = [];
      });
    },

    stopPreview: () => {
      activeEngine = null;
      set((state) => {
        state.isPreviewActive = false;
        state.previewCurrentStateId = null;
        state.runtimeVariables = {};
        state.previewNodeOverrides = {};
      });
    },

    handlePreviewEvent: (event) => {
      if (!activeEngine) return null;

      const result = activeEngine.processEvent(event);
      if (!result) return null;

      set((state) => {
        state.previewCurrentStateId = result.toState.id;
        state.runtimeVariables = activeEngine!.vars.snapshot();
        state.previewNodeOverrides = activeEngine!.getNodeOverrides();
        state.previewLog.push({
          timestamp: Date.now(),
          event: event.type,
          from: result.fromState.name,
          to: result.toState.name,
        });
      });

      return result;
    },

    resetPreview: () => {
      if (!activeEngine) return;
      activeEngine.reset();
      set((state) => {
        const machine = state.stateMachines[state.activeStateMachineId!];
        if (!machine) return;
        state.previewCurrentStateId = machine.initialStateId;
        state.runtimeVariables = activeEngine!.vars.snapshot();
        state.previewNodeOverrides = activeEngine!.getNodeOverrides();
        state.previewLog = [];
      });
    },

    // ── Getters ───────────────────────────────────

    getStateMachinesForScreen: (screenId) => {
      return Object.values(get().stateMachines).filter((m) => m.screenId === screenId);
    },

    getTransitionsForNode: (nodeId) => {
      const results: { machine: StateMachine; transition: Transition }[] = [];
      const machines = get().stateMachines;
      for (const machineId of Object.keys(machines)) {
        const machine = machines[machineId]!;
        const transitions = machine.transitions;
        for (const transId of Object.keys(transitions)) {
          const transition = transitions[transId]!;
          if (transition.sourceNodeId === nodeId) {
            results.push({ machine, transition });
          }
        }
      }
      return results;
    },

    getStateMachineById: (id) => {
      return get().stateMachines[id];
    },
  })),
);
