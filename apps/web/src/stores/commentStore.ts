import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { generateId } from '@design-studio/canvas';
import type {
  ContextualComment,
  CommentType,
  CommentStatus,
  CommentFilters,
  DesignDocument,
  DocSection,
  DocElement,
} from '@design-studio/interactions';
import { DEFAULT_COMMENT_FILTERS } from '@design-studio/interactions';

// ─── Store Types ─────────────────────────────────────────────

interface CommentStoreState {
  // Data
  comments: Record<string, ContextualComment>;
  activeCommentId: string | null;
  isCommentMode: boolean;
  filters: CommentFilters;

  // ── CRUD ──────────────────────────────────────
  addComment: (
    screenId: string,
    nodeId: string | null,
    content: string,
    commentType: CommentType,
    parentId?: string | null,
    authorName?: string,
  ) => string;
  updateComment: (id: string, updates: Partial<ContextualComment>) => void;
  removeComment: (id: string) => void;
  resolveComment: (id: string) => void;
  reopenComment: (id: string) => void;
  markWontfix: (id: string) => void;
  linkToStateMachine: (commentId: string, stateId?: string, transitionId?: string) => void;

  // ── Selection & Mode ──────────────────────────
  setActiveComment: (id: string | null) => void;
  toggleCommentMode: () => void;
  setCommentMode: (active: boolean) => void;

  // ── Filters ───────────────────────────────────
  setFilters: (filters: Partial<CommentFilters>) => void;
  resetFilters: () => void;

  // ── Getters ───────────────────────────────────
  getCommentsForNode: (nodeId: string) => ContextualComment[];
  getCommentsForScreen: (screenId: string) => ContextualComment[];
  getThreadReplies: (parentId: string) => ContextualComment[];
  getCommentCountForNode: (nodeId: string) => number;
  getRootCommentsForNode: (nodeId: string) => ContextualComment[];
  getFilteredComments: () => ContextualComment[];
  getOpenCount: () => number;

  // ── Documentation Generation ──────────────────
  generateDocument: (
    projectId: string,
    projectName: string,
    screenNames: Record<string, string>,
    nodeNames: Record<string, { name: string; type: string }>,
    stateMachines?: Record<string, { id: string; name: string; transitions: Record<string, { id: string; event: string; fromStateId: string; toStateId: string; sourceNodeId: string | null; actions: unknown[] }> ; states: Record<string, { name: string }> }>,
  ) => DesignDocument;
  exportAsMarkdown: (doc: DesignDocument) => string;
  exportAsHTML: (doc: DesignDocument) => string;
}

// ─── Store ───────────────────────────────────────────────────

