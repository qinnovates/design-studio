'use client';

import { useMemo, useState, useCallback } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { useCanvasStore } from '@/stores/canvasStore';
import { useTokenStore } from '@/stores/tokenStore';
import { useFeedbackStore } from '@/stores/feedbackStore';
import type { Vote } from '@/stores/feedbackStore';
import { usePMStore } from '@/stores/pmStore';
import { useUIStore } from '@/stores/uiStore';
import { ComponentRegistry } from '@design-studio/components';
import { buildAppGraph, getScreenColor, FONT_LIBRARY } from '@design-studio/app';
import type { TaskStatus, TaskPriority, TaskCategory } from '@/stores/pmStore';
// ─── Helpers ────────────────────────────────────────────────

const P_CLR: Record<TaskPriority, string> = {
  urgent: 'bg-red-600 text-white', high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-400 text-gray-900', low: 'bg-gray-200 text-gray-700',
};
const C_CLR: Record<TaskCategory, string> = {
  design: 'bg-purple-100 text-purple-700', feedback: 'bg-blue-100 text-blue-700',
  bug: 'bg-red-100 text-red-700', feature: 'bg-green-100 text-green-700',
  content: 'bg-yellow-100 text-yellow-700', accessibility: 'bg-teal-100 text-teal-700',
  other: 'bg-gray-100 text-gray-600',
};
const COLUMNS: { key: TaskStatus; label: string; border: string }[] = [
  { key: 'todo', label: 'To Do', border: 'border-gray-300' },
  { key: 'in-progress', label: 'In Progress', border: 'border-blue-400' },
  { key: 'review', label: 'Review', border: 'border-yellow-400' },
  { key: 'done', label: 'Done', border: 'border-green-400' },
];

