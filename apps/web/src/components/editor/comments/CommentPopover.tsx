'use client';

import type { CommentType } from '@design-studio/interactions';
import { useCommentStore } from '@/stores/commentStore';
import { CommentInput } from './CommentInput';
import { CommentThread } from './CommentThread';

interface CommentPopoverProps {
  nodeId: string;
  screenId: string;
  nodeName: string;
  position: { x: number; y: number };
  onClose: () => void;
}

/**
 * Floating popover anchored to a canvas element.
 * Shows existing comments and allows adding new ones.
 */
export function CommentPopover({
  nodeId,
  screenId,
  nodeName,
  position,
  onClose,
}: CommentPopoverProps) {
  const { addComment, getRootCommentsForNode } = useCommentStore();

  const comments = getRootCommentsForNode(nodeId);

  const handleAddComment = (content: string, commentType: CommentType) => {
    addComment(screenId, nodeId, content, commentType);
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: 320,
        maxHeight: 480,
        background: 'rgba(20,20,35,0.97)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 10,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
            {nodeName}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>
            {comments.length} comment{comments.length !== 1 ? 's' : ''}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.3)',
            cursor: 'pointer',
            fontSize: 16,
            padding: '2px 6px',
          }}
        >
          x
        </button>
      </div>

      {/* Comments list */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 12,
          maxHeight: 300,
        }}
      >
        {comments.length === 0 ? (
          <div
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.2)',
              textAlign: 'center',
              padding: 16,
            }}
          >
            No comments yet. Be the first!
          </div>
        ) : (
          comments.map((comment) => (
            <CommentThread key={comment.id} comment={comment} />
          ))
        )}
      </div>

      {/* New comment input */}
      <div
        style={{
          padding: 12,
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <CommentInput onSubmit={handleAddComment} autoFocus={comments.length === 0} />
      </div>
    </div>
  );
}
