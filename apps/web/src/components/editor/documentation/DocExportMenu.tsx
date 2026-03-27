'use client';

import { useState } from 'react';
import type { DesignDocument } from '@design-studio/interactions';
import { useCommentStore } from '@/stores/commentStore';

interface DocExportMenuProps {
  document: DesignDocument;
}

export function DocExportMenu({ document }: DocExportMenuProps) {
  const { exportAsMarkdown, exportAsHTML } = useCommentStore();
  const [showMenu, setShowMenu] = useState(false);

  const handleExportMarkdown = () => {
    const md = exportAsMarkdown(document);
    downloadFile(`${document.projectName}-design-review.md`, md, 'text/markdown');
    setShowMenu(false);
  };

  const handleExportHTML = () => {
    const html = exportAsHTML(document);
    downloadFile(`${document.projectName}-design-review.html`, html, 'text/html');
    setShowMenu(false);
  };

  const handleCopyMarkdown = async () => {
    const md = exportAsMarkdown(document);
    await navigator.clipboard.writeText(md);
    setShowMenu(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        style={{
          padding: '5px 12px',
          fontSize: 11,
          fontWeight: 500,
          borderRadius: 6,
          border: '1px solid rgba(59,130,246,0.3)',
          background: 'rgba(59,130,246,0.1)',
          color: '#3b82f6',
          cursor: 'pointer',
        }}
      >
        Export
      </button>

      {showMenu && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: 4,
            background: 'rgba(20,20,35,0.97)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
            padding: 4,
            zIndex: 100,
            minWidth: 160,
          }}
        >
          <ExportOption label="Download Markdown" onClick={handleExportMarkdown} />
          <ExportOption label="Download HTML" onClick={handleExportHTML} />
          <ExportOption label="Copy as Markdown" onClick={handleCopyMarkdown} />
        </div>
      )}
    </div>
  );
}

function ExportOption({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        padding: '6px 10px',
        fontSize: 11,
        color: 'rgba(255,255,255,0.7)',
        background: 'transparent',
        border: 'none',
        borderRadius: 4,
        cursor: 'pointer',
        textAlign: 'left',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {label}
    </button>
  );
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
