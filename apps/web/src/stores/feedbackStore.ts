import { create } from 'zustand';

// ─── Types ───────────────────────────────────────────────────

export type FeedbackTargetType =
  | 'screen'        // A screen in the app
  | 'component'     // A component on the canvas
  | 'token'         // A design token (color, font, spacing)
  | 'font'          // Font selection
  | 'annotation'    // A design note
  | 'decision'      // A design decision
  | 'general';      // Overall project feedback

export type VoteType = 'like' | 'dislike';

export interface FeedbackTarget {
  id: string;
  type: FeedbackTargetType;
  /** Reference to the actual element (screen ID, node ID, token name, etc.) */
  refId: string;
  /** Human-readable label */
  label: string;
}

export interface Vote {
  id: string;
  targetId: string;
  userId: string;
  userName: string;
  type: VoteType;
  createdAt: string;
}

export interface FeedbackComment {
  id: string;
  targetId: string;
  userId: string;
  userName: string;
  content: string;
  /** Optional status tag */
  status: 'open' | 'resolved' | 'wontfix' | null;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackSummary {
  targetId: string;
  target: FeedbackTarget;
  likes: number;
  dislikes: number;
  /** Net score (likes - dislikes) */
  score: number;
  commentCount: number;
  /** Most recent activity timestamp */
  lastActivity: string;
}

// ─── Store ───────────────────────────────────────────────────

interface FeedbackState {
  targets: Record<string, FeedbackTarget>;
  votes: Record<string, Vote>;
  comments: Record<string, FeedbackComment>;

  // Actions — Targets
  registerTarget: (target: FeedbackTarget) => void;
  removeTarget: (targetId: string) => void;

  // Actions — Votes
  vote: (targetId: string, type: VoteType, userName?: string) => void;
  removeVote: (targetId: string, userId: string) => void;
  getVotesForTarget: (targetId: string) => Vote[];

  // Actions — Comments
  addComment: (targetId: string, content: string, userName?: string, parentId?: string | null) => string;
  updateComment: (commentId: string, updates: Partial<FeedbackComment>) => void;
  removeComment: (commentId: string) => void;
  resolveComment: (commentId: string) => void;
  getCommentsForTarget: (targetId: string) => FeedbackComment[];
  getThreadReplies: (parentId: string) => FeedbackComment[];

  // Aggregation
  getSummary: (targetId: string) => FeedbackSummary | null;
  getAllSummaries: () => FeedbackSummary[];
  getTopLiked: (limit?: number) => FeedbackSummary[];
  getTopDisliked: (limit?: number) => FeedbackSummary[];
  getMostDiscussed: (limit?: number) => FeedbackSummary[];
  getRecentActivity: (limit?: number) => (Vote | FeedbackComment)[];

