'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useInteractionStore } from '@/stores/interactionStore';
import type { InteractionEventType, RuntimeEvent } from '@design-studio/interactions';

interface PreviewOverlayProps {
  children: React.ReactNode;
}

/**
 * Wraps the design canvas during preview mode.
 * Intercepts user interactions and feeds them to the state machine engine.
 * Displays runtime state (current state, variables, log).
 */
export function PreviewOverlay({ children }: PreviewOverlayProps) {
  const {
    isPreviewActive,
    previewCurrentStateId,
    runtimeVariables,
    stateMachines,
    activeStateMachineId,
    handlePreviewEvent,
    previewLog,
  } = useInteractionStore();

  const overlayRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const machine = activeStateMachineId ? stateMachines[activeStateMachineId] : null;
  const currentStateName = machine && previewCurrentStateId
    ? machine.states[previewCurrentStateId]?.name ?? 'Unknown'
    : 'None';

  const emitEvent = useCallback(
    (type: InteractionEventType, sourceNodeId: string | null = null) => {
      const event: RuntimeEvent = {
        type,
        sourceNodeId,
        timestamp: Date.now(),
      };
      handlePreviewEvent(event);
    },
    [handlePreviewEvent],
  );

  // Pointer event handlers for swipe and hold detection
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!isPreviewActive) return;

      touchStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };

      // Start hold timer
      holdTimerRef.current = setTimeout(() => {
        const target = (e.target as HTMLElement).closest('[data-node-id]');
        const nodeId = target?.getAttribute('data-node-id') ?? null;
        emitEvent('hold', nodeId);
        touchStartRef.current = null; // Consumed as hold
      }, 500);
    },
    [isPreviewActive, emitEvent],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isPreviewActive || !touchStartRef.current) return;

      // Clear hold timer
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }

      const start = touchStartRef.current;
      touchStartRef.current = null;

      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const elapsed = Date.now() - start.time;

      const target = (e.target as HTMLElement).closest('[data-node-id]');
      const nodeId = target?.getAttribute('data-node-id') ?? null;

      // Swipe detection (40px threshold)
      if (dist > 40) {
        if (Math.abs(dx) > Math.abs(dy)) {
          emitEvent(dx > 0 ? 'swipe-right' : 'swipe-left', nodeId);
        } else {
          emitEvent(dy > 0 ? 'swipe-down' : 'swipe-up', nodeId);
        }
        return;
      }

      // Tap detection (quick, small distance)
      if (elapsed < 300 && dist < 10) {
        emitEvent('tap', nodeId);
      }
    },
    [isPreviewActive, emitEvent],
  );

  const handlePointerEnter = useCallback(
    (e: React.PointerEvent) => {
      if (!isPreviewActive) return;
      const target = (e.target as HTMLElement).closest('[data-node-id]');
      const nodeId = target?.getAttribute('data-node-id') ?? null;
      if (nodeId) emitEvent('hover-enter', nodeId);
    },
    [isPreviewActive, emitEvent],
  );

  const handlePointerLeave = useCallback(
    (e: React.PointerEvent) => {
      if (!isPreviewActive) return;
      const target = (e.target as HTMLElement).closest('[data-node-id]');
      const nodeId = target?.getAttribute('data-node-id') ?? null;
      if (nodeId) emitEvent('hover-leave', nodeId);
    },
    [isPreviewActive, emitEvent],
  );

  // Double-tap detection
  const lastTapRef = useRef<number>(0);
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isPreviewActive) return;

      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        const target = (e.target as HTMLElement).closest('[data-node-id]');
        const nodeId = target?.getAttribute('data-node-id') ?? null;
        emitEvent('double-tap', nodeId);
      }
      lastTapRef.current = now;
    },
    [isPreviewActive, emitEvent],
  );

  if (!isPreviewActive) {
    return <>{children}</>;
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Canvas content */}
      <div
        ref={overlayRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
        style={{ width: '100%', height: '100%', cursor: 'crosshair' }}
      >
        {children}
      </div>

      {/* Preview HUD */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '6px 16px',
          borderRadius: 8,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(34,197,94,0.3)',
          zIndex: 100,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#22c55e',
            animation: 'pulse 2s infinite',
          }}
        />
        <span style={{ fontSize: 11, fontWeight: 600, color: '#22c55e' }}>
          PREVIEW
        </span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
          State: <strong style={{ color: '#fff' }}>{currentStateName}</strong>
        </span>

        {/* Compact variable display */}
        {Object.keys(runtimeVariables).length > 0 && (
          <>
            <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)' }} />
            {Object.entries(runtimeVariables).slice(0, 3).map(([name, value]) => (
              <span key={name} style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                <span style={{ color: '#a855f7' }}>{name}</span>=
                <span style={{ color: '#22c55e' }}>{JSON.stringify(value)}</span>
              </span>
            ))}
          </>
        )}
      </div>

      {/* Last transition indicator */}
      {previewLog.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '4px 12px',
            borderRadius: 6,
            background: 'rgba(0,0,0,0.6)',
            fontSize: 10,
            color: 'rgba(255,255,255,0.5)',
            zIndex: 100,
          }}
        >
          Last: {previewLog[previewLog.length - 1]!.event}{' '}
          ({previewLog[previewLog.length - 1]!.from} {'→'} {previewLog[previewLog.length - 1]!.to})
        </div>
      )}
    </div>
  );
}
