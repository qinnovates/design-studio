'use client';

import type { DocSection } from '@design-studio/interactions';
import { DocElementView } from './DocElementView';
import { DocCommentView } from './DocCommentView';

interface DocSectionViewProps {
  section: DocSection;
  onNavigateToNode?: (nodeId: string) => void;
}

export function DocSectionView({ section, onNavigateToNode }: DocSectionViewProps) {
  const totalItems =
    section.screenComments.length +
    section.elements.reduce(
      (sum, el) => sum + el.comments.length + el.behaviors.length,
      0,
    );

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Screen header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 12,
          paddingBottom: 8,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 600,
            color: 'rgba(255,255,255,0.9)',
          }}
        >
          {section.screenName}
        </h3>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
          {section.elements.length} elements, {totalItems} items
        </span>
      </div>

      {/* Screen-level comments */}
      {section.screenComments.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 6,
            }}
          >
            Screen Notes
          </div>
          {section.screenComments.map((c) => (
            <DocCommentView key={c.id} comment={c} />
          ))}
        </div>
      )}

      {/* Elements */}
      {section.elements.map((el) => (
        <DocElementView
          key={el.nodeId}
          element={el}
          onNavigate={onNavigateToNode}
        />
      ))}
    </div>
  );
}