export const useCommentStore = create<CommentStoreState>()(
  immer((set, get) => ({
    // Initial state
    comments: {},
    activeCommentId: null,
    isCommentMode: false,
    filters: { ...DEFAULT_COMMENT_FILTERS },

    // ── CRUD ──────────────────────────────────────

    addComment: (screenId, nodeId, content, commentType, parentId = null, authorName = 'Designer') => {
      const id = generateId();
      const now = new Date().toISOString();

      set((state) => {
        state.comments[id] = {
          id,
          screenId,
          nodeId,
          authorId: 'local-user',
          authorName,
          content,
          parentId: parentId ?? null,
          commentType,
          status: 'open',
          createdAt: now,
          updatedAt: now,
        };
        state.activeCommentId = id;
      });

      return id;
    },

    updateComment: (id, updates) => {
      set((state) => {
        const comment = state.comments[id];
        if (!comment) return;
        Object.assign(comment, updates);
        comment.updatedAt = new Date().toISOString();
      });
    },

    removeComment: (id) => {
      set((state) => {
        // Also remove all replies
        const toRemove = new Set<string>([id]);
        const findReplies = (parentId: string) => {
          for (const comment of Object.values(state.comments)) {
            if (comment.parentId === parentId) {
              toRemove.add(comment.id);
              findReplies(comment.id);
            }
          }
        };
        findReplies(id);
        for (const removeId of toRemove) {
          delete state.comments[removeId];
        }
        if (state.activeCommentId && toRemove.has(state.activeCommentId)) {
          state.activeCommentId = null;
        }
      });
    },

    resolveComment: (id) => {
      set((state) => {
        const comment = state.comments[id];
        if (!comment) return;
        comment.status = 'resolved';
        comment.updatedAt = new Date().toISOString();
      });
    },

    reopenComment: (id) => {
      set((state) => {
        const comment = state.comments[id];
        if (!comment) return;
        comment.status = 'open';
        comment.updatedAt = new Date().toISOString();
      });
    },

    markWontfix: (id) => {
      set((state) => {
        const comment = state.comments[id];
        if (!comment) return;
        comment.status = 'wontfix';
        comment.updatedAt = new Date().toISOString();
      });
    },

    linkToStateMachine: (commentId, stateId, transitionId) => {
      set((state) => {
        const comment = state.comments[commentId];
        if (!comment) return;
        if (stateId) comment.linkedStateId = stateId;
        if (transitionId) comment.linkedTransitionId = transitionId;
        comment.updatedAt = new Date().toISOString();
      });
    },

    // ── Selection & Mode ──────────────────────────

    setActiveComment: (id) => {
      set((state) => {
        state.activeCommentId = id;
      });
    },

    toggleCommentMode: () => {
      set((state) => {
        state.isCommentMode = !state.isCommentMode;
      });
    },

    setCommentMode: (active) => {
      set((state) => {
        state.isCommentMode = active;
      });
    },

    // ── Filters ───────────────────────────────────

    setFilters: (filters) => {
      set((state) => {
        Object.assign(state.filters, filters);
      });
    },

    resetFilters: () => {
      set((state) => {
        state.filters = { ...DEFAULT_COMMENT_FILTERS };
      });
    },

    // ── Getters ───────────────────────────────────

    getCommentsForNode: (nodeId) => {
      return Object.values(get().comments).filter((c) => c.nodeId === nodeId);
    },

    getCommentsForScreen: (screenId) => {
      return Object.values(get().comments).filter((c) => c.screenId === screenId);
    },

    getThreadReplies: (parentId) => {
      return Object.values(get().comments)
        .filter((c) => c.parentId === parentId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },

    getCommentCountForNode: (nodeId) => {
      return Object.values(get().comments).filter(
        (c) => c.nodeId === nodeId && c.parentId === null,
      ).length;
    },

    getRootCommentsForNode: (nodeId) => {
      return Object.values(get().comments)
        .filter((c) => c.nodeId === nodeId && c.parentId === null)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    getFilteredComments: () => {
      const { comments, filters } = get();
      let result = Object.values(comments);

      // Only root comments unless filtering by node
      if (filters.nodeId === 'all') {
        result = result.filter((c) => c.parentId === null);
      }

      if (filters.status !== 'all') {
        result = result.filter((c) => c.status === filters.status);
      }
      if (filters.commentType !== 'all') {
        result = result.filter((c) => c.commentType === filters.commentType);
      }
      if (filters.authorId !== 'all') {
        result = result.filter((c) => c.authorId === filters.authorId);
      }
      if (filters.screenId !== 'all') {
        result = result.filter((c) => c.screenId === filters.screenId);
      }
      if (filters.nodeId !== 'all') {
        result = result.filter((c) => c.nodeId === filters.nodeId);
      }
      if (filters.searchQuery) {
        const q = filters.searchQuery.toLowerCase();
        result = result.filter(
          (c) =>
            c.content.toLowerCase().includes(q) ||
            c.authorName.toLowerCase().includes(q),
        );
      }

      return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    getOpenCount: () => {
      return Object.values(get().comments).filter(
        (c) => c.status === 'open' && c.parentId === null,
      ).length;
    },

    // ── Documentation Generation ──────────────────

    generateDocument: (projectId, projectName, screenNames, nodeNames, stateMachines) => {
      const allComments = Object.values(get().comments);
      const screenIds = [...new Set(allComments.map((c) => c.screenId))];

      const sections: DocSection[] = screenIds.map((screenId) => {
        const screenComments = allComments.filter(
          (c) => c.screenId === screenId && c.nodeId === null && c.parentId === null,
        );

        // Group comments by node
        const nodeIds = [
          ...new Set(
            allComments
              .filter((c) => c.screenId === screenId && c.nodeId !== null)
              .map((c) => c.nodeId!),
          ),
        ];

        const elements: DocElement[] = nodeIds.map((nodeId) => {
          const nodeInfo = nodeNames[nodeId] ?? { name: nodeId, type: 'unknown' };
          const comments = allComments.filter(
            (c) => c.nodeId === nodeId && c.parentId === null,
          );

          // Find behaviors for this node from state machines
          const behaviors = stateMachines
            ? Object.values(stateMachines)
                .filter((m) =>
                  Object.values(m.transitions).some((t) => t.sourceNodeId === nodeId),
                )
                .map((m) => ({
                  stateMachineId: m.id,
                  stateMachineName: m.name,
                  relevantTransitions: Object.values(m.transitions)
                    .filter((t) => t.sourceNodeId === nodeId)
                    .map((t) => ({
                      id: t.id,
                      event: t.event,
                      fromState: m.states[t.fromStateId]?.name ?? t.fromStateId,
                      toState: m.states[t.toStateId]?.name ?? t.toStateId,
                      actionCount: t.actions.length,
                    })),
                }))
            : [];

          return {
            nodeId,
            nodeName: nodeInfo.name,
            nodeType: nodeInfo.type,
            comments,
            behaviors,
          };
        });

        return {
          screenId,
          screenName: screenNames[screenId] ?? screenId,
          elements,
          screenComments,
        };
      });

      const totalComments = allComments.filter((c) => c.parentId === null).length;
      const openComments = allComments.filter(
        (c) => c.status === 'open' && c.parentId === null,
      ).length;
      const resolvedComments = allComments.filter(
        (c) => c.status === 'resolved' && c.parentId === null,
      ).length;

      let totalBehaviors = 0;
      if (stateMachines) {
        for (const m of Object.values(stateMachines)) {
          totalBehaviors += Object.keys(m.transitions).length;
        }
      }

      return {
        projectId,
        projectName,
        generatedAt: new Date().toISOString(),
        sections,
        summary: {
          totalComments,
          openComments,
          resolvedComments,
          totalBehaviors,
          totalScreens: sections.length,
        },
      };
    },

    exportAsMarkdown: (doc) => {
      const lines: string[] = [];
      lines.push(`# ${doc.projectName} - Design Review Document`);
      lines.push(`\nGenerated: ${new Date(doc.generatedAt).toLocaleDateString()}\n`);

      lines.push(`## Summary\n`);
      lines.push(`| Metric | Count |`);
      lines.push(`|--------|-------|`);
      lines.push(`| Total Comments | ${doc.summary.totalComments} |`);
      lines.push(`| Open | ${doc.summary.openComments} |`);
      lines.push(`| Resolved | ${doc.summary.resolvedComments} |`);
      lines.push(`| Behaviors | ${doc.summary.totalBehaviors} |`);
      lines.push(`| Screens | ${doc.summary.totalScreens} |`);
      lines.push('');

      for (const section of doc.sections) {
        lines.push(`## ${section.screenName}\n`);

        if (section.screenComments.length > 0) {
          lines.push(`### Screen-Level Comments\n`);
          for (const c of section.screenComments) {
            const status = c.status === 'open' ? '[ ]' : '[x]';
            const badge = `\`${c.commentType}\``;
            lines.push(`- ${status} ${badge} **${c.authorName}**: ${c.content}`);
          }
          lines.push('');
        }

        for (const el of section.elements) {
          lines.push(`### ${el.nodeName} (\`${el.nodeType}\`)\n`);

          if (el.behaviors.length > 0) {
            lines.push(`**Behaviors:**\n`);
            for (const b of el.behaviors) {
              lines.push(`- State Machine: *${b.stateMachineName}*`);
              for (const t of b.relevantTransitions) {
                lines.push(`  - \`${t.event}\`: ${t.fromState} -> ${t.toState} (${t.actionCount} actions)`);
              }
            }
            lines.push('');
          }

          if (el.comments.length > 0) {
            lines.push(`**Comments:**\n`);
            for (const c of el.comments) {
              const status = c.status === 'open' ? '[ ]' : '[x]';
              const badge = `\`${c.commentType}\``;
              lines.push(`- ${status} ${badge} **${c.authorName}**: ${c.content}`);
            }
            lines.push('');
          }
        }
      }

      return lines.join('\n');
    },

    exportAsHTML: (doc) => {
      const md = get().exportAsMarkdown(doc);
      // Simple markdown-to-HTML conversion for export
      const html = md
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/\| (.+) \|/g, (match) => {
          const cells = match
            .split('|')
            .filter((c) => c.trim())
            .map((c) => `<td>${c.trim()}</td>`)
            .join('');
          return `<tr>${cells}</tr>`;
        })
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');

      return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${doc.projectName} - Design Review</title>
  <style>
    body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #333; }
    h1 { border-bottom: 2px solid #eee; padding-bottom: 8px; }
    h2 { margin-top: 32px; color: #1a1a2e; }
    h3 { margin-top: 24px; color: #444; }
    code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-size: 13px; }
    li { margin: 4px 0; }
    table { border-collapse: collapse; width: 100%; margin: 12px 0; }
    td, th { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
    tr:nth-child(even) { background: #f9f9f9; }
  </style>
</head>
<body>
  <p>${html}</p>
</body>
</html>`;
    },
  })),
);