function timeAgo(iso: string): string {
  const d = Date.now() - new Date(iso).getTime();
  const m = Math.floor(d / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function Hdr({ title, count }: { title: string; count?: number }) {
  return (
    <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 px-3 py-1.5 flex items-center gap-2">
      <h2 className="text-xs font-bold text-gray-100 uppercase tracking-wider">{title}</h2>
      {count !== undefined && <span className="text-[10px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded-full">{count}</span>}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────

export default function CommandCenter() {
  const manifest = useProjectStore((s) => s.manifest);
  const setActiveScreen = useProjectStore((s) => s.setActiveScreen);
  const setActiveView = useUIStore((s) => s.setActiveView);
  const sceneGraph = useCanvasStore((s) => s.sceneGraph);
  const { tokenSets, activeSetId, resolvedTokens, headingFontId, bodyFontId } = useTokenStore();
  const feedbackStore = useFeedbackStore();
  const pmStore = usePMStore();

  const screens = useMemo(() => {
    if (!manifest) return [];
    return Object.values(manifest.screens).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [manifest]);

  const nodeCount = Object.keys(sceneGraph.nodes).length;
  const tokenCount = useMemo(() => {
    const set = tokenSets[activeSetId];
    return set ? Object.keys(set.tokens).length : 0;
  }, [tokenSets, activeSetId]);

  const stats = useMemo(() => pmStore.getStats(), [pmStore]);
  const totalTasks = stats.total;
  const completionPct = totalTasks > 0 ? Math.round((stats.byStatus.done / totalTasks) * 100) : 0;

  // ── Component inventory ──
  const componentInventory = useMemo(() => {
    const counts = new Map<string, number>();
    for (const node of Object.values(sceneGraph.nodes)) {
      if (node.type === 'component') {
        counts.set(node.componentId, (counts.get(node.componentId) ?? 0) + 1);
      }
    }
    const allDefs = ComponentRegistry.getAll();
    return allDefs.map((def) => ({
      ...def,
      instanceCount: counts.get(def.id) ?? 0,
    })).sort((a, b) => b.instanceCount - a.instanceCount);
  }, [sceneGraph.nodes]);

  const maxInstances = useMemo(
    () => Math.max(1, ...componentInventory.map((c) => c.instanceCount)),
    [componentInventory],
  );

  // ── Color tokens ──
  const colorTokens = useMemo(() => {
    const set = tokenSets[activeSetId];
    if (!set) return [];
    return Object.values(set.tokens).filter((t) => t.type === 'color' && t.name.startsWith('color.'));
  }, [tokenSets, activeSetId]);

  // ── Spacing tokens ──
  const spacingTokens = useMemo(() => {
    const set = tokenSets[activeSetId];
    if (!set) return [];
    return Object.values(set.tokens).filter((t) => t.type === 'spacing');
  }, [tokenSets, activeSetId]);

  // ── Fonts ──
  const headingFont = useMemo(() => FONT_LIBRARY.find((f) => f.id === headingFontId), [headingFontId]);
  const bodyFont = useMemo(() => FONT_LIBRARY.find((f) => f.id === bodyFontId), [bodyFontId]);

  // ── Feedback data ──
  const topLiked = useMemo(() => feedbackStore.getTopLiked(3), [feedbackStore]);
  const topDisliked = useMemo(() => feedbackStore.getTopDisliked(3), [feedbackStore]);
  const mostDiscussed = useMemo(() => feedbackStore.getMostDiscussed(3), [feedbackStore]);
  const recentActivity = useMemo(() => feedbackStore.getRecentActivity(15), [feedbackStore]);

  // ── Milestones ──
  const milestones = useMemo(() => Object.values(pmStore.milestones), [pmStore.milestones]);

  // ── Navigate to screen ──
  const goToScreen = useCallback((screenId: string) => {
    setActiveScreen(screenId);
    setActiveView('canvas');
  }, [setActiveScreen, setActiveView]);

  // ── Add task ──
  const [addingTaskColumn, setAddingTaskColumn] = useState<TaskStatus | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = useCallback((status: TaskStatus) => {
    if (!newTaskTitle.trim()) return;
    pmStore.addTask({
      title: newTaskTitle.trim(),
      description: '',
      status,
      priority: 'medium',
      category: 'other',
      assignee: '',
      linkedScreenId: null,
      linkedNodeId: null,
      tags: [],
      dueDate: null,
    });
    setNewTaskTitle('');
    setAddingTaskColumn(null);
  }, [newTaskTitle, pmStore]);

  if (!manifest) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-gray-400 text-sm">
        No project loaded. Scaffold a project to see the Command Center.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-900 text-gray-100 scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-gray-700">
      {/* ── Section 1: Project Header ─────────────── */}
      <div className="border-b border-gray-700 px-4 py-3">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-lg font-bold text-white truncate">{manifest.name}</h1>
          {manifest.platforms.map((p) => (
            <span key={p} className="text-[10px] bg-blue-900/50 text-blue-300 px-1.5 py-0.5 rounded font-mono uppercase">
              {p}
            </span>
          ))}
          <span className="text-[10px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded capitalize">
            {manifest.category}
          </span>
        </div>
        {manifest.description && (
          <p className="text-xs text-gray-400 mb-2 line-clamp-1">{manifest.description}</p>
        )}
        {/* Stats row */}
        <div className="flex items-center gap-4 text-[11px] mb-2">
          <span className="text-blue-400">{screens.length} screens</span>
          <span className="text-purple-400">{nodeCount} canvas nodes</span>
          <span className="text-yellow-400">{tokenCount} tokens</span>
          <span className="text-green-400">{totalTasks} tasks</span>
          {stats.overdue > 0 && <span className="text-red-400">{stats.overdue} overdue</span>}
        </div>
        {/* Progress bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <span className="text-[10px] text-gray-400 w-8 text-right">{completionPct}%</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-0">
        {/* ── Section 2: Screen Grid ───────────────── */}
        <div className="col-span-12 lg:col-span-8">
          <Hdr title="Screens" count={screens.length} />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-3">
            {screens.map((screen) => {
              const color = getScreenColor(screen.type);
              const fbId = `screen-${screen.id}`;
              const summary = feedbackStore.getSummary(fbId);
              return (
                <button
                  key={screen.id}
                  onClick={() => goToScreen(screen.id)}
                  className="text-left bg-gray-800 border border-gray-700 rounded-lg p-2 hover:border-gray-500 hover:bg-gray-750 transition-colors group relative"
                  aria-label={`Navigate to screen: ${screen.name}`}
                >
                  {/* Badges row */}
                  <div className="flex items-center gap-1 mb-1">
                    <span
                      className="text-[9px] font-bold uppercase px-1 py-0.5 rounded"
                      style={{ backgroundColor: color + '20', color }}
                    >
                      {screen.type}
                    </span>
                    {screen.isEntryPoint && (
                      <span className="text-[9px] bg-green-900/50 text-green-400 px-1 py-0.5 rounded">entry</span>
                    )}
                    {screen.requiresAuth && (
                      <span className="text-[9px] bg-red-900/50 text-red-400 px-1 py-0.5 rounded">auth</span>
                    )}
                  </div>
                  {/* Name + route */}
                  <p className="text-xs font-semibold text-gray-100 truncate">{screen.name}</p>
                  <p className="text-[10px] text-gray-500 truncate font-mono">{screen.route || '/'}</p>
                  {/* Feedback row */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); feedbackStore.vote(fbId, 'like'); }}
                      className="flex items-center gap-0.5 text-[10px] text-gray-500 hover:text-green-400 transition-colors"
                      aria-label={`Like ${screen.name}`}
                    >
                      <span>&#9650;</span>
                      <span>{summary?.likes ?? 0}</span>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); feedbackStore.vote(fbId, 'dislike'); }}
                      className="flex items-center gap-0.5 text-[10px] text-gray-500 hover:text-red-400 transition-colors"
                      aria-label={`Dislike ${screen.name}`}
                    >
                      <span>&#9660;</span>
                      <span>{summary?.dislikes ?? 0}</span>
                    </button>
                    {(summary?.commentCount ?? 0) > 0 && (
                      <span className="text-[10px] text-gray-500 ml-auto">{summary!.commentCount} comments</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Section 4: Component Inventory ──────── */}
        <div className="col-span-12 lg:col-span-4">
          <Hdr title="Components" count={componentInventory.length} />
          <div className="grid grid-cols-2 gap-1.5 p-3">
            {componentInventory.map((comp) => {
              const opacity = comp.instanceCount > 0 ? 0.3 + (comp.instanceCount / maxInstances) * 0.7 : 0.15;
              return (
                <div
                  key={comp.id}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded border border-gray-700 text-xs"
                  style={{ backgroundColor: `rgba(99,102,241,${opacity})` }}
                >
                  <span className="text-sm">{comp.icon}</span>
                  <span className="text-gray-200 truncate flex-1">{comp.name}</span>
                  <span className="text-[10px] text-gray-400 font-mono">{comp.instanceCount}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Section 3: Task Board (Kanban) ───────── */}
        <div className="col-span-12">
          <Hdr title="Tasks" count={totalTasks} />
          <div className="grid grid-cols-4 gap-2 p-3">
            {COLUMNS.map(({ key, label, border }) => {
              const tasks = pmStore.getTasksByStatus(key);
              return (
                <div key={key} className={`border-t-2 ${border} bg-gray-800/50 rounded-lg`}>
                  <div className="flex items-center justify-between px-2 py-1.5 border-b border-gray-700">
                    <span className="text-[11px] font-bold text-gray-300 uppercase">{label}</span>
                    <span className="text-[10px] bg-gray-700 text-gray-400 px-1.5 rounded-full">{tasks.length}</span>
                  </div>
                  <div className="p-1.5 space-y-1 max-h-48 overflow-y-auto">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-gray-800 border border-gray-700 rounded p-1.5 text-xs cursor-grab hover:border-gray-500 transition-colors"
                        title="Drag to move (visual only)"
                      >
                        <p className="text-gray-200 font-medium truncate">{task.title}</p>
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          <span className={`text-[9px] px-1 py-0.5 rounded font-bold ${P_CLR[task.priority]}`}>
                            {task.priority}
                          </span>
                          <span className={`text-[9px] px-1 py-0.5 rounded ${C_CLR[task.category]}`}>
                            {task.category}
                          </span>
                          {task.assignee && (
                            <span className="text-[9px] text-gray-500 ml-auto truncate max-w-[60px]">{task.assignee}</span>
                          )}
                        </div>
                        {task.linkedScreenId && manifest.screens[task.linkedScreenId] && (
                          <button
                            onClick={() => goToScreen(task.linkedScreenId!)}
                            className="text-[9px] text-blue-400 hover:text-blue-300 mt-0.5 truncate block"
                            aria-label={`Go to linked screen: ${manifest.screens[task.linkedScreenId]?.name}`}
                          >
                            {manifest.screens[task.linkedScreenId]?.name}
                          </button>
                        )}
                      </div>
                    ))}
                    {/* Add task */}
                    {addingTaskColumn === key ? (
                      <div className="flex gap-1">
                        <input
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddTask(key)}
                          placeholder="Task title..."
                          className="flex-1 bg-gray-700 border border-gray-600 rounded px-1.5 py-1 text-[11px] text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500"
                          autoFocus
                          aria-label="New task title"
                        />
                        <button
                          onClick={() => handleAddTask(key)}
                          className="text-[10px] bg-blue-600 text-white px-1.5 rounded hover:bg-blue-500"
                          aria-label="Confirm add task"
                        >
                          +
                        </button>
                        <button
                          onClick={() => { setAddingTaskColumn(null); setNewTaskTitle(''); }}
                          className="text-[10px] text-gray-500 hover:text-gray-300"
                          aria-label="Cancel add task"
                        >
                          x
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingTaskColumn(key)}
                        className="w-full text-[10px] text-gray-500 hover:text-gray-300 py-1 border border-dashed border-gray-700 rounded hover:border-gray-500 transition-colors"
                        aria-label={`Add task to ${label}`}
                      >
                        + Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Section 5: Design System Overview ───── */}
        <div className="col-span-12 lg:col-span-6">
          <Hdr title="Design System" />
          <div className="p-3 space-y-3">
            {/* Color palette */}
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Colors</p>
              <div className="flex flex-wrap gap-1">
                {colorTokens.slice(0, 24).map((token) => {
                  const resolved = resolvedTokens[token.name] ?? token.value;
                  const fbId = `token-${token.name}`;
                  return (
                    <div key={token.name} className="group relative">
                      <div
                        className="w-6 h-6 rounded border border-gray-600 cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: resolved }}
                        title={`${token.name}: ${resolved}`}
                      />
                      <div className="absolute -bottom-4 left-0 hidden group-hover:flex gap-0.5 z-20">
                        <button
                          onClick={() => feedbackStore.vote(fbId, 'like')}
                          className="text-[8px] text-green-400 hover:text-green-300"
                          aria-label={`Like color ${token.name}`}
                        >
                          &#9650;
                        </button>
                        <button
                          onClick={() => feedbackStore.vote(fbId, 'dislike')}
                          className="text-[8px] text-red-400 hover:text-red-300"
                          aria-label={`Dislike color ${token.name}`}
                        >
                          &#9660;
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Typography */}
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Typography</p>
              <div className="flex gap-4">
                <div className="flex-1">
                  <p className="text-[10px] text-gray-500">Heading</p>
                  <p className="text-sm font-bold text-gray-200" style={{ fontFamily: headingFont?.fallback }}>
                    {headingFont?.name ?? headingFontId}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-0.5">{headingFont?.description ?? ''}</p>
                  <div className="flex gap-1 mt-0.5">
                    <button
                      onClick={() => feedbackStore.vote(`font-heading-${headingFontId}`, 'like')}
                      className="text-[9px] text-gray-500 hover:text-green-400"
                      aria-label={`Like heading font ${headingFont?.name}`}
                    >
                      &#9650;
                    </button>
                    <button
                      onClick={() => feedbackStore.vote(`font-heading-${headingFontId}`, 'dislike')}
                      className="text-[9px] text-gray-500 hover:text-red-400"
                      aria-label={`Dislike heading font ${headingFont?.name}`}
                    >
                      &#9660;
                    </button>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-gray-500">Body</p>
                  <p className="text-sm text-gray-200" style={{ fontFamily: bodyFont?.fallback }}>
                    {bodyFont?.name ?? bodyFontId}
                  </p>
                  <p className="text-[10px] text-gray-600 mt-0.5">{bodyFont?.description ?? ''}</p>
                  <div className="flex gap-1 mt-0.5">
                    <button
                      onClick={() => feedbackStore.vote(`font-body-${bodyFontId}`, 'like')}
                      className="text-[9px] text-gray-500 hover:text-green-400"
                      aria-label={`Like body font ${bodyFont?.name}`}
                    >
                      &#9650;
                    </button>
                    <button
                      onClick={() => feedbackStore.vote(`font-body-${bodyFontId}`, 'dislike')}
                      className="text-[9px] text-gray-500 hover:text-red-400"
                      aria-label={`Dislike body font ${bodyFont?.name}`}
                    >
                      &#9660;
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Spacing scale */}
            {spacingTokens.length > 0 && (
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Spacing</p>
                <div className="flex items-end gap-1">
                  {spacingTokens.map((token) => {
                    const val = parseInt(resolvedTokens[token.name] ?? token.value, 10) || 4;
                    return (
                      <div key={token.name} className="flex flex-col items-center">
                        <div
                          className="bg-blue-500/40 rounded-sm"
                          style={{ width: 12, height: Math.min(val, 48) }}
                          title={`${token.name}: ${resolvedTokens[token.name] ?? token.value}`}
                        />
                        <span className="text-[8px] text-gray-600 mt-0.5">{val}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Theme badge */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500">Theme:</span>
              <span className="text-[10px] bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">
                {activeSetId.includes('dark') ? 'Dark' : 'Light'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Section 6: Feedback Summary ─────────── */}
        <div className="col-span-12 lg:col-span-6">
          <Hdr title="Feedback" />
          <div className="p-3 space-y-3">
            {/* Most Liked */}
            <div>
              <p className="text-[10px] text-green-400 uppercase tracking-wider mb-1">Most Liked</p>
              {topLiked.length === 0 ? (
                <p className="text-[10px] text-gray-600">No votes yet</p>
              ) : (
                <div className="space-y-0.5">
                  {topLiked.map((item) => (
                    <div key={item.targetId} className="flex items-center gap-2 text-[11px]">
                      <span className="text-green-400 font-mono w-6 text-right">+{item.score}</span>
                      <span className="text-gray-400 truncate">{item.target.label}</span>
                      <span className="text-[9px] text-gray-600">{item.target.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Needs Attention */}
            <div>
              <p className="text-[10px] text-red-400 uppercase tracking-wider mb-1">Needs Attention</p>
              {topDisliked.length === 0 ? (
                <p className="text-[10px] text-gray-600">Nothing flagged</p>
              ) : (
                <div className="space-y-0.5">
                  {topDisliked.map((item) => (
                    <div key={item.targetId} className="flex items-center gap-2 text-[11px]">
                      <span className="text-red-400 font-mono w-6 text-right">{item.score}</span>
                      <span className="text-gray-400 truncate">{item.target.label}</span>
                      <span className="text-[9px] text-gray-600">{item.target.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Most Discussed */}
            <div>
              <p className="text-[10px] text-blue-400 uppercase tracking-wider mb-1">Most Discussed</p>
              {mostDiscussed.length === 0 ? (
                <p className="text-[10px] text-gray-600">No comments yet</p>
              ) : (
                <div className="space-y-0.5">
                  {mostDiscussed.map((item) => (
                    <div key={item.targetId} className="flex items-center gap-2 text-[11px]">
                      <span className="text-blue-400 font-mono w-6 text-right">{item.commentCount}</span>
                      <span className="text-gray-400 truncate">{item.target.label}</span>
                      <span className="text-[9px] text-gray-600">{item.target.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Section 7: Milestones ──────────────── */}
        {milestones.length > 0 && (
          <div className="col-span-12 lg:col-span-6">
            <Hdr title="Milestones" count={milestones.length} />
            <div className="p-3 space-y-2">
              {milestones.map((ms) => {
                const progress = pmStore.getMilestoneProgress(ms.id);
                const isOverdue = ms.dueDate && ms.dueDate < new Date().toISOString();
                return (
                  <div key={ms.id} className="bg-gray-800 border border-gray-700 rounded-lg p-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-200">{ms.name}</span>
                      <span className="text-[10px] text-gray-500">
                        {progress.done}/{progress.total}
                      </span>
                    </div>
                    <div className="h-1 bg-gray-700 rounded-full overflow-hidden mb-1">
                      <div
                        className={`h-full rounded-full transition-all ${progress.percent === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-500">{progress.percent}%</span>
                      {ms.dueDate && (
                        <span className={`text-[10px] ${isOverdue ? 'text-red-400' : 'text-gray-500'}`}>
                          Due: {new Date(ms.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Section 8: Activity Feed ───────────── */}
        <div className={`col-span-12 ${milestones.length > 0 ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
          <Hdr title="Recent Activity" count={recentActivity.length} />
          <div className="p-3">
            {recentActivity.length === 0 ? (
              <p className="text-[10px] text-gray-600 text-center py-4">No activity yet. Vote or comment to see activity here.</p>
            ) : (
              <div className="space-y-1">
                {recentActivity.map((item) => {
                  const isVote = 'type' in item && (item.type === 'like' || item.type === 'dislike');
                  const id = item.id;
                  const name = 'userName' in item ? (item.userName as string) : 'User';
                  const tgt = feedbackStore.targets[item.targetId];
                  const label = tgt?.label ?? item.targetId;
                  return (
                    <div key={id} className="flex items-center gap-2 text-[11px]">
                      <span className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-[10px]">
                        {name.charAt(0)}
                      </span>
                      <span className={isVote ? ((item as Vote).type === 'like' ? 'text-green-400' : 'text-red-400') : 'text-blue-400'}>
                        {isVote ? ((item as Vote).type === 'like' ? 'liked' : 'disliked') : 'commented on'}
                      </span>
                      <span className="text-gray-400 truncate flex-1">{label}</span>
                      <span className="text-[9px] text-gray-600 shrink-0">{timeAgo(item.createdAt)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
