'use client';

import { useState } from 'react';
import { useInteractionStore } from '@/stores/interactionStore';

interface StateMachineSidebarProps {
  screenId: string;
}

export function StateMachineSidebar({ screenId }: StateMachineSidebarProps) {
  const {
    stateMachines,
    activeStateMachineId,
    createStateMachine,
    deleteStateMachine,
    renameStateMachine,
    duplicateStateMachine,
    setActiveStateMachine,
    getStateMachinesForScreen,
  } = useInteractionStore();

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const machines = getStateMachinesForScreen(screenId);

  const handleCreate = () => {
    const name = newName.trim() || `Behavior ${machines.length + 1}`;
    createStateMachine(screenId, name);
    setNewName('');
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      renameStateMachine(id, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div
      style={{
        width: '100%',
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.5)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 4,
        }}
      >
        State Machines
      </div>

      {/* Machine list */}
      {machines.map((machine) => (
        <div
          key={machine.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 8px',
            borderRadius: 6,
            background:
              activeStateMachineId === machine.id
                ? 'rgba(59,130,246,0.15)'
                : 'rgba(255,255,255,0.03)',
            border: `1px solid ${
              activeStateMachineId === machine.id
                ? 'rgba(59,130,246,0.3)'
                : 'rgba(255,255,255,0.06)'
            }`,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onClick={() => setActiveStateMachine(machine.id)}
        >
          {/* Status dot */}
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: machine.enabled ? '#22c55e' : '#6b7280',
              flexShrink: 0,
            }}
          />

          {/* Name */}
          {editingId === machine.id ? (
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={() => handleRename(machine.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename(machine.id);
                if (e.key === 'Escape') setEditingId(null);
              }}
              autoFocus
              style={{
                flex: 1,
                fontSize: 12,
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(59,130,246,0.4)',
                borderRadius: 4,
                color: '#fff',
                padding: '2px 6px',
                outline: 'none',
              }}
            />
          ) : (
            <span
              style={{
                flex: 1,
                fontSize: 12,
                color: 'rgba(255,255,255,0.8)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              onDoubleClick={() => {
                setEditingId(machine.id);
                setEditName(machine.name);
              }}
            >
              {machine.name}
            </span>
          )}

          {/* Stats */}
          <span
            style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.3)',
              flexShrink: 0,
            }}
          >
            {Object.keys(machine.states).length}s / {Object.keys(machine.transitions).length}t
          </span>

          {/* Actions */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              duplicateStateMachine(machine.id);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.3)',
              cursor: 'pointer',
              fontSize: 12,
              padding: '0 2px',
            }}
            title="Duplicate"
          >
            +
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteStateMachine(machine.id);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.3)',
              cursor: 'pointer',
              fontSize: 12,
              padding: '0 2px',
            }}
            title="Delete"
          >
            x
          </button>
        </div>
      ))}

      {/* Create new */}
      <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New behavior..."
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCreate();
          }}
          style={{
            flex: 1,
            fontSize: 11,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 4,
            color: 'rgba(255,255,255,0.7)',
            padding: '4px 8px',
            outline: 'none',
          }}
        />
        <button
          onClick={handleCreate}
          style={{
            padding: '4px 10px',
            fontSize: 11,
            fontWeight: 500,
            borderRadius: 4,
            border: '1px solid rgba(59,130,246,0.3)',
            background: 'rgba(59,130,246,0.1)',
            color: '#3b82f6',
            cursor: 'pointer',
          }}
        >
          Add
        </button>
      </div>
    </div>
  );
}
