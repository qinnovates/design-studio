'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { StateMachineCanvas } from './StateMachineCanvas';
import { StateMachineToolbar } from './StateMachineToolbar';
import { StateMachineSidebar } from './StateMachineSidebar';
import { InteractionInspector } from './InteractionInspector';

interface StateMachineEditorProps {
  screenId: string;
}

export function StateMachineEditor({ screenId }: StateMachineEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Resize observer for the canvas area
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        background: '#0d0d1a',
      }}
    >
      {/* Left: Machine list */}
      <div
        style={{
          width: 220,
          borderRight: '1px solid rgba(255,255,255,0.08)',
          overflowY: 'auto',
          background: 'rgba(26,26,46,0.5)',
        }}
      >
        <StateMachineSidebar screenId={screenId} />
      </div>

      {/* Center: Canvas */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <StateMachineToolbar screenId={screenId} />
        <div ref={containerRef} style={{ flex: 1, position: 'relative' }}>
          <StateMachineCanvas
            width={dimensions.width}
            height={dimensions.height}
          />
          {/* Help text */}
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              fontSize: 10,
              color: 'rgba(255,255,255,0.15)',
            }}
          >
            Drag states to reposition. Click state then "+"Transition" then click target state.
          </div>
        </div>
      </div>

      {/* Right: Inspector */}
      <div
        style={{
          width: 280,
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          overflowY: 'auto',
          background: 'rgba(26,26,46,0.5)',
        }}
      >
        <InteractionInspector />
      </div>
    </div>
  );
}
