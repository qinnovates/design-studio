import { create } from 'zustand';

// ─── Types ───────────────────────────────────────────────────

export type FeatureStatus = 'proposed' | 'approved' | 'in-design' | 'in-review' | 'shipped' | 'cut';
export type FeaturePriority = 'p0-critical' | 'p1-high' | 'p2-medium' | 'p3-low';

export interface Feature {
  id: string;
  title: string;
  description: string;
  status: FeatureStatus;
  priority: FeaturePriority;
  /** Which screens implement this feature */
  screenIds: string[];
  /** Related task IDs from pmStore */
  taskIds: string[];
  /** Feedback score (aggregated from linked screens) */
  feedbackScore: number;
  /** Pipeline progress of linked screens */
  pipelineProgress: {
    total: number;
    draft: number;
    review: number;
    approved: number;
    exportReady: number;
    shipped: number;
  };
  /** Who proposed this feature */
  proposedBy: string;
  /** Who approved it */
  approvedBy: string[];
  /** Tags for filtering */
  tags: string[];
  /** Target milestone */
  milestoneId: string | null;
  /** Notes / rationale */
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Store ───────────────────────────────────────────────────

interface FeatureState {
  features: Record<string, Feature>;

  // Actions
  addFeature: (feature: Omit<Feature, 'id' | 'feedbackScore' | 'pipelineProgress' | 'createdAt' | 'updatedAt'>) => string;
  updateFeature: (id: string, updates: Partial<Feature>) => void;
  removeFeature: (id: string) => void;
  moveFeature: (id: string, status: FeatureStatus) => void;
  linkScreen: (featureId: string, screenId: string) => void;
  unlinkScreen: (featureId: string, screenId: string) => void;
  linkTask: (featureId: string, taskId: string) => void;
  approveFeature: (featureId: string, approver: string) => void;

  // Queries
  getByStatus: (status: FeatureStatus) => Feature[];
  getByScreen: (screenId: string) => Feature[];
  getByPriority: (priority: FeaturePriority) => Feature[];
  getStats: () => {
    total: number;
    byStatus: Record<FeatureStatus, number>;
    byPriority: Record<FeaturePriority, number>;
    shippedThisMonth: number;
  };
}

let featureCounter = 0;

export const useFeatureStore = create<FeatureState>()((set, get) => ({
  features: {},

  addFeature: (featureData) => {
    const id = `feat-${Date.now().toString(36)}-${featureCounter++}`;
    const now = new Date().toISOString();
    set((state) => ({
      features: {
        ...state.features,
        [id]: {
          ...featureData,
          id,
          feedbackScore: 0,
          pipelineProgress: { total: 0, draft: 0, review: 0, approved: 0, exportReady: 0, shipped: 0 },
          createdAt: now,
          updatedAt: now,
        },
      },
    }));
    return id;
  },

  updateFeature: (id, updates) => {
    set((state) => {
      const feat = state.features[id];
      if (!feat) return state;
      return {
        features: { ...state.features, [id]: { ...feat, ...updates, updatedAt: new Date().toISOString() } },
      };
    });
  },

  removeFeature: (id) => {
    set((state) => {
      const { [id]: _, ...rest } = state.features;
      return { features: rest };
    });
  },

  moveFeature: (id, status) => {
    get().updateFeature(id, { status });
  },

  linkScreen: (featureId, screenId) => {
    const feat = get().features[featureId];
    if (feat && !feat.screenIds.includes(screenId)) {
      get().updateFeature(featureId, { screenIds: [...feat.screenIds, screenId] });
    }
  },

  unlinkScreen: (featureId, screenId) => {
    const feat = get().features[featureId];
    if (feat) {
      get().updateFeature(featureId, { screenIds: feat.screenIds.filter((id) => id !== screenId) });
    }
  },

  linkTask: (featureId, taskId) => {
    const feat = get().features[featureId];
    if (feat && !feat.taskIds.includes(taskId)) {
      get().updateFeature(featureId, { taskIds: [...feat.taskIds, taskId] });
    }
  },

  approveFeature: (featureId, approver) => {
    const feat = get().features[featureId];
    if (feat && !feat.approvedBy.includes(approver)) {
      get().updateFeature(featureId, {
        approvedBy: [...feat.approvedBy, approver],
        status: feat.status === 'proposed' ? 'approved' : feat.status,
      });
    }
  },

  // Queries
  getByStatus: (status) => {
    return Object.values(get().features)
      .filter((f) => f.status === status)
      .sort((a, b) => {
        const order: Record<FeaturePriority, number> = { 'p0-critical': 0, 'p1-high': 1, 'p2-medium': 2, 'p3-low': 3 };
        return order[a.priority] - order[b.priority];
      });
  },

  getByScreen: (screenId) => {
    return Object.values(get().features).filter((f) => f.screenIds.includes(screenId));
  },

  getByPriority: (priority) => {
    return Object.values(get().features).filter((f) => f.priority === priority);
  },

  getStats: () => {
    const features = Object.values(get().features);
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const byStatus: Record<FeatureStatus, number> = { proposed: 0, approved: 0, 'in-design': 0, 'in-review': 0, shipped: 0, cut: 0 };
    const byPriority: Record<FeaturePriority, number> = { 'p0-critical': 0, 'p1-high': 0, 'p2-medium': 0, 'p3-low': 0 };
    let shippedThisMonth = 0;

    for (const f of features) {
      byStatus[f.status]++;
      byPriority[f.priority]++;
      if (f.status === 'shipped' && f.updatedAt >= monthAgo) shippedThisMonth++;
    }

    return { total: features.length, byStatus, byPriority, shippedThisMonth };
  },
}));
