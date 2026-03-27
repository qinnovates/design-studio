'use client';

import { useCommentStore } from '@/stores/commentStore';
import type { CommentType, CommentStatus } from '@design-studio/interactions';

const STATUS_OPTIONS: { value: CommentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'wontfix', label: "Won't Fix" },
];

const TYPE_OPTIONS: { value: CommentType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'design-note', label: 'Design Notes' },
  { value: 'bug', label: 'Bugs' },
  { value: 'question', label: 'Questions' },
  { value: 'approval', label: 'Approvals' },
  { value: 'general', label: 'General' },
];

export function CommentFilters() {
  const { filters, setFilters, resetFilters, getOpenCount } = useCommentStore();
  const openCount = getOpenCount();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '8px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Search */}
      <input
        value={filters.searchQuery}
        onChange={(e) => setFilters({ searchQuery: e.target.value })}
        placeholder="Search comments..."
        style={{
          fontSize: 11,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 4,
          color: 'rgba(255,255,255,0.7)',
          padding: '5px 8px',
          outline: 'none',
        }}
      />

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Status */}
        {STATUS_OPTIONS.map((opt) => (
          <FilterPill
            key={opt.value}
            label={opt.value === 'open' ? `${opt.label} (${openCount})` : opt.label}
            active={filters.status === opt.value}
            onClick={() => setFilters({ status: opt.value })}
          />
        ))}

        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.08)' }} />

        {/* Type */}
        <select
          value={filters.commentType}
          onChange={(e) => setFilters({ commentType: e.target.value as CommentType | 'all' })}
          style={{
            fontSize: 10,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 4,
            color: 'rgba(255,255,255,0.5)',
            padding: '3px 6px',
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <span style={{ flex: 1 }} />

        {/* Reset */}
        <button
          onClick={resetFilters}
          style={{
            fontSize: 10,
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.25)',
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '2px 8px',
        fontSize: 10,
        borderRadius: 4,
        border: `1px solid ${active ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.1)'}`,
        background: active ? 'rgba(59,130,246,0.15)' : 'transparent',
        color: active ? '#3b82f6' : 'rgba(255,255,255,0.4)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      {label}
    </button>
  );
}
