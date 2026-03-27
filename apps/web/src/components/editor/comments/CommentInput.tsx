'use client';

import { useState } from 'react';
import type { CommentType } from '@design-studio/interactions';

const COMMENT_TYPES: { value: CommentType; label: string; color: string }[] = [
  { value: 'design-note', label: 'Design Note', color: '#3b82f6' },
  { value: 'bug', label: 'Bug', color: '#ef4444' },
  { value: 'question', label: 'Question', color: '#f97316' },
  { value: 'approval', label: 'Approval', color: '#22c55e' },
  { value: 'general', label: 'General', color: '#6b7280' },
];

interface CommentInputProps {
  onSubmit: (content: string, commentType: CommentType) => void;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  showTypeSelector?: boolean;
}

export function CommentInput({
  onSubmit,
  onCancel,
  placeholder = 'Add a comment...',
  autoFocus = true,
  showTypeSelector = true,
}: CommentInputProps) {
  const [content, setContent] = useState('');
  const [commentType, setCommentType] = useState<CommentType>('design-note');

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content.trim(), commentType);
    setContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
    if (e.key === 'Escape' && onCancel) {
      onCancel();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      {/* Type selector */}
      {showTypeSelector && (
        <div style={{ display: 'flex', gap: 4 }}>
          {COMMENT_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setCommentType(type.value)}
              style={{
                padding: '2px 8px',
                fontSize: 10,
                borderRadius: 4,
                border: `1px solid ${
                  commentType === type.value
                    ? type.color + '80'
                    : 'rgba(255,255,255,0.1)'
                }`,
                background:
                  commentType === type.value
                    ? type.color + '20'
                    : 'transparent',
                color:
                  commentType === type.value
                    ? type.color
                    : 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {type.label}
            </button>
          ))}
        </div>
      )}

      {/* Text area */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={3}
        style={{
          width: '100%',
          fontSize: 12,
          fontFamily: 'Inter',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 6,
          color: 'rgba(255,255,255,0.85)',
          padding: '8px 10px',
          outline: 'none',
          resize: 'vertical',
          minHeight: 60,
        }}
      />

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)' }}>
          Cmd+Enter to submit
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          {onCancel && (
            <button
              onClick={onCancel}
              style={{
                padding: '4px 10px',
                fontSize: 11,
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent',
                color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            style={{
              padding: '4px 12px',
              fontSize: 11,
              fontWeight: 500,
              borderRadius: 4,
              border: '1px solid rgba(59,130,246,0.4)',
              background: content.trim() ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.03)',
              color: content.trim() ? '#3b82f6' : 'rgba(255,255,255,0.2)',
              cursor: content.trim() ? 'pointer' : 'default',
            }}
          >
            Comment
          </button>
        </div>
      </div>
    </div>
  );
}
