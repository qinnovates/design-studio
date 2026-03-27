'use client';

import type { DocElement } from '@design-studio/interactions';
import { DocCommentView } from './DocCommentView';
import { DocBehaviorView } from './DocBehaviorView';

interface DocElementViewProps {
  element: DocElement;
  onNavigate?: (nodeId: string) => void;
}

export function DocElementView({ element, onNavigate }: DocElementViewProps) {
  const totalItems = element.comments.length + element.behaviors.length;
  if (totalItems === 0) return null;

  return (
    <div
      style={{
        padding: '10px 12px',
        marginBottom: 8,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 8,
      }}
    >
      {/* Element header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 8,
        }}
      >
        <button
          onClick={() => onNavigate?.(element.nodeId)}
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.8)',
            background: 'none',
            border: 'none',
            cursor: onNavigate ? 'pointer' : 'default',
            padding: 0,
            textDecoration: onNavigate ? 'underline' : 'none',
            textDecorationColor: 'rgba(255,255,255,0.2)',
          }}
        >
          {element.nodeName}
        </button>
        <span
          style={{
            fontSize: 9,
            padding: '1px 5px',
            borderRadius: 3,
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.3)',
          }}
        >
          {element.nodeType}
        </span>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
          {element.comments.length}c / {element.behaviors.length}b
        </span>
      </div>

      {/* Behaviors */}
      {element.behaviors.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(168,85,247,0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 4,
            }}
          >
            Behaviors
          </div>
          {element.behaviors.map((b) => (
            <DocBehaviorView key={b.stateMachineId} behavior={b} />
          ))}
        </div>
      )}

      {/* Comments */}
      {element.comments.length > 0 && (
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 4,
            }}
          >
            Comments
          </div>
          {element.comments.map((c) => (
            <DocCommentView key={c.id} comment={c} />
          ))}
        </div>
      )}
    </div>
  );
}
