// @ts-nocheck — SVG intrinsic elements have incomplete typing in React 19
'use client';

import { useMemo } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { useFeedbackStore } from '@/stores/feedbackStore';
import { useFeatureStore } from '@/stores/featureStore';
import { useSwarmStore } from '@/stores/swarmStore';
import { useGuardrailStore } from '@/stores/guardrailStore';
import { usePMStore } from '@/stores/pmStore';
import { useUIStore } from '@/stores/uiStore';
import { buildAppGraph, getScreenColor } from '@design-studio/app';
import { STAGE_COLORS, PIPELINE_STAGES } from '@design-studio/ai';
import type { GraphNode, GraphEdge } from '@design-studio/app';

// ─── Helpers ────────────────────────────────────────────────

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function getScoreColor(score: number): string {
  if (score > 0) return '#10b981';
  if (score < 0) return '#ef4444';
  return '#9ca3af';
}

function getStageLabelById(id: string): string {
  return PIPELINE_STAGES.find((s) => s.id === id)?.label ?? id;
}

// ─── Component ──────────────────────────────────────────────

export function AppMap() {
  const manifest = useProjectStore((s) => s.manifest);
  const activeScreenId = useProjectStore((s) => s.activeScreenId);
  const setActiveScreen = useProjectStore((s) => s.setActiveScreen);
  const setActiveView = useUIStore((s) => s.setActiveView);

  // Feedback
  const feedbackTargets = useFeedbackStore((s) => s.targets);
  const feedbackVotes = useFeedbackStore((s) => s.votes);
  const feedbackComments = useFeedbackStore((s) => s.comments);
  const getBlockingComments = useFeedbackStore((s) => s.getBlockingComments);

  // Pipeline
  const screenStages = useSwarmStore((s) => s.screenStages);
  const getScreenStage = useSwarmStore((s) => s.getScreenStage);

  // Features
  const features = useFeatureStore((s) => s.features);
  const getByScreen = useFeatureStore((s) => s.getByScreen);

  // Tasks
  const tasks = usePMStore((s) => s.tasks);
  const getTasksByScreen = usePMStore((s) => s.getTasksByScreen);

  // Guardrails
  const guardrails = useGuardrailStore((s) => s.guardrails);
  const preferences = useGuardrailStore((s) => s.preferences);

  // ── Build graph ────────────────────────────────
  const graph = useMemo(() => {
    if (!manifest) return { nodes: [], edges: [] };
    return buildAppGraph(manifest);
  }, [manifest]);

  // ── Compute per-screen overlay data ────────────
  const screenData = useMemo(() => {
    const map: Record<string, {
      likes: number;
      dislikes: number;
      score: number;
      blockingCount: number;
      featureCount: number;
      taskCount: number;
      stage: string;
    }> = {};

    for (const node of graph.nodes) {
      if (node.type !== 'screen') continue;
      const sid = node.id;
      const feedbackTargetId = `screen-${sid}`;

      // Votes
      const votes = Object.values(feedbackVotes).filter((v) => v.targetId === feedbackTargetId);
      const likes = votes.filter((v) => v.type === 'like').length;
      const dislikes = votes.filter((v) => v.type === 'dislike').length;

      // Blocking comments
      const blocking = Object.values(feedbackComments).filter(
        (c) => c.targetId === feedbackTargetId && c.blocking && c.status !== 'resolved',
      );

      // Features linked to this screen
      const linkedFeatures = Object.values(features).filter((f) => f.screenIds.includes(sid));

      // Tasks linked to this screen (open only)
      const openTasks = Object.values(tasks).filter(
        (t) => t.linkedScreenId === sid && t.status !== 'done',
      );

      map[sid] = {
        likes,
        dislikes,
        score: likes - dislikes,
        blockingCount: blocking.length,
        featureCount: linkedFeatures.length,
        taskCount: openTasks.length,
        stage: screenStages[sid] ?? 'draft',
      };
    }
    return map;
  }, [graph.nodes, feedbackVotes, feedbackComments, features, tasks, screenStages]);

  // ── Stats for sidebar ──────────────────────────
  const stats = useMemo(() => {
    const screenNodes = graph.nodes.filter((n) => n.type === 'screen');
    const stageCount: Record<string, number> = {};
    for (const s of PIPELINE_STAGES) stageCount[s.id] = 0;
    for (const n of screenNodes) {
      const stage = screenStages[n.id] ?? 'draft';
      stageCount[stage] = (stageCount[stage] ?? 0) + 1;
    }

    const totalVotes = Object.keys(feedbackVotes).length;
    const activeGuardrails = Object.values(guardrails).filter((g) => g.active).length;
    const activePreferences = Object.values(preferences).filter((p) => p.active).length;

    return {
      totalScreens: screenNodes.length,
      totalEdges: graph.edges.length,
      stageCount,
      totalVotes,
      activeGuardrails,
      activePreferences,
    };
  }, [graph, screenStages, feedbackVotes, guardrails, preferences]);

  // ── Edge heat (both endpoints' total feedback) ─
  const edgeHeat = useMemo(() => {
    const map: Record<string, number> = {};
    for (const edge of graph.edges) {
      const fromData = screenData[edge.from];
      const toData = screenData[edge.to];
      const heat = (fromData ? fromData.likes + fromData.dislikes : 0)
        + (toData ? toData.likes + toData.dislikes : 0);
      map[edge.id] = heat;
    }
    return map;
  }, [graph.edges, screenData]);

  // ── Click handler ──────────────────────────────
  const handleScreenClick = (screenId: string) => {
    setActiveScreen(screenId);
    setActiveView('canvas');
  };

  // ── Render ─────────────────────────────────────
  if (!manifest) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        No app loaded
      </div>
    );
  }

  const NODE_W = 160;
  const NODE_H = 110;
  const DATA_NODE_W = 140;
  const DATA_NODE_H = 52;
  const FONT = 'Inter, system-ui, sans-serif';

  return (
    <div className="w-full h-full flex bg-gray-50">
      {/* ── SVG Graph Area ──────────────────────── */}
      <div className="flex-1 overflow-auto p-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold">{manifest.name} — App Map</h2>
          <p className="text-sm text-gray-500">
            {stats.totalScreens} screens &middot; {stats.totalEdges} edges &middot;{' '}
            {Object.keys(manifest.dataModels).length} data models &middot;{' '}
            {manifest.platforms.join(', ')}
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-6 text-xs">
          {[
            { type: 'page', label: 'Page', color: '#3b82f6' },
            { type: 'tab', label: 'Tab', color: '#8b5cf6' },
            { type: 'modal', label: 'Modal', color: '#f59e0b' },
            { type: 'auth', label: 'Auth', color: '#ef4444' },
            { type: 'detail', label: 'Detail', color: '#06b6d4' },
            { type: 'settings', label: 'Settings', color: '#6b7280' },
          ].map(({ type, label, color }) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
              <span className="text-gray-600">{label}</span>
            </div>
          ))}
          <div className="w-px h-4 bg-gray-300 mx-1" />
          {PIPELINE_STAGES.map((s) => (
            <div key={s.id} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: STAGE_COLORS[s.id] }}
              />
              <span className="text-gray-500">{s.label}</span>
            </div>
          ))}
        </div>

        <svg className="w-full" style={{ minHeight: 700, minWidth: 900 }}>
          <defs>
            <marker id="arrowhead" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
            </marker>
            <marker id="arrowhead-flow" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
            </marker>
            {/* Glow filters */}
            <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feFlood floodColor="#ef4444" floodOpacity="0.4" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feFlood floodColor="#10b981" floodOpacity="0.4" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── Edges ────────────────────────────── */}
          {graph.edges.map((edge) => {
            const from = graph.nodes.find((n) => n.id === edge.from);
            const to = graph.nodes.find((n) => n.id === edge.to);
            if (!from || !to) return null;

            const fromX = from.x + NODE_W / 2;
            const fromY = from.y + NODE_H / 2;
            const toX = to.x + NODE_W / 2;
            const toY = to.y + NODE_H / 2;
            const heat = edgeHeat[edge.id] ?? 0;
            const thickness = edge.type === 'flow-step'
              ? clamp(2 + heat * 0.3, 2, 6)
              : clamp(1 + heat * 0.2, 1, 4);

            return (
              <line
                key={edge.id}
                x1={fromX} y1={fromY}
                x2={toX} y2={toY}
                stroke={edge.type === 'flow-step' ? '#3b82f6' : '#d1d5db'}
                strokeWidth={thickness}
                strokeDasharray={edge.style === 'dashed' ? '6,4' : undefined}
                markerEnd={edge.type === 'flow-step' ? 'url(#arrowhead-flow)' : 'url(#arrowhead)'}
              />
            );
          })}

          {/* ── Nodes ────────────────────────────── */}
          {graph.nodes.map((node) => {
            const isScreen = node.type === 'screen';
            const isActive = node.id === activeScreenId;
            const color = (node.metadata['color'] as string) ?? '#6b7280';
            const width = isScreen ? NODE_W : DATA_NODE_W;
            const height = isScreen ? NODE_H : DATA_NODE_H;

            // Screen-specific overlay data
            const sd = isScreen ? screenData[node.id] : null;
            const stage = sd?.stage ?? 'draft';
            const stageColor = STAGE_COLORS[stage] ?? '#6b7280';
            const hasNegativeFeedback = sd && sd.score < 0;
            const isExportReady = stage === 'export-ready' || stage === 'shipped';
            const hasBlockers = sd && sd.blockingCount > 0;

            // Determine glow filter
            let filter: string | undefined;
            if (isScreen && hasNegativeFeedback) filter = 'url(#glow-red)';
            else if (isScreen && isExportReady) filter = 'url(#glow-green)';

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer"
                onClick={() => isScreen && handleScreenClick(node.id)}
                filter={filter}
              >
                {/* Shadow */}
                <rect x={2} y={2} width={width} height={height} rx={8} fill="rgba(0,0,0,0.06)" />

                {/* Card background */}
                <rect
                  width={width}
                  height={height}
                  rx={8}
                  fill="white"
                  stroke={isActive ? color : hasBlockers ? '#ef4444' : '#e5e7eb'}
                  strokeWidth={isActive ? 2.5 : hasBlockers ? 2 : 1}
                />

                {/* Color accent bar */}
                <rect width={4} height={height - 16} x={8} y={8} rx={2} fill={color} />

                {/* ── Screen card content ────────── */}
                {isScreen && (
                  <>
                    {/* Screen name */}
                    <text x={20} y={20} fontSize={13} fontWeight={600} fill="#111827" fontFamily={FONT}>
                      {node.label}
                    </text>

                    {/* Entry point badge */}
                    {node.metadata['isEntryPoint'] && (
                      <>
                        <circle cx={width - 14} cy={14} r={8} fill="#10b981" />
                        <text x={width - 14} y={18} fontSize={9} fill="white" fontWeight="bold" textAnchor="middle">E</text>
                      </>
                    )}

                    {/* Route */}
                    {node.metadata['route'] && (
                      <text x={20} y={35} fontSize={10} fill="#9ca3af" fontFamily={FONT}>
                        {String(node.metadata['route'])}
                      </text>
                    )}

                    {/* Pipeline stage dot + label */}
                    <circle cx={24} cy={49} r={4} fill={stageColor} />
                    <text x={32} y={52} fontSize={9} fill={stageColor} fontWeight={500} fontFamily={FONT}>
                      {getStageLabelById(stage)}
                    </text>

                    {/* Feedback row */}
                    {sd && (
                      <text x={20} y={68} fontSize={9} fill="#6b7280" fontFamily={FONT}>
                        <tspan>{'\u{1F44D}'} {sd.likes}</tspan>
                        <tspan dx={6}>{'\u{1F44E}'} {sd.dislikes}</tspan>
                        <tspan dx={6} fill={getScoreColor(sd.score)} fontWeight={600}>
                          {sd.score >= 0 ? '+' : ''}{sd.score}
                        </tspan>
                      </text>
                    )}

                    {/* Feature + task counts */}
                    {sd && (
                      <text x={20} y={83} fontSize={9} fill="#6b7280" fontFamily={FONT}>
                        <tspan fill="#3b82f6" fontWeight={500}>{sd.featureCount} feat</tspan>
                        <tspan dx={4} fill="#9ca3af">&middot;</tspan>
                        <tspan dx={4} fill="#f59e0b" fontWeight={500}>{sd.taskCount} task{sd.taskCount !== 1 ? 's' : ''}</tspan>
                      </text>
                    )}

                    {/* Blocking warning icon */}
                    {hasBlockers && (
                      <>
                        <circle cx={width - 14} cy={height - 16} r={9} fill="#fef3c7" stroke="#f59e0b" strokeWidth={1} />
                        <text x={width - 14} y={height - 12} fontSize={11} textAnchor="middle" fill="#d97706" fontWeight="bold">!</text>
                      </>
                    )}

                    {/* Auth badge */}
                    {node.metadata['requiresAuth'] && (
                      <>
                        <circle cx={width - 14} cy={30} r={7} fill="#ef4444" opacity={0.9} />
                        <text x={width - 14} y={34} fontSize={8} fill="white" fontWeight="bold" textAnchor="middle">{'\u{1F512}'}</text>
                      </>
                    )}
                  </>
                )}

                {/* ── Data model card content ────── */}
                {!isScreen && (
                  <>
                    <text x={20} y={22} fontSize={13} fontWeight={600} fill="#111827" fontFamily={FONT}>
                      {node.label}
                    </text>
                    <text x={20} y={38} fontSize={10} fill="#9ca3af" fontFamily={FONT}>
                      {String(node.metadata['fieldCount'] ?? 0)} fields
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── Sidebar Stats Panel ─────────────────── */}
      <div className="w-64 border-l border-gray-200 bg-white p-5 overflow-y-auto shrink-0">
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Graph Stats</h3>

        {/* Counts */}
        <div className="space-y-2 text-xs mb-5">
          <div className="flex justify-between">
            <span className="text-gray-500">Screens</span>
            <span className="font-medium">{stats.totalScreens}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Edges</span>
            <span className="font-medium">{stats.totalEdges}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Total votes</span>
            <span className="font-medium">{stats.totalVotes}</span>
          </div>
        </div>

        {/* Pipeline breakdown */}
        <h4 className="text-xs font-semibold text-gray-700 mb-2">Pipeline Stages</h4>
        <div className="space-y-1.5 mb-5">
          {PIPELINE_STAGES.map((s) => {
            const count = stats.stageCount[s.id] ?? 0;
            return (
              <div key={s.id} className="flex items-center gap-2 text-xs">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: STAGE_COLORS[s.id] }}
                />
                <span className="flex-1 text-gray-600">{s.label}</span>
                <span className="font-medium tabular-nums">{count}</span>
              </div>
            );
          })}
        </div>

        {/* Guardrails & preferences */}
        <h4 className="text-xs font-semibold text-gray-700 mb-2">Rules</h4>
        <div className="space-y-2 text-xs mb-5">
          <div className="flex justify-between">
            <span className="text-gray-500">Active guardrails</span>
            <span className="font-medium text-red-600">{stats.activeGuardrails}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Active preferences</span>
            <span className="font-medium text-green-600">{stats.activePreferences}</span>
          </div>
        </div>

        {/* Screens with issues */}
        {(() => {
          const negative = Object.entries(screenData).filter(([, d]) => d.score < 0);
          const blocked = Object.entries(screenData).filter(([, d]) => d.blockingCount > 0);
          if (negative.length === 0 && blocked.length === 0) return null;

          return (
            <>
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Attention Needed</h4>
              <div className="space-y-1.5 text-xs">
                {negative.map(([id, d]) => {
                  const node = graph.nodes.find((n) => n.id === id);
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-1.5 cursor-pointer hover:bg-red-50 rounded px-1 py-0.5"
                      onClick={() => handleScreenClick(id)}
                    >
                      <span className="text-red-500 font-medium">{d.score}</span>
                      <span className="text-gray-600 truncate">{node?.label ?? id}</span>
                    </div>
                  );
                })}
                {blocked.map(([id, d]) => {
                  const node = graph.nodes.find((n) => n.id === id);
                  return (
                    <div
                      key={`block-${id}`}
                      className="flex items-center gap-1.5 cursor-pointer hover:bg-yellow-50 rounded px-1 py-0.5"
                      onClick={() => handleScreenClick(id)}
                    >
                      <span className="text-amber-500 font-bold">!</span>
                      <span className="text-gray-600 truncate">{node?.label ?? id}</span>
                      <span className="text-amber-600 text-[10px]">{d.blockingCount} blocker{d.blockingCount > 1 ? 's' : ''}</span>
                    </div>
                  );
                })}
              </div>
            </>
          );
        })()}
      </div>
    </div>
  );
}
