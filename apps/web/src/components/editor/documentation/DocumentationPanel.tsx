'use client';

import { useMemo, useState } from 'react';
import { useCommentStore } from '@/stores/commentStore';
import { useInteractionStore } from '@/stores/interactionStore';
import { DocSectionView } from './DocSectionView';
import { DocSearchBar } from './DocSearchBar';
import { DocExportMenu } from './DocExportMenu';
import type { DesignDocument } from '@design-studio/interactions';

interface DocumentationPanelProps {
  projectId: string;
  projectName: string;
  screenNames: Record<string, string>;
  nodeNames: Record<string, { name: string; type: string }>;
  onNavigateToNode?: (nodeId: string) => void;
}

/**
 * Full-width documentation view.
 * Auto-generated living document from all comments + state machine behaviors.
 */
export function DocumentationPanel({
  projectId,
  projectName,
  screenNames,
  nodeNames,
  onNavigateToNode,
}: DocumentationPanelProps) {
  const { generateDocument, comments } = useCommentStore();
  const { stateMachines } = useInteractionStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Regenerate document when comments or state machines change
  const document: DesignDocument = useMemo(() => {
    return generateDocument(projectId, projectName, screenNames, nodeNames, stateMachines);
  }, [
    // Using Object.keys().length as a cheaper change indicator
    Object.keys(comments).length,
    Object.keys(stateMachines).length,
    projectId,
    projectName,
    screenNames,
    nodeNames,
    generateDocument,
    stateMachines,
  ]);

  // Filter sections by search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return document.sections;

    const q = searchQuery.toLowerCase();
    return document.sections
      .map((section) => ({
        ...section,
        elements: section.elements.filter(
          (el) =>
            el.nodeName.toLowerCase().includes(q) ||
            el.comments.some((c) => c.content.toLowerCase().includes(q)) ||
            el.behaviors.some((b) => b.stateMachineName.toLowerCase().includes(q)),
        ),
        screenComments: section.screenComments.filter((c) =>
          c.content.toLowerCase().includes(q),
        ),
      }))
      .filter(
        (section) =>
          section.elements.length > 0 ||
          section.screenComments.length > 0 ||
          section.screenName.toLowerCase().includes(q),
      );
  }, [document, searchQuery]);

  const totalResults = filteredSections.reduce(
    (sum, s) =>
      sum +
      s.screenComments.length +
      s.elements.reduce((esum, el) => esum + el.comments.length + el.behaviors.length, 0),
    0,
  );

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#0d0d1a',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(26,26,46,0.5)',
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            Design Review Document
          </h2>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
            {document.summary.totalScreens} screens / {document.summary.totalComments} comments / {document.summary.totalBehaviors} behaviors
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Summary pills */}
          <div style={{ display: 'flex', gap: 8 }}>
            <SummaryPill label="Open" value={document.summary.openComments} color="#f97316" />
            <SummaryPill label="Resolved" value={document.summary.resolvedComments} color="#22c55e" />
          </div>
          <DocExportMenu document={document} />
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '0 24px' }}>
        <DocSearchBar
          query={searchQuery}
          onQueryChange={setSearchQuery}
          resultCount={totalResults}
        />
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 24px 48px',
        }}
      >
        {filteredSections.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: 48,
              color: 'rgba(255,255,255,0.2)',
              fontSize: 13,
            }}
          >
            {searchQuery
              ? 'No results found'
              : 'No comments or behaviors yet. Add comments to elements and create state machines to populate this document.'}
          </div>
        ) : (
          filteredSections.map((section) => (
            <DocSectionView
              key={section.screenId}
              section={section}
              onNavigateToNode={onNavigateToNode}
            />
          ))
        )}
      </div>
    </div>
  );
}

function SummaryPill({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 8px',
        borderRadius: 4,
        background: color + '15',
        border: `1px solid ${color}30`,
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 600, color }}>{value}</span>
      <span style={{ fontSize: 10, color: color + '90' }}>{label}</span>
    </div>
  );
}
