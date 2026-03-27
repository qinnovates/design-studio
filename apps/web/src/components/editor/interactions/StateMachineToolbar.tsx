'use client';

import { useState } from 'react';
import { useInteractionStore } from '@/stores/interactionStore';

interface StateMachineToolbarProps {
  screenId: string;
}

export function StateMachineToolbar({ screenId }: StateMachineToolbarProps) {
  const {
    stateMachines,
    activeStateMachineId,
    selectedStateId,
    selectedTransitionId,
    isPreviewActive,
    addState,
    addTransition,
    removeState,
    removeTransition,
    setInitialState,
    startPreview,
    stopPreview,
    resetPreview,
  } = useInteractionStore();

  const [isAddingTransition, setIsAddingTransition] = useState(false);
  const [transitionFromId, setTransitionFromId] = useState<string | null>(null);

  const machine = activeStateMachineId ? stateMachines[activeStateMachineId] : null;

  const handleAddState = () => {
    if (!activeStateMachineId) return;
    const offset = Object.keys(machine?.states ?? {}).length;
    addState(activeStateMachineId, `State ${offset + 1}`, {
      x: 200 + offset * 50,
      y: 200 + offset * 40,
    });
  };

  const handleStartTransition = () => {
    if (!selectedStateId) return;
    setIsAddingTransition(true);
    setTransitionFromId(selectedStateId);
  };

  const handleCompleteTransition = () => {
    if (!activeStateMachineId || !transitionFromId || !selectedStateId) return;
    if (transitionFromId === selectedStateId) {
      // Self-transition
      addTransition(activeStateMachineId, transitionFromId, selectedStateId, 'tap');
    } else {
      addTransition(activeStateMachineId, transitionFromId, selectedStateId, 'tap');
    }
    setIsAddingTransition(false);
    setTransitionFromId(null);
  };

  const handleDelete = () => {
    if (!activeStateMachineId) return;
    if (selectedTransitionId) {
      removeTransition(activeStateMachineId, selectedTransitionId);
    } else if (selectedStateId) {
      removeState(activeStateMachineId, selectedStateId);
    }
  };

  const handleSetInitial = () => {
    if (!activeStateMachineId || !selectedStateId) return;
    setInitialState(activeStateMachineId, selectedStateId);
  };

  const handlePreviewToggle = () => {
    if (isPreviewActive) {
      stopPreview();
    } else if (activeStateMachineId) {
      startPreview(activeStateMachineId);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(26,26,46,0.95)',
        flexWrap: 'wrap',
      }}
    >
      {/* State Machine Mode Label */}
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.5)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginRight: 8,
        }}
      >
        Interactions
      </span>

      {/* Add State */}
      <ToolbarButton
        label="+ State"
        onClick={handleAddState}
        disabled={!machine || isPreviewActive}
      />

      {/* Add Transition */}
      {!isAddingTransition ? (
        <ToolbarButton
          label="+ Transition"
          onClick={handleStartTransition}
          disabled={!selectedStateId || isPreviewActive}
        />
      ) : (
        <ToolbarButton
          label={transitionFromId ? 'Select target state...' : 'Select source...'}
          onClick={handleCompleteTransition}
          disabled={!selectedStateId}
          active
        />
      )}

      {isAddingTransition && (
        <ToolbarButton
          label="Cancel"
          onClick={() => {
            setIsAddingTransition(false);
            setTransitionFromId(null);
          }}
        />
      )}

      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)' }} />

      {/* Set Initial */}
      <ToolbarButton
        label="Set Initial"
        onClick={handleSetInitial}
        disabled={!selectedStateId || isPreviewActive}
      />

      {/* Delete */}
      <ToolbarButton
        label="Delete"
        onClick={handleDelete}
        disabled={(!selectedStateId && !selectedTransitionId) || isPreviewActive}
        danger
      />

      <div style={{ flex: 1 }} />

      {/* Preview Controls */}
      <ToolbarButton
        label={isPreviewActive ? 'Stop Preview' : 'Preview'}
        onClick={handlePreviewToggle}
        disabled={!machine}
        active={isPreviewActive}
      />

      {isPreviewActive && (
        <ToolbarButton label="Reset" onClick={resetPreview} />
      )}
    </div>
  );
}

function ToolbarButton({
  label,
  onClick,
  disabled = false,
  active = false,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '4px 10px',
        fontSize: 11,
        fontFamily: 'Inter',
        fontWeight: 500,
        borderRadius: 6,
        border: `1px solid ${
          active
            ? 'rgba(59,130,246,0.5)'
            : danger
              ? 'rgba(239,68,68,0.3)'
              : 'rgba(255,255,255,0.15)'
        }`,
        background: active
          ? 'rgba(59,130,246,0.15)'
          : danger
            ? 'rgba(239,68,68,0.1)'
            : 'rgba(255,255,255,0.05)',
        color: disabled
          ? 'rgba(255,255,255,0.2)'
          : danger
            ? '#ef4444'
            : active
              ? '#3b82f6'
              : 'rgba(255,255,255,0.7)',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      {label}
    </button>
  );
}
