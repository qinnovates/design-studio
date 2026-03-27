'use client';

interface DocSearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  resultCount: number;
}

export function DocSearchBar({ query, onQueryChange, resultCount }: DocSearchBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 0',
      }}
    >
      <input
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Search comments and behaviors..."
        style={{
          flex: 1,
          fontSize: 12,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 6,
          color: 'rgba(255,255,255,0.7)',
          padding: '6px 10px',
          outline: 'none',
        }}
      />
      {query && (
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', whiteSpace: 'nowrap' }}>
          {resultCount} result{resultCount !== 1 ? 's' : ''}
        </span>
      )}
    </div>
  );
}