  // Bulk registration
  registerScreenTargets: (screens: { id: string; name: string }[]) => void;
  registerTokenTargets: (tokens: { name: string; value: string }[]) => void;
}

let idCounter = 0;
const genId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${idCounter++}`;
const DEFAULT_USER = 'user-1';
const DEFAULT_NAME = 'You';

export const useFeedbackStore = create<FeedbackState>()((set, get) => ({
  targets: {},
  votes: {},
  comments: {},

  // ── Targets ──────────────────────────────
  registerTarget: (target) => {
    set((state) => ({
      targets: { ...state.targets, [target.id]: target },
    }));
  },

  removeTarget: (targetId) => {
    set((state) => {
      const { [targetId]: _, ...remaining } = state.targets;
      return { targets: remaining };
    });
  },

  // ── Votes ────────────────────────────────
  vote: (targetId, type, userName = DEFAULT_NAME) => {
    const userId = DEFAULT_USER;
    // Remove existing vote from this user on this target
    const existing = Object.values(get().votes).find(
      (v) => v.targetId === targetId && v.userId === userId,
    );

    set((state) => {
      const votes = { ...state.votes };
      // Remove old vote if exists
      if (existing) delete votes[existing.id];
      // Add new vote (unless toggling same type = remove)
      if (!existing || existing.type !== type) {
        const id = genId('vote');
        votes[id] = { id, targetId, userId, userName, type, createdAt: new Date().toISOString() };
      }
      return { votes };
    });
  },

  removeVote: (targetId, userId) => {
    set((state) => {
      const votes = { ...state.votes };
      const match = Object.values(votes).find(
        (v) => v.targetId === targetId && v.userId === userId,
      );
      if (match) delete votes[match.id];
      return { votes };
    });
  },

  getVotesForTarget: (targetId) => {
    return Object.values(get().votes).filter((v) => v.targetId === targetId);
  },

  // ── Comments ─────────────────────────────
  addComment: (targetId, content, userName = DEFAULT_NAME, parentId = null) => {
    const id = genId('comment');
    const now = new Date().toISOString();
    set((state) => ({
      comments: {
        ...state.comments,
        [id]: {
          id,
          targetId,
          userId: DEFAULT_USER,
          userName,
          content,
          status: null,
          parentId,
          createdAt: now,
          updatedAt: now,
        },
      },
    }));
    return id;
  },

  updateComment: (commentId, updates) => {
    set((state) => {
      const comment = state.comments[commentId];
      if (!comment) return state;
      return {
        comments: {
          ...state.comments,
          [commentId]: { ...comment, ...updates, updatedAt: new Date().toISOString() },
        },
      };
    });
  },

  removeComment: (commentId) => {
    set((state) => {
      const { [commentId]: _, ...remaining } = state.comments;
      return { comments: remaining };
    });
  },

  resolveComment: (commentId) => {
    get().updateComment(commentId, { status: 'resolved' });
  },

  getCommentsForTarget: (targetId) => {
    return Object.values(get().comments)
      .filter((c) => c.targetId === targetId && !c.parentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getThreadReplies: (parentId) => {
    return Object.values(get().comments)
      .filter((c) => c.parentId === parentId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  },

  // ── Aggregation ──────────────────────────
  getSummary: (targetId) => {
    const state = get();
    const target = state.targets[targetId];
    if (!target) return null;
    const votes = Object.values(state.votes).filter((v) => v.targetId === targetId);
    const comments = Object.values(state.comments).filter((c) => c.targetId === targetId);
    const likes = votes.filter((v) => v.type === 'like').length;
    const dislikes = votes.filter((v) => v.type === 'dislike').length;
    const allActivity = [...votes, ...comments];
    const lastActivity = allActivity.length > 0
      ? allActivity.reduce((latest, item) => {
          const time = 'createdAt' in item ? item.createdAt : '';
          return time > latest ? time : latest;
        }, '')
      : '';

    return { targetId, target, likes, dislikes, score: likes - dislikes, commentCount: comments.length, lastActivity };
  },

  getAllSummaries: () => {
    const state = get();
    return Object.keys(state.targets)
      .map((id) => state.getSummary(id))
      .filter((s): s is FeedbackSummary => s !== null)
      .sort((a, b) => {
        if (b.lastActivity && a.lastActivity) return b.lastActivity.localeCompare(a.lastActivity);
        return 0;
      });
  },

  getTopLiked: (limit = 5) => {
    return get().getAllSummaries().sort((a, b) => b.score - a.score).slice(0, limit);
  },

  getTopDisliked: (limit = 5) => {
    return get().getAllSummaries().sort((a, b) => a.score - b.score).slice(0, limit);
  },

  getMostDiscussed: (limit = 5) => {
    return get().getAllSummaries().sort((a, b) => b.commentCount - a.commentCount).slice(0, limit);
  },

  getRecentActivity: (limit = 20) => {
    const state = get();
    const allItems: (Vote | FeedbackComment)[] = [
      ...Object.values(state.votes),
      ...Object.values(state.comments),
    ];
    return allItems
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  },

  // ── Bulk Registration ────────────────────
  registerScreenTargets: (screens) => {
    set((state) => {
      const targets = { ...state.targets };
      for (const screen of screens) {
        const id = `screen-${screen.id}`;
        targets[id] = { id, type: 'screen', refId: screen.id, label: screen.name };
      }
      return { targets };
    });
  },

  registerTokenTargets: (tokens) => {
    set((state) => {
      const targets = { ...state.targets };
      for (const token of tokens) {
        const id = `token-${token.name}`;
        targets[id] = { id, type: 'token', refId: token.name, label: token.name };
      }
      return { targets };
    });
  },
}));
