'use client';

import { useInteractionStore } from '@/stores/interactionStore';
import type { InteractionEventType } from '@design-studio/interactions';
import { ActionListEditor } from './ActionListEditor';
import { ConditionEditor } from './ConditionEditor';
import { VariableManager } from './VariableManager';

const EVENT_OPTIONS: { value: InteractionEventType; label: string }[] = [
  { value: 'tap', label: 'Tap' },
  { value: 'double-tap', label: 'Double Tap' },
  { value: 'swipe-left', label: 'Swipe Left' },
  { value: 'swipe-right', label: 'Swipe Right' },
  { value: 'swipe-up', label: 'Swipe Up' },
  { value: 'swipe-down', label: 'Swipe Down' },
  { value: 'hold', label: 'Hold (long press)' },
  { value: 'hover-enter', label: 'Hover Enter' },
  { value: 'hover-leave', label: 'Hover Leave' },
  { value: 'timer', label: 'Timer' },
  { value: 'state-change', label: 'State Change' },
  { value: 'variable-change', label: 'Variable Change' },
];

const COLOR_OPTIONS = ['gray', 'blue', 'green', 'orange', 'red', 'purple'] as const;

export function InteractionInspector() {
  const {
    stateMachines,
    activeStateMachineId,
    selectedStateId,
    selectedTransitionId,
    isPreviewActive,
    previewLog,
    updateState,
    updateTransition,
    addEntryAction,
    addExitAction,
    removeEntryAction,
    removeExitAction,
    addTransitionAction,
    removeTransitionAction,
  } = useInteractionStore();

  const machine = activeStateMachineId ? stateMachines[activeStateMachineId] : null;

  if (!machine) {
    return (
      <div style={{ padding: 16, color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
        No state machine selected
      </div>
    );
  }

  // Preview log view
  if (isPreviewActive) {
    return (
      <div style={{ padding: 12, overflowY: 'auto', maxHeight: '100%' }}>
        <SectionHeader>Preview Log</SectionHeader>
        <VariableManager machineId={machine.id} />
        <div style={{ marginTop: 8 }}>
          {previewLog.length === 0 ? (
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', padding: 8 }}>
              Interact with elements to see transitions...
            </div>
          ) : (
            previewLog
              .slice()
              .reverse()
              .map((entry, i) => (
                <div
                  key={i}
                  style={{
                    padding: '4px 6px',
                    marginBottom: 2,
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 4,
                    fontSize: 10,
                    display: 'flex',
                    gap: 4,
                  }}
                >
                  <span style={{ color: '#3b82f6' }}>{entry.event}</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)' }}>{entry.from}</span>
                  <span style={{ color: 'rgba(255,255,255,0.2)' }}>{'→'}</span>
                  <span style={{ color: '#22c55e' }}>{entry.to}</span>
                </div>
              ))
          )}
        </div>
      </div>
    );
  }

  // State editing
  if (selectedStateId) {
    const state = machine.states[selectedStateId];
    if (!state) return null;

    return (
      <div style={{ padding: 12, overflowY: 'auto', maxHeight: '100%' }}>
        <SectionHeader>State</SectionHeader>

        <FieldGroup label="Name">
          <input
            value={state.name}
            onChange={(e) =>
              updateState(machine.id, state.id, { name: e.target.value })
            }
            style={inputStyle}
          />
        </FieldGroup>

        <FieldGroup label="Color">
          <div style={{ display: 'flex', gap: 4 }}>
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c}
                onClick={() => updateState(machine.id, state.id, { color: c })}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: state.color === c ? '2px solid #fff' : '2px solid transparent',
                  background: {
                    gray: '#6b7280',
                    blue: '#3b82f6',
                    green: '#22c55e',
                    orange: '#f97316',
                    red: '#ef4444',
                    purple: '#a855f7',
                  }[c],
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        </FieldGroup>

        <div style={{ marginTop: 12 }}>
          <ActionListEditor
            label="Entry Actions"
            actions={state.onEnter}
            onAdd={(action) => addEntryAction(machine.id, state.id, action)}
            onRemove={(actionId) => removeEntryAction(machine.id, state.id, actionId)}
          />
        </div>

        <ActionListEditor
          label="Exit Actions"
          actions={state.onExit}
          onAdd={(action) => addExitAction(machine.id, state.id, action)}
          onRemove={(actionId) => removeExitAction(machine.id, state.id, actionId)}
        />

        <SectionHeader>Node Overrides ({Object.keys(state.nodeOverrides).length})</SectionHeader>
        {Object.entries(state.nodeOverrides).map(([nodeId, overrides]) => (
          <div
            key={nodeId}
            style={{
              padding: '4px 6px',
              marginBottom: 2,
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 4,
              fontSize: 11,
            }}
          >
            <span style={{ color: '#3b82f6' }}>{nodeId}</span>
            <span style={{ color: 'rgba(255,255,255,0.3)', marginLeft: 4 }}>
              {Object.keys(overrides).join(', ')}
            </span>
          </div>
        ))}

        <div style={{ marginTop: 16 }}>
          <VariableManager machineId={machine.id} />
        </div>
      </div>
    );
  }

  // Transition editing
  if (selectedTransitionId) {
    const transition = machine.transitions[selectedTransitionId];
    if (!transition) return null;

    const variableNames = Object.values(machine.variables).map((v) => v.name);

    return (
      <div style={{ padding: 12, overflowY: 'auto', maxHeight: '100%' }}>
        <SectionHeader>Transition</SectionHeader>

        <FieldGroup label="From">
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
            {machine.states[transition.fromStateId]?.name ?? 'Unknown'}
          </span>
        </FieldGroup>

        <FieldGroup label="To">
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
            {machine.states[transition.toStateId]?.name ?? 'Unknown'}
          </span>
        </FieldGroup>

        <FieldGroup label="Event">
          <select
            value={transition.event}
            onChange={(e) =>
              updateTransition(machine.id, transition.id, {
                event: e.target.value as InteractionEventType,
              })
            }
            style={selectStyle}
          >
            {EVENT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </FieldGroup>

        <FieldGroup label="Source Node ID">
          <input
            value={transition.sourceNodeId ?? ''}
            onChange={(e) =>
              updateTransition(machine.id, transition.id, {
                sourceNodeId: e.target.value || null,
              })
            }
            placeholder="Any node (leave empty)"
            style={inputStyle}
          />
        </FieldGroup>

        <FieldGroup label="Debounce (ms)">
          <input
            type="number"
            value={transition.debounceMs}
            onChange={(e) =>
              updateTransition(machine.id, transition.id, {
                debounceMs: Number(e.target.value),
              })
            }
            style={inputStyle}
          />
        </FieldGroup>

        <div style={{ marginTop: 12 }}>
          <ConditionEditor
            guard={transition.guard}
            onChange={(guard) =>
              updateTransition(machine.id, transition.id, { guard })
            }
            variableNames={variableNames}
          />
        </div>

        <ActionListEditor
          label="Transition Actions"
          actions={transition.actions}
          onAdd={(action) => addTransitionAction(machine.id, transition.id, action)}
          onRemove={(actionId) => removeTransitionAction(machine.id, transition.id, actionId)}
        />
      </div>
    );
  }

  // Nothing selected — show overview
  return (
    <div style={{ padding: 12, overflowY: 'auto', maxHeight: '100%' }}>
      <SectionHeader>{machine.name}</SectionHeader>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
        {Object.keys(machine.states).length} states, {Object.keys(machine.transitions).length}{' '}
        transitions, {Object.keys(machine.variables).length} variables
      </div>
      <VariableManager machineId={machine.id} />
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 12 }}>
        Select a state or transition to edit it
      </div>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        color: 'rgba(255,255,255,0.5)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 3 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  fontSize: 12,
  width: '100%',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 4,
  color: 'rgba(255,255,255,0.8)',
  padding: '5px 8px',
  outline: 'none',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
};
