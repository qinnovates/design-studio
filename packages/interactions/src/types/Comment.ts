// ─── Comment Types ──────────────────────────────────────────

export type CommentType = 'design-note' | 'bug' | 'question' | 'approval' | 'general';
export type CommentStatus = 'open' | 'resolved' | 'wontfix';

export interface ContextualComment {
  id: string;
  /** Screen ID this comment belongs to */
  screenId: string;
  /** Node ID this comment is anchored to (null = screen-level) */
  nodeId: string | null;
  /** Author info */
  authorId: string;
  authorName: string;
  /** Comment body (markdown supported) */
  content: string;
  /** Thread parent (null = root comment) */
  parentId: string | null;
  /** Classification */
  commentType: CommentType;
  /** Resolution status */
  status: CommentStatus;
  /** If linked to a state machine transition */
  linkedTransitionId?: string;
  /** If linked to a state machine state */
  linkedStateId?: string;
  /** Timestamps */
  createdAt: string;
  updatedAt: string;
}

// ─── Documentation Types ────────────────────────────────────

export interface DocElement {
  nodeId: string;
  nodeName: string;
  nodeType: string;
  comments: ContextualComment[];
  behaviors: DocBehavior[];
}

export interface DocBehavior {
  stateMachineId: string;
  stateMachineName: string;
  relevantTransitions: {
    id: string;
    event: string;
    fromState: string;
    toState: string;
    actionCount: number;
  }[];
}

export interface DocSection {
  screenId: string;
  screenName: string;
  elements: DocElement[];
  /** Screen-level comments (not anchored to any element) */
  screenComments: ContextualComment[];
}

export interface DesignDocument {
  projectId: string;
  projectName: string;
  generatedAt: string;
  sections: DocSection[];
  summary: {
    totalComments: number;
    openComments: number;
    resolvedComments: number;
    totalBehaviors: number;
    totalScreens: number;
  };
}

// ─── Filter Types ───────────────────────────────────────────

export interface CommentFilters {
  status: CommentStatus | 'all';
  commentType: CommentType | 'all';
  authorId: string | 'all';
  screenId: string | 'all';
  nodeId: string | 'all';
  searchQuery: string;
}

export const DEFAULT_COMMENT_FILTERS: CommentFilters = {
  status: 'all',
  commentType: 'all',
  authorId: 'all',
  screenId: 'all',
  nodeId: 'all',
  searchQuery: '',
};
