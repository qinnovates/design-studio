'use client';

import type { ContextualComment, CommentType } from '@design-studio/interactions';

const TYPE_COLORS: Record<CommentType, string> = {
  'design-note': '#3b82f6',
  'bug': '#ef4444',
  'question': '#f97316',
  'approval': '#22c55e',
  'general': '#6b7280',
};

interface DocCommentViewProps {
  comment: ContextualComment;
}

export function DocCommentView({ comment }: DocCommentViewProps) {
  const typeColor = TYPE_COLORS[comment.commentType] ?? '#6b7280';

  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        padding: '6px 0',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      {/* Status checkbox */}
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: 4,
          border: `1.5px solid ${
            comment.status === 'resolved' ? '#22c55e' : 'rgba(255,255,255,0.2)'
          }`,
          background: comment.status === 'resolved' ? 'rgba(34,197,94,0.15)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          color: '#22c55e',
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        {comment.status === 'resolved' ? 'x' : ''}
      </div>

      <div style={{ flex: 1 }}>
        {/* Meta line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
          <span
            style={{
              fontSize: 9,
              fontWeight: 600,
              padding: '1px 4px',
              borderRadius: 3,
              background: typeColor + '20',
              color: typeColor,
              textTransform: 'uppercase',
            }}
          >
            {comment.commentType}
          </span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
            {comment.authorName}
          </span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)' }}>
            {new Date(comment.createdAt).toLocaleDateString()}
          </span>
          {comment.status === 'wontfix' && (
            <span style={{ fontSize: 9, color: '#6b7280' }}>[Won't fix]</span>
          )}
        </div>

        {/* Content */}
        <div
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.5,
          }}
        >
          {comment.content}
        </div>
      </div>
    </div>
  );
}
