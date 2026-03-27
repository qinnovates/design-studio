'use client';

import { useCommentStore } from '@/stores/commentStore';
import { CommentFilters } from './CommentFilters';
import { CommentThread } from './CommentThread';
import { CommentInput } from './CommentInput';
import type { CommentType } from '@design-studio/interactions';

interface CommentPanelProps {
  screenId: string;
}

/**
 * Right panel showing all comments for the current screen.
 * Filterable by status, type, author, element.
 */
export function CommentPanel({ screenId }: CommentPanelProps) {
  const { getFilteredComments, addComment, isCommentMode, toggleCommentMode, getOpenCount } =
    useCommentStore();

  const filteredComments = getFilteredComments();
  const screenComments = filteredComments.filter((c) => c.screenId === screenId);
  const openCount = getOpenCount();

  const handleAddScreenComment = (content: string, commentType: CommentType) => {
    addComment(screenId, null, content, commentType);
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(26,26,46,0.5)',
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
            Comments
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>
            {openCount} open / {filteredComments.length} total
          </div>
        </div>

        {/* Comment mode toggle */}
        <button
          onClick={toggleCommentMode}
          style={{
            padding: '4px 10px',
            fontSize: 11,
            fontWeight: 500,
            borderRadius: 6,
            border: `1px solid ${
              isCommentMode ? 'rgba(249,115,22,0.5)' : 'rgba(255,255,255,0.15)'
            }`,
            background: isCommentMode ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.05)',
            color: isCommentMode ? '#f97316' : 'rgba(255,255,255,0.6)',
            cursor: 'pointer',
          }}
        >
          {isCommentMode ? 'Exit Comment Mode' : 'Comment Mode'}
        </button>
      </div>

      {/* Filters */}
      <CommentFilters />

      {/* Comment list */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 12,
        }}
      >
        {screenComments.length === 0 ? (
          <div
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.2)',
              textAlign: 'center',
              padding: 24,
            }}
          >
            {isCommentMode
              ? 'Click any element on the canvas to add a comment'
              : 'No comments on this screen yet'}
          </div>
        ) : (
          screenComments.map((comment) => (
            <CommentThread key={comment.id} comment={comment} />
          ))
        )}
      </div>

      {/* Screen-level comment input */}
      <div
        style={{
          padding: 12,
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <CommentInput
          onSubmit={handleAddScreenComment}
          placeholder="Add a screen-level comment..."
          autoFocus={false}
        />
      </div>
    </div>
  );
}
