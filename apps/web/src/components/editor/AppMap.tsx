// @ts-nocheck — SVG intrinsic elements have incomplete typing in React 19
'use client';

import { useMemo } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { buildAppGraph, getScreenColor } from '@design-studio/app';
import type { GraphNode, GraphEdge } from '@design-studio/app';

export function AppMap() {
  const manifest = useProjectStore((s) => s.manifest);
  const activeScreenId = useProjectStore((s) => s.activeScreenId);
  const setActiveScreen = useProjectStore((s) => s.setActiveScreen);

  const graph = useMemo(() => {
    if (!manifest) return { nodes: [], edges: [] };
    return buildAppGraph(manifest);
  }, [manifest]);

  if (!manifest) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        No app loaded
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold">{manifest.name} — App Map</h2>
        <p className="text-sm text-gray-500">
          {Object.keys(manifest.screens).length} screens &middot;{' '}
          {Object.keys(manifest.dataModels).length} data models &middot;{' '}
          {manifest.platforms.join(', ')}
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-8 text-xs">
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
      </div>

      {/* Graph nodes */}
      <svg className="w-full" style={{ minHeight: 600, minWidth: 800 }}>
        <defs>
          <marker
            id="arrowhead"
            viewBox="0 0 10 7"
            refX="10"
            refY="3.5"
            markerWidth="8"
            markerHeight="6"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#9ca3af" />
          </marker>
          <marker
            id="arrowhead-flow"
            viewBox="0 0 10 7"
            refX="10"
            refY="3.5"
            markerWidth="8"
            markerHeight="6"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
          </marker>
        </defs>

        {/* Edges */}
        {graph.edges.map((edge) => {
          const from = graph.nodes.find((n) => n.id === edge.from);
          const to = graph.nodes.find((n) => n.id === edge.to);
          if (!from || !to) return null;

          const fromX = from.x + 80;
          const fromY = from.y + 30;
          const toX = to.x + 80;
          const toY = to.y + 30;

          return (
            <line
              key={edge.id}
              x1={fromX}
              y1={fromY}
              x2={toX}
              y2={toY}
              stroke={edge.type === 'flow-step' ? '#3b82f6' : '#d1d5db'}
              strokeWidth={edge.type === 'flow-step' ? 2 : 1}
              strokeDasharray={edge.style === 'dashed' ? '6,4' : undefined}
              markerEnd={
                edge.type === 'flow-step'
                  ? 'url(#arrowhead-flow)'
                  : 'url(#arrowhead)'
              }
            />
          );
        })}

        {/* Nodes */}
        {graph.nodes.map((node) => {
          const isScreen = node.type === 'screen';
          const isActive = node.id === activeScreenId;
          const color = (node.metadata['color'] as string) ?? '#6b7280';
          const width = isScreen ? 160 : 140;
          const height = isScreen ? 64 : 52;

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              className="cursor-pointer"
              onClick={() => isScreen && setActiveScreen(node.id)}
            >
              {/* Shadow */}
              <rect
                x={2}
                y={2}
                width={width}
                height={height}
                rx={8}
                fill="rgba(0,0,0,0.06)"
              />
              {/* Card */}
              <rect
                width={width}
                height={height}
                rx={8}
                fill="white"
                stroke={isActive ? color : '#e5e7eb'}
                strokeWidth={isActive ? 2 : 1}
              />
              {/* Color accent bar */}
              <rect
                width={4}
                height={height - 16}
                x={8}
                y={8}
                rx={2}
                fill={color}
              />
              {/* Label */}
              <text
                x={20}
                y={isScreen ? 26 : 22}
                fontSize={13}
                fontWeight={600}
                fill="#111827"
                fontFamily="Inter, system-ui, sans-serif"
              >
                {node.label}
              </text>
              {/* Subtitle */}
              {isScreen && node.metadata['route'] && (
                <text
                  x={20}
                  y={44}
                  fontSize={11}
                  fill="#9ca3af"
                  fontFamily="Inter, system-ui, sans-serif"
                >
                  {String(node.metadata['route'])}
                </text>
              )}
              {!isScreen && (
                <text
                  x={20}
                  y={38}
                  fontSize={10}
                  fill="#9ca3af"
                  fontFamily="Inter, system-ui, sans-serif"
                >
                  {String(node.metadata['fieldCount'] ?? 0)} fields
                </text>
              )}
              {/* Entry point badge */}
              {node.metadata['isEntryPoint'] && (
                <>
                  <circle cx={width - 14} cy={14} r={8} fill="#10b981" />
                  <text
                    x={width - 18}
                    y={18}
                    fontSize={9}
                    fill="white"
                    fontWeight="bold"
                  >
                    E
                  </text>
                </>
              )}
              {/* Auth badge */}
              {node.metadata['requiresAuth'] && (
                <>
                  <circle cx={width - 14} cy={height - 14} r={8} fill="#ef4444" />
                  <text
                    x={width - 18}
                    y={height - 10}
                    fontSize={8}
                    fill="white"
                    fontWeight="bold"
                  >
                    🔒
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
