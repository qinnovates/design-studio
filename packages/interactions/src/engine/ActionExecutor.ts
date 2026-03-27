import type { SceneGraph } from '@design-studio/canvas';
import type { InteractionAction, NodePropertyOverrides } from '../types/StateMachine';
import { VariableStore } from './VariableStore';

/**
 * Result of executing actions against a scene graph.
 * Returns a new set of node patches (non-destructive).
 */
export interface ExecutionResult {
  /** Node property patches to apply on top of the scene graph */
  nodePatchSet: Record<string, NodePropertyOverrides>;
  /** Screen to navigate to (if a navigate action was triggered) */
  navigateToScreen: string | null;
  /** Haptic specs to trigger */
  hapticSpecs: string[];
  /** Animation specs to play */
  animations: { nodeId: string; name: string; duration: number; easing: string }[];
}

/**
 * Executes a list of InteractionActions against the scene graph + variable store.
 * Non-destructive: returns patches instead of mutating.
 */
export class ActionExecutor {
  /**
   * Execute actions and return the result.
   * Delayed actions are returned with their delay for the caller to schedule.
   */
  execute(
    actions: InteractionAction[],
    sceneGraph: SceneGraph,
    variables: VariableStore,
  ): { immediate: ExecutionResult; delayed: { action: InteractionAction; result: ExecutionResult }[] } {
    const immediate: ExecutionResult = {
      nodePatchSet: {},
      navigateToScreen: null,
      hapticSpecs: [],
      animations: [],
    };

    const delayed: { action: InteractionAction; result: ExecutionResult }[] = [];

    for (const action of actions) {
      if (action.delay > 0) {
        // Pre-compute what this action would do; caller schedules it
        const result = this.executeSingle(action, sceneGraph, variables);
        delayed.push({ action, result });
      } else {
        const result = this.executeSingle(action, sceneGraph, variables);
        this.mergeResult(immediate, result);
      }
    }

    return { immediate, delayed };
  }

  private executeSingle(
    action: InteractionAction,
    sceneGraph: SceneGraph,
    variables: VariableStore,
  ): ExecutionResult {
    const result: ExecutionResult = {
      nodePatchSet: {},
      navigateToScreen: null,
      hapticSpecs: [],
      animations: [],
    };

    switch (action.type) {
      case 'show-element': {
        const node = sceneGraph.nodes[action.targetId];
        if (node) {
          result.nodePatchSet[action.targetId] = { visible: true, opacity: 1 };
        }
        break;
      }

      case 'hide-element': {
        const node = sceneGraph.nodes[action.targetId];
        if (node) {
          result.nodePatchSet[action.targetId] = { visible: false, opacity: 0 };
        }
        break;
      }

      case 'toggle-element': {
        const node = sceneGraph.nodes[action.targetId];
        if (node) {
          result.nodePatchSet[action.targetId] = {
            visible: !node.visible,
            opacity: node.visible ? 0 : 1,
          };
        }
        break;
      }

      case 'change-property': {
        if (action.property) {
          result.nodePatchSet[action.targetId] = {
            [action.property]: action.value,
          };
        }
        break;
      }

      case 'navigate-screen': {
        result.navigateToScreen = action.targetId;
        break;
      }

      case 'play-animation': {
        result.animations.push({
          nodeId: action.targetId,
          name: action.property ?? 'default',
          duration: action.duration,
          easing: action.easing,
        });
        break;
      }

      case 'trigger-haptic': {
        result.hapticSpecs.push(action.property ?? 'default');
        break;
      }

      case 'set-variable': {
        if (action.property) {
          variables.set(action.property, action.value);
        }
        break;
      }

      case 'increment-variable': {
        if (action.property) {
          const delta = typeof action.value === 'number' ? action.value : 1;
          variables.increment(action.property, delta);
        }
        break;
      }

      case 'decrement-variable': {
        if (action.property) {
          const delta = typeof action.value === 'number' ? action.value : 1;
          variables.decrement(action.property, delta);
        }
        break;
      }

      case 'add-to-set': {
        if (action.property) {
          variables.addToSet(action.property, action.value);
        }
        break;
      }

      case 'remove-from-set': {
        if (action.property) {
          variables.removeFromSet(action.property, action.value);
        }
        break;
      }

      case 'clear-set': {
        if (action.property) {
          variables.clearSet(action.property);
        }
        break;
      }

      case 'reset-variable': {
        if (action.property) {
          // Reset to default requires knowing the definition — caller handles this
          variables.set(action.property, action.value ?? null);
        }
        break;
      }
    }

    return result;
  }

  private mergeResult(target: ExecutionResult, source: ExecutionResult): void {
    // Merge node patches (later actions override earlier for same property)
    for (const [nodeId, patch] of Object.entries(source.nodePatchSet)) {
      target.nodePatchSet[nodeId] = {
        ...target.nodePatchSet[nodeId],
        ...patch,
      };
    }

    // Last navigate wins
    if (source.navigateToScreen) {
      target.navigateToScreen = source.navigateToScreen;
    }

    target.hapticSpecs.push(...source.hapticSpecs);
    target.animations.push(...source.animations);
  }
}
