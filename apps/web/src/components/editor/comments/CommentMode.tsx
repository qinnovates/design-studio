'use client';

import { useCallback } from 'react';
import { useCommentStore } from '@/stores/commentStore';

interface CommentModeProps {
  screenId: string;
  onNodeClick: (nodeId: string, position: { x: number; y: number }) => void;
  children: React.ReactNode;
}

/**
 * Wrapper component that intercepts clicks when comment mode is active.
 * When active, clicking any element opens the comment popover for that element.
 */
export function CommentMode({ screenId, onNodeClick, children }: CommentModeProps) {
  const { isCommentMode } = useCommentStore();

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isCommentMode) return;

      // Find closest element with data-node-id
      const target = (e.target as HTMLElement).closest('[data-node-id]');
      if (!target) return;

      const nodeId = target.getAttribute('data-node-id');
      if (!nodeId) return;

      e.stopPropagation();
      e.preventDefault();

      onNodeClick(nodeId, { x: e.clientX, y: e.clientY });
    },
    [isCommentMode, onNodeClick],
  );

  return (
    <div
      onClick={handleClick}
      style={{
        width: '100%',
        height: '100%',
        cursor: isCommentMode ? 'crosshair' : 'default',
        position: 'relative',
      }}
    >
      {children}

      {/* Comment mode indicator overlay */}
      {isCommentMode && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            border: '2px solid rgba(249,115,22,0.3)',
            borderRadius: 4,
            zIndex: 50,
          }}
        />
      )}
    </div>
  );
}
