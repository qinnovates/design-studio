'use client';

import { useRef, useCallback } from 'react';
import { Stage, Layer } from 'react-konva';
import type Konva from 'konva';
import { useInteractionStore } from '@/stores/interactionStore';
import { StateNode } from './StateNode';
import { TransitionArrow } from './TransitionArrow';

interface StateMachineCanvasProps {
  width: number;
  height: number;
}

export function StateMachineCanvas({ width, height }: StateMachineCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const {
    stateMachines,
    activeStateMachineId,
    selectedStateId,
    selectedTransitionId,
    isPreviewActive,
    previewCurrentStateId,
    selectState,
    selectTransition,
    updateState,
  } = useInteractionStore();

  const machine = activeStateMachineId ? stateMachines[activeStateMachineId] : null;

  const handleStagClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.target === e.currentTarget) {
        selectState(null);
        selectTransition(null);
      }
    },
    [selectState, selectTransition],
  );

  const handleStateDragEnd = useCallback(
    (stateId: string, x: number, y: number) => {
      if (!activeStateMachineId) return;
      updateState(activeStateMachineId, stateId, {
        editorPosition: { x, y },
      });
    },
    [activeStateMachineId, updateState],
  );

  if (!machine) {
    return (
      <div
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.3)',
          fontSize: 14,
          fontFamily: 'Inter',
        }}
      >
        Select or create a state machine to begin
      </div>
    );
  }

  const states = Object.values(machine.states);
  const transitions = Object.values(machine.transitions);

  return (
    <Stage
      ref={stageRef}
      width={width}
      height={height}
      onClick={handleStagClick}
      draggable
    >
      <Layer>
        {/* Render transitions first (below states) */}
        {transitions.map((transition) => {
          const fromState = machine.states[transition.fromStateId];
          const toState = machine.states[transition.toStateId];
          if (!fromState || !toState) return null;
          return (
            <TransitionArrow
              key={transition.id}
              transition={transition}
              fromState={fromState}
              toState={toState}
              isSelected={selectedTransitionId === transition.id}
              onSelect={selectTransition}
            />
          );
        })}

        {/* Render state nodes */}
        {states.map((state) => (
          <StateNode
            key={state.id}
            state={state}
            isInitial={machine.initialStateId === state.id}
            isActive={isPreviewActive && previewCurrentStateId === state.id}
            isSelected={selectedStateId === state.id}
            onSelect={selectState}
            onDragEnd={handleStateDragEnd}
          />
        ))}
      </Layer>
    </Stage>
  );
}
