'use client';

import type { DocBehavior } from '@design-studio/interactions';

interface DocBehaviorViewProps {
  behavior: DocBehavior;
}

export function DocBehaviorView({ behavior }: DocBehaviorViewProps) {
  return (
    <div
      style={{
        padding: '6px 8px',
        marginBottom: 4,
        background: 'rgba(168,85,247,0.05)',
        border: '1px solid rgba(168,85,247,0.15)',
        borderRadius: 6,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: 'rgba(168,85,247,0.8)',
          marginBottom: 4,
        }}
      >
        {behavior.stateMachineName}
      </div>

      {behavior.relevantTransitions.map((t) => (
        <div
          key={t.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 10,
            color: 'rgba(255,255,255,0.5)',
            padding: '2px 0',
          }}
        >
          <span
            style={{
              padding: '1px 5px',
              borderRadius: 3,
              background: 'rgba(168,85,247,0.15)',
              color: 'rgba(168,85,247,0.7)',
              fontSize: 9,
              fontWeight: 600,
            }}
          >
            {t.event}
          </span>
          <span>{t.fromState}</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>{'→'}</span>
          <span>{t.toState}</span>
          {t.actionCount > 0 && (
            <span style={{ color: 'rgba(255,255,255,0.25)' }}>
              ({t.actionCount} action{t.actionCount !== 1 ? 's' : ''})
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
