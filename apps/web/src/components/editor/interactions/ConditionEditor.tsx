'use client';

import { useState } from 'react';
import type { ConditionGroup, Condition, ConditionOperator } from '@design-studio/interactions';

const OPERATORS: { value: ConditionOperator; label: string }[] = [
  { value: 'eq', label: '=' },
  { value: 'neq', label: '!=' },
  { value: 'gt', label: '>' },
  { value: 'lt', label: '<' },
  { value: 'gte', label: '>=' },
  { value: 'lte', label: '<=' },
  { value: 'contains', label: 'contains' },
  { value: 'not-contains', label: 'not contains' },
  { value: 'is-empty', label: 'is empty' },
  { value: 'is-not-empty', label: 'is not empty' },
];

interface ConditionEditorProps {
  guard?: ConditionGroup;
  onChange: (guard: ConditionGroup | undefined) => void;
  variableNames: string[];
}

export function ConditionEditor({ guard, onChange, variableNames }: ConditionEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newOperand, setNewOperand] = useState('');
  const [newOperator, setNewOperator] = useState<ConditionOperator>('eq');
  const [newValue, setNewValue] = useState('');

  const conditions = guard?.conditions ?? [];
  const logic = guard?.logic ?? 'and';

  const handleAddCondition = () => {
    if (!newOperand.trim()) return;

    let parsedValue: unknown = newValue;
    try {
      parsedValue = JSON.parse(newValue);
    } catch {
      // Keep as string
    }

    const newCondition: Condition = {
      operand: newOperand,
      operator: newOperator,
      value: parsedValue,
    };

    onChange({
      logic,
      conditions: [...conditions, newCondition],
    });

    setIsAdding(false);
    setNewOperand('');
    setNewValue('');
  };

  const handleRemoveCondition = (index: number) => {
    const updated = conditions.filter((_, i) => i !== index);
    if (updated.length === 0) {
      onChange(undefined);
    } else {
      onChange({ logic, conditions: updated });
    }
  };

  const handleToggleLogic = () => {
    if (conditions.length > 0) {
      onChange({ logic: logic === 'and' ? 'or' : 'and', conditions });
    }
  };

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
          Guard Conditions
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {conditions.length > 1 && (
            <button
              onClick={handleToggleLogic}
              style={{
                fontSize: 10,
                background: 'rgba(255,200,0,0.1)',
                border: '1px solid rgba(255,200,0,0.2)',
                color: 'rgba(255,200,0,0.7)',
                borderRadius: 4,
                padding: '2px 6px',
                cursor: 'pointer',
              }}
            >
              {logic.toUpperCase()}
            </button>
          )}
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
      </div>

      {/* Existing conditions */}
      {conditions.map((cond, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 6px',
            marginBottom: 2,
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 4,
            fontSize: 11,
          }}
        >
          {i > 0 && (
            <span style={{ color: 'rgba(255,200,0,0.5)', fontSize: 9, fontWeight: 600 }}>
              {logic.toUpperCase()}
            </span>
          )}
          <span style={{ color: '#a855f7' }}>{cond.operand}</span>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>
            {OPERATORS.find((o) => o.value === cond.operator)?.label}
          </span>
          {!['is-empty', 'is-not-empty'].includes(cond.operator) && (
            <span style={{ color: '#22c55e' }}>{JSON.stringify(cond.value)}</span>
          )}
          <span style={{ flex: 1 }} />
          <button
            onClick={() => handleRemoveCondition(i)}
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

      {conditions.length === 0 && !isAdding && (
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', padding: '4px 0' }}>
          No guards -- transition always fires
        </div>
      )}

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
          <div style={{ display: 'flex', gap: 4 }}>
            <select
              value={newOperand}
              onChange={(e) => setNewOperand(e.target.value)}
              style={{ ...selectStyle, flex: 1 }}
            >
              <option value="">Select variable...</option>
              <option value="currentState">currentState</option>
              {variableNames.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            <select
              value={newOperator}
              onChange={(e) => setNewOperator(e.target.value as ConditionOperator)}
              style={{ ...selectStyle, width: 80 }}
            >
              {OPERATORS.map((op) => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>
          </div>
          {!['is-empty', 'is-not-empty'].includes(newOperator) && (
            <input
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Value (e.g. 3, true, [1,2])"
              style={inputStyle}
            />
          )}
          <button onClick={handleAddCondition} style={addButtonStyle}>
            Add Condition
          </button>
        </div>
      )}
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
