import { create } from 'zustand';

// ─── Types ───────────────────────────────────────────────────

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskCategory =
  | 'design'       // UI/UX design work
  | 'feedback'     // Feedback to address
  | 'bug'          // Bug to fix
  | 'feature'      // New feature
  | 'content'      // Copy/content changes
  | 'accessibility' // A11y improvements
  | 'other';

export interface PMTask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  assignee: string;
  /** Link to a screen, component, or element */
  linkedScreenId: string | null;
  linkedNodeId: string | null;
  tags: string[];
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  taskIds: string[];
  dueDate: string | null;
  createdAt: string;
}

// ─── Store ───────────────────────────────────────────────────

interface PMState {
  tasks: Record<string, PMTask>;
  milestones: Record<string, Milestone>;

  // Actions — Tasks
  addTask: (task: Omit<PMTask, 'id' | 'completedAt' | 'createdAt' | 'updatedAt'>) => string;
  updateTask: (id: string, updates: Partial<PMTask>) => void;
  removeTask: (id: string) => void;
  moveTask: (id: string, status: TaskStatus) => void;
  completeTask: (id: string) => void;

  // Actions — Milestones
  addMilestone: (name: string, description?: string, dueDate?: string | null) => string;
  updateMilestone: (id: string, updates: Partial<Milestone>) => void;
  removeMilestone: (id: string) => void;
  addTaskToMilestone: (milestoneId: string, taskId: string) => void;
  removeTaskFromMilestone: (milestoneId: string, taskId: string) => void;

  // Queries
  getTasksByStatus: (status: TaskStatus) => PMTask[];
  getTasksByScreen: (screenId: string) => PMTask[];
  getTasksByCategory: (category: TaskCategory) => PMTask[];
  getOverdueTasks: () => PMTask[];
  getMilestoneProgress: (milestoneId: string) => { total: number; done: number; percent: number };
  getStats: () => {
    total: number;
    byStatus: Record<TaskStatus, number>;
    byPriority: Record<TaskPriority, number>;
    byCategory: Record<TaskCategory, number>;
    completedThisWeek: number;
    overdue: number;
  };
}

let taskCounter = 0;
let milestoneCounter = 0;
const genTaskId = () => `task-${Date.now().toString(36)}-${taskCounter++}`;
const genMilestoneId = () => `ms-${Date.now().toString(36)}-${milestoneCounter++}`;

export const usePMStore = create<PMState>()((set, get) => ({
  tasks: {},
  milestones: {},

  // ── Task Actions ─────────────────────────
  addTask: (taskData) => {
    const id = genTaskId();
    const now = new Date().toISOString();
    set((state) => ({
      tasks: {
        ...state.tasks,
        [id]: { ...taskData, id, completedAt: null, createdAt: now, updatedAt: now },
      },
    }));
    return id;
  },

  updateTask: (id, updates) => {
    set((state) => {
      const task = state.tasks[id];
      if (!task) return state;
      return {
        tasks: { ...state.tasks, [id]: { ...task, ...updates, updatedAt: new Date().toISOString() } },
      };
    });
  },

  removeTask: (id) => {
    set((state) => {
      const { [id]: _, ...remaining } = state.tasks;
      // Also remove from milestones
      const milestones = { ...state.milestones };
      for (const ms of Object.values(milestones)) {
        ms.taskIds = ms.taskIds.filter((tid) => tid !== id);
      }
      return { tasks: remaining, milestones };
    });
  },

  moveTask: (id, status) => {
    get().updateTask(id, {
      status,
      completedAt: status === 'done' ? new Date().toISOString() : null,
    });
  },

  completeTask: (id) => {
    get().moveTask(id, 'done');
  },

  // ── Milestone Actions ────────────────────
  addMilestone: (name, description = '', dueDate = null) => {
    const id = genMilestoneId();
    set((state) => ({
      milestones: {
        ...state.milestones,
        [id]: { id, name, description, taskIds: [], dueDate, createdAt: new Date().toISOString() },
      },
    }));
    return id;
  },

  updateMilestone: (id, updates) => {
    set((state) => {
      const ms = state.milestones[id];
      if (!ms) return state;
      return { milestones: { ...state.milestones, [id]: { ...ms, ...updates } } };
    });
  },

  removeMilestone: (id) => {
    set((state) => {
      const { [id]: _, ...remaining } = state.milestones;
      return { milestones: remaining };
    });
  },

  addTaskToMilestone: (milestoneId, taskId) => {
    set((state) => {
      const ms = state.milestones[milestoneId];
      if (!ms || ms.taskIds.includes(taskId)) return state;
      return {
        milestones: {
          ...state.milestones,
          [milestoneId]: { ...ms, taskIds: [...ms.taskIds, taskId] },
        },
      };
    });
  },

  removeTaskFromMilestone: (milestoneId, taskId) => {
    set((state) => {
      const ms = state.milestones[milestoneId];
      if (!ms) return state;
      return {
        milestones: {
          ...state.milestones,
          [milestoneId]: { ...ms, taskIds: ms.taskIds.filter((id) => id !== taskId) },
        },
      };
    });
  },

  // ── Queries ──────────────────────────────
  getTasksByStatus: (status) => {
    return Object.values(get().tasks)
      .filter((t) => t.status === status)
      .sort((a, b) => {
        const priorityOrder: Record<TaskPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  },

  getTasksByScreen: (screenId) => {
    return Object.values(get().tasks).filter((t) => t.linkedScreenId === screenId);
  },

  getTasksByCategory: (category) => {
    return Object.values(get().tasks).filter((t) => t.category === category);
  },

  getOverdueTasks: () => {
    const now = new Date().toISOString();
    return Object.values(get().tasks).filter(
      (t) => t.dueDate && t.dueDate < now && t.status !== 'done',
    );
  },

  getMilestoneProgress: (milestoneId) => {
    const state = get();
    const ms = state.milestones[milestoneId];
    if (!ms) return { total: 0, done: 0, percent: 0 };
    const total = ms.taskIds.length;
    const done = ms.taskIds.filter((id) => state.tasks[id]?.status === 'done').length;
    return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
  },

  getStats: () => {
    const tasks = Object.values(get().tasks);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const byStatus: Record<TaskStatus, number> = { 'todo': 0, 'in-progress': 0, 'review': 0, 'done': 0 };
    const byPriority: Record<TaskPriority, number> = { low: 0, medium: 0, high: 0, urgent: 0 };
    const byCategory: Record<TaskCategory, number> = { design: 0, feedback: 0, bug: 0, feature: 0, content: 0, accessibility: 0, other: 0 };

    let completedThisWeek = 0;
    let overdue = 0;

    for (const task of tasks) {
      byStatus[task.status]++;
      byPriority[task.priority]++;
      byCategory[task.category]++;
      if (task.completedAt && task.completedAt >= weekAgo) completedThisWeek++;
      if (task.dueDate && task.dueDate < now.toISOString() && task.status !== 'done') overdue++;
    }

    return { total: tasks.length, byStatus, byPriority, byCategory, completedThisWeek, overdue };
  },
}));
