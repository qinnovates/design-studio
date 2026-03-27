'use client';

import { useState } from 'react';
import type {
  InteractionAction,
  InteractionActionType,
  EasingFunction,
} from '@design-studio/interactions';

const ACTION_TYPE_OPTIONS: { value: InteractionActionType; label: string; category: string }[] = [
  { value: 'show-element', label: 'Show Element', category: 'Element' },
  { value: 'hide-element', label: 'Hide Element', category: 'Element' },
  { value: 'toggle-element', label: 'Toggle Element', category: 'Element' },
  { value: 'change-property', label: 'Change Property', category: 'Element' },
  { value: 'navigate-screen', label: 'Navigate Screen', category: 'Navigation' },
  { value: 'play-animation', label: 'Play Animation', category: 'Visual' },
  { value: 'trigger-haptic', label: 'Trigger Haptic', category: 'Visual' },
  { value: 'set-variable', label: 'Set Variable', category: 'Variable' },
  { value: 'increment-variable', label: 'Increment', category: 'Variable' },
  { value: 'decrement-variable', label: 'Decrement', category: 'Variable' },
  { value: 'add-to-set', label: 'Add to Set', category: 'Variable' },
  { value: 'remove-from-set', label: 'Remove from Set', category: 'Variable' },
  { value: 'clear-set', label: 'Clear Set', category: 'Variable' },
  { value: 'reset-variable', label: 'Reset Variable', category: 'Variable' },
];

const EASING_OPTIONS: EasingFunction[] = ['linear', 'ease-in', 'ease-out', 'ease-in-out', 'spring'];

interface ActionListEditorProps {
  actions: InteractionAction[];
  onAdd: (action: Omit<InteractionAction, 'id'>) => void;
  onRemove: (actionId: string) => void;
  label: string;
}

export function ActionListEditor({ actions, onAdd, onRemove, label }: ActionListEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newType, setNewType] = useState<InteractionActionType>('show-element');
  const [newTargetId, setNewTargetId] = useState('');
  const [newProperty, setNewProperty] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newDelay, setNewDelay] = useState(0);
  const [newDuration, setNewDuration] = useState(0);
  const [newEasing, setNewEasing] = useState<EasingFunction>('ease-out');

  const handleAdd = () => {
    let parsedValue: unknown = newValue;
    try {
      parsedValue = JSON.parse(newValue);
    } catch {
      // Keep as string
    }

    onAdd({
      type: newType,
      targetId: newTargetId,
      property: newProperty || undefined,
      value: parsedValue,
      delay: newDelay,
      duration: newDuration,
      easing: newEasing,
    });

    setIsAdding(false);
    setNewTargetId('');
    setNewProperty('');
    setNewValue('');
    setNewDelay(0);
    setNewDuration(0);
  };

  const needsProperty = [
    'change-property',
    'set-variable',
    'increment-variable',
    'decrement-variable',
    'add-to-set',
    'remove-from-set',
    'clear-set',
    'reset-variable',
    'play-animation',
    'trigger-haptic',
  ].includes(newType);

  const needsValue = [
    'change-property',
    'set-variable',
    'increment-variable',
    'decrement-variable',
    'add-to-set',
    'remove-from-set',
    'reset-variable',
  ].includes(newType);

  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>
          {label} ({actions.length})
        </span>
        <button
          onClick={() => setIsAdding(!isAdding)}
          style={{
            fontSize: 10,
            background: 'none',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.5)',
            borderRadius: 4,
            padding: '2px 6px',
            cursor: 'pointer',
          }}
        >
          {isAdding ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {/* Existing actions */}
      {actions.map((action, i) => (
        <div
          key={action.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 6px',
            marginBottom: 2,
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 4,
            fontSize: 11,
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.3)', width: 16 }}>{i + 1}.</span>
          <span style={{ color: '#3b82f6', fontWeight: 500 }}>
            {ACTION_TYPE_OPTIONS.find((o) => o.value === action.type)?.label ?? action.type}
          </span>
          {action.property && (
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>.{action.property}</span>
          )}
          {action.delay > 0 && (
            <span style={{ color: 'rgba(255,200,0,0.5)', fontSize: 10 }}>
              +{action.delay}ms
            </span>
          )}
          <span style={{ flex: 1 }} />
          <button
            onClick={() => onRemove(action.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.2)',
              cursor: 'pointer',
              fontSize: 11,
            }}
          >
            x
          </button>
        </div>
      ))}

      {/* Add form */}
      {isAdding && (
        <div
          style={{
            padding: 8,
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            marginTop: 6,
          }}
        >
          <FieldRow label="Type">
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as InteractionActionType)}
              style={selectStyle}
            >
              {ACTION_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.category}: {opt.label}
                </option>
              ))}
            </select>
          </FieldRow>

          <FieldRow label="Target ID">
            <input
              value={newTargetId}
              onChange={(e) => setNewTargetId(e.target.value)}
              placeholder="Node or screen ID"
              style={inputStyle}
            />
          </FieldRow>

          {needsProperty && (
            <FieldRow label="Property">
              <input
                value={newProperty}
                onChange={(e) => setNewProperty(e.target.value)}
                placeholder="e.g. opacity, fill, tappedDots"
                style={inputStyle}
              />
            </FieldRow>
          )}

          {needsValue && (
            <FieldRow label="Value">
              <input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="e.g. 1, true, #ff0000"
                style={inputStyle}
              />
            </FieldRow>
          )}

          <div style={{ display: 'flex', gap: 6 }}>
            <FieldRow label="Delay (ms)" style={{ flex: 1 }}>
              <input
                type="number"
                value={newDelay}
                onChange={(e) => setNewDelay(Number(e.target.value))}
                style={inputStyle}
              />
            </FieldRow>
            <FieldRow label="Duration (ms)" style={{ flex: 1 }}>
              <input
                type="number"
                value={newDuration}
                onChange={(e) => setNewDuration(Number(e.target.value))}
                style={inputStyle}
              />
            </FieldRow>
          </div>

          <FieldRow label="Easing">
            <select
              value={newEasing}
              onChange={(e) => setNewEasing(e.target.value as EasingFunction)}
              style={selectStyle}
            >
              {EASING_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </FieldRow>

          <button onClick={handleAdd} style={addButtonStyle}>
            Add Action
          </button>
        </div>
      )}
    </div>
  );
}

function FieldRow({
  label,
  children,
  style,
}: {
  label: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, ...style }}>
      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{label}</span>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  fontSize: 11,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 4,
  color: 'rgba(255,255,255,0.8)',
  padding: '4px 6px',
  outline: 'none',
  width: '100%',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
};

const addButtonStyle: React.CSSProperties = {
  padding: '5px 0',
  fontSize: 11,
  fontWeight: 500,
  borderRadius: 4,
  border: '1px solid rgba(59,130,246,0.3)',
  background: 'rgba(59,130,246,0.1)',
  color: '#3b82f6',
  cursor: 'pointer',
};
