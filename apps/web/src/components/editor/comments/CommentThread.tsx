'use client';

import { useState } from 'react';
import type { ContextualComment, CommentType } from '@design-studio/interactions';
import { useCommentStore } from '@/stores/commentStore';
import { CommentInput } from './CommentInput';

const TYPE_COLORS: Record<CommentType, string> = {
  'design-note': '#3b82f6',
  'bug': '#ef4444',
  'question': '#f97316',
  'approval': '#22c55e',
  'general': '#6b7280',
};

const STATUS_ICONS: Record<string, string> = {
  open: '',
  resolved: '[Resolved]',
  wontfix: "[Won't fix]",
};

interface CommentThreadProps {
  comment: ContextualComment;
  depth?: number;
}

export function CommentThread({ comment, depth = 0 }: CommentThreadProps) {
  const { getThreadReplies, addComment, resolveComment, reopenComment, markWontfix, removeComment } =
    useCommentStore();
  const [isReplying, setIsReplying] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const replies = getThreadReplies(comment.id);
  const typeColor = TYPE_COLORS[comment.commentType] ?? '#6b7280';

  const handleReply = (content: string, commentType: CommentType) => {
    addComment(comment.screenId, comment.nodeId, content, commentType, comment.id);
    setIsReplying(false);
  };

  const timeAgo = (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div
      style={{
        marginLeft: depth > 0 ? 16 : 0,
        borderLeft: depth > 0 ? '2px solid rgba(255,255,255,0.06)' : 'none',
        paddingLeft: depth > 0 ? 10 : 0,
        marginBottom: 8,
      }}
    >
      {/* Comment card */}
      <div
        style={{
          padding: '8px 10px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 6,
          border: `1px solid rgba(255,255,255,0.06)`,
          borderLeftColor: depth === 0 ? typeColor + '60' : 'rgba(255,255,255,0.06)',
          borderLeftWidth: depth === 0 ? 3 : 1,
          opacity: comment.status === 'resolved' ? 0.6 : 1,
        }}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 4,
          }}
        >
          {/* Type badge */}
          {depth === 0 && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 600,
                padding: '1px 5px',
                borderRadius: 3,
                background: typeColor + '20',
                color: typeColor,
                textTransform: 'uppercase',
              }}
            >
              {comment.commentType}
            </span>
          )}

          <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>
            {comment.authorName}
          </span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
            {timeAgo(comment.createdAt)}
          </span>

          {comment.status !== 'open' && (
            <span
              style={{
                fontSize: 9,
                color: comment.status === 'resolved' ? '#22c55e' : '#6b7280',
                fontWeight: 500,
              }}
            >
              {STATUS_ICONS[comment.status]}
            </span>
          )}

          <span style={{ flex: 1 }} />

          {/* Actions */}
          {showActions && depth === 0 && (
            <div style={{ display: 'flex', gap: 4 }}>
              {comment.status === 'open' && (
                <ActionBtn label="Resolve" onClick={() => resolveComment(comment.id)} color="#22c55e" />
              )}
              {comment.status === 'resolved' && (
                <ActionBtn label="Reopen" onClick={() => reopenComment(comment.id)} color="#f97316" />
              )}
              {comment.status === 'open' && (
                <ActionBtn label="Won't fix" onClick={() => markWontfix(comment.id)} color="#6b7280" />
              )}
              <ActionBtn label="Delete" onClick={() => removeComment(comment.id)} color="#ef4444" />
            </div>
          )}
        </div>

        {/* Content */}
        <div
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.75)',
            lineHeight: 1.5,
            whiteSpace: 'pre-wrap',
          }}
        >
          {comment.content}
        </div>

        {/* Linked state machine info */}
        {(comment.linkedStateId || comment.linkedTransitionId) && (
          <div
            style={{
              marginTop: 4,
              fontSize: 10,
              color: 'rgba(168,85,247,0.6)',
            }}
          >
            Linked: {comment.linkedStateId ? `State ${comment.linkedStateId}` : ''}{' '}
            {comment.linkedTransitionId ? `Transition ${comment.linkedTransitionId}` : ''}
          </div>
        )}

        {/* Reply button */}
        {!isReplying && comment.status === 'open' && (
          <button
            onClick={() => setIsReplying(true)}
            style={{
              marginTop: 4,
              fontSize: 10,
              color: 'rgba(255,255,255,0.3)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Reply
          </button>
        )}
      </div>

      {/* Reply input */}
      {isReplying && (
        <div style={{ marginTop: 6, marginLeft: 16 }}>
          <CommentInput
            onSubmit={handleReply}
            onCancel={() => setIsReplying(false)}
            placeholder="Write a reply..."
            showTypeSelector={false}
          />
        </div>
      )}

      {/* Nested replies */}
      {replies.map((reply) => (
        <CommentThread key={reply.id} comment={reply} depth={depth + 1} />
      ))}
    </div>
  );
}

function ActionBtn({
  label,
  onClick,
  color,
}: {
  label: string;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        fontSize: 9,
        padding: '1px 5px',
        borderRadius: 3,
        border: `1px solid ${color}40`,
        background: 'transparent',
        color: color + '90',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}
