'use client';

import { useState } from 'react';
import { useInteractionStore } from '@/stores/interactionStore';
import type { VariableType } from '@design-studio/interactions';

const TYPE_OPTIONS: { value: VariableType; label: string; defaultVal: string }[] = [
  { value: 'number', label: 'Number', defaultVal: '0' },
  { value: 'boolean', label: 'Boolean', defaultVal: 'false' },
  { value: 'string', label: 'String', defaultVal: '""' },
  { value: 'set', label: 'Set (array)', defaultVal: '[]' },
];

interface VariableManagerProps {
  machineId: string;
}

export function VariableManager({ machineId }: VariableManagerProps) {
  const { stateMachines, addVariable, updateVariable, removeVariable, runtimeVariables, isPreviewActive } =
    useInteractionStore();

  const machine = stateMachines[machineId];
  if (!machine) return null;

  const variables = Object.values(machine.variables);

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<VariableType>('number');
  const [newDefault, setNewDefault] = useState('0');
  const [newScope, setNewScope] = useState<'screen' | 'global'>('screen');

  const handleAdd = () => {
    if (!newName.trim()) return;

    let parsedDefault: unknown = newDefault;
    try {
      parsedDefault = JSON.parse(newDefault);
    } catch {
      // Keep as string
    }

    addVariable(machineId, {
      name: newName.trim(),
      type: newType,
      defaultValue: parsedDefault,
      scope: newScope,
      screenId: machine.screenId,
    });

    setIsAdding(false);
    setNewName('');
    setNewDefault('0');
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
          Variables ({variables.length})
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

      {/* Variable list */}
      {variables.map((v) => (
        <div
          key={v.id}
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
          <span style={{ color: '#a855f7', fontWeight: 500 }}>{v.name}</span>
          <span
            style={{
              fontSize: 9,
              padding: '1px 4px',
              borderRadius: 3,
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.3)',
            }}
          >
            {v.type}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>
            = {JSON.stringify(v.defaultValue)}
          </span>

          {/* Runtime value during preview */}
          {isPreviewActive && runtimeVariables[v.name] !== undefined && (
            <span
              style={{
                fontSize: 10,
                padding: '1px 4px',
                borderRadius: 3,
                background: 'rgba(34,197,94,0.15)',
                color: '#22c55e',
                marginLeft: 'auto',
              }}
            >
              {JSON.stringify(runtimeVariables[v.name])}
            </span>
          )}

          {!isPreviewActive && (
            <>
              <span style={{ flex: 1 }} />
              <span
                style={{
                  fontSize: 9,
                  color: v.scope === 'global' ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.2)',
                }}
              >
                {v.scope}
              </span>
              <button
                onClick={() => removeVariable(machineId, v.id)}
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
            </>
          )}
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
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Variable name (e.g. score, tappedDots)"
            style={inputStyle}
          />
          <div style={{ display: 'flex', gap: 4 }}>
            <select
              value={newType}
              onChange={(e) => {
                const t = e.target.value as VariableType;
                setNewType(t);
                setNewDefault(TYPE_OPTIONS.find((o) => o.value === t)?.defaultVal ?? '0');
              }}
              style={{ ...selectStyle, flex: 1 }}
            >
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={newScope}
              onChange={(e) => setNewScope(e.target.value as 'screen' | 'global')}
              style={{ ...selectStyle, flex: 1 }}
            >
              <option value="screen">Screen</option>
              <option value="global">Global</option>
            </select>
          </div>
          <input
            value={newDefault}
            onChange={(e) => setNewDefault(e.target.value)}
            placeholder="Default value"
            style={inputStyle}
          />
          <button onClick={handleAdd} style={addButtonStyle}>
            Add Variable
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
