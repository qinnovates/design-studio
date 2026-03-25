/**
 * AppGraph — visual relationship graph for the entire app.
 *
 * Generates a navigable graph showing:
 * - Screens as nodes (color-coded by type)
 * - Navigation links as edges
 * - Data model relationships
 * - Auth boundaries
 * - Flow sequences
 *
 * Used to render the "App Map" view in the editor — a bird's-eye view
 * of the entire app structure that non-technical users can understand.
 */

import type { AppManifest, Screen, DataModel, NavigationFlow } from '../manifest/AppManifest';

// ─── Graph Types ─────────────────────────────────────────────

export interface GraphNode {
  id: string;
  label: string;
  type: 'screen' | 'data-model' | 'flow' | 'auth-gate';
  /** Screen type for color coding */
  screenType?: Screen['type'];
  /** Position (auto-laid-out or user-positioned) */
  x: number;
  y: number;
  /** Node metadata for display */
  metadata: Record<string, unknown>;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  type: 'navigation' | 'data-feed' | 'flow-step' | 'auth-boundary';
  label?: string;
  /** Dashed for conditional, solid for always */
  style: 'solid' | 'dashed';
}

export interface AppGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ─── Screen Type Colors ──────────────────────────────────────

const SCREEN_TYPE_COLORS: Record<Screen['type'], string> = {
  page: '#3b82f6',       // blue
  tab: '#8b5cf6',        // purple
  modal: '#f59e0b',      // amber
  sheet: '#f59e0b',      // amber
  drawer: '#6366f1',     // indigo
  onboarding: '#10b981', // emerald
  auth: '#ef4444',       // red
  settings: '#6b7280',   // gray
  detail: '#06b6d4',     // cyan
  error: '#dc2626',      // red-dark
};

export function getScreenColor(type: Screen['type']): string {
  return SCREEN_TYPE_COLORS[type] ?? '#6b7280';
}

// ─── Graph Builder ───────────────────────────────────────────

export function buildAppGraph(manifest: AppManifest): AppGraphData {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  let edgeCounter = 0;

  const screens = Object.values(manifest.screens);

  // ── Screen nodes ─────────────────────────────
  // Simple auto-layout: arrange screens in a grid
  const cols = Math.ceil(Math.sqrt(screens.length));
  const spacing = { x: 250, y: 180 };

  screens
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .forEach((screen, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      nodes.push({
        id: screen.id,
        label: screen.name,
        type: 'screen',
        screenType: screen.type,
        x: col * spacing.x + 100,
        y: row * spacing.y + 100,
        metadata: {
          description: screen.description,
          route: screen.route,
          requiresAuth: screen.requiresAuth,
          isEntryPoint: screen.isEntryPoint,
          color: getScreenColor(screen.type),
        },
      });
    });

  // ── Navigation edges ─────────────────────────
  for (const screen of screens) {
    for (const targetId of screen.navigatesTo) {
      edges.push({
        id: `edge-${edgeCounter++}`,
        from: screen.id,
        to: targetId,
        type: 'navigation',
        style: 'solid',
      });
    }
  }

  // ── Data model nodes ─────────────────────────
  const models = Object.values(manifest.dataModels);
  models.forEach((model, index) => {
    const x = (screens.length > 0 ? cols * spacing.x : 0) + 350;
    const y = index * spacing.y + 100;

    nodes.push({
      id: `model-${model.id}`,
      label: model.name,
      type: 'data-model',
      x,
      y,
      metadata: {
        description: model.description,
        fieldCount: model.fields.length,
        fields: model.fields.map((f) => f.name),
      },
    });
  });

  // ── Data feed edges (screen -> data model) ───
  for (const screen of screens) {
    for (const req of screen.dataRequirements) {
      edges.push({
        id: `edge-${edgeCounter++}`,
        from: screen.id,
        to: `model-${req.modelId}`,
        type: 'data-feed',
        label: req.queryType,
        style: 'dashed',
      });
    }
  }

  // ── Flow edges ───────────────────────────────
  for (const flow of Object.values(manifest.navigation.flows)) {
    for (let i = 0; i < flow.steps.length - 1; i++) {
      edges.push({
        id: `edge-${edgeCounter++}`,
        from: flow.steps[i]!,
        to: flow.steps[i + 1]!,
        type: 'flow-step',
        label: `${flow.name} (${i + 1}→${i + 2})`,
        style: 'solid',
      });
    }
    // Completion edge
    if (flow.steps.length > 0 && flow.completionTarget) {
      edges.push({
        id: `edge-${edgeCounter++}`,
        from: flow.steps[flow.steps.length - 1]!,
        to: flow.completionTarget,
        type: 'flow-step',
        label: `${flow.name} (done)`,
        style: 'dashed',
      });
    }
  }

  return { nodes, edges };
}

// ─── Mermaid Export ──────────────────────────────────────────

/** Generate a Mermaid flowchart from the app graph */
export function toMermaid(manifest: AppManifest): string {
  const screens = Object.values(manifest.screens);
  const lines: string[] = ['graph TD'];

  // Define screen nodes with style classes
  for (const screen of screens) {
    const shape = screen.isEntryPoint ? `(("${screen.name}"))` : `["${screen.name}"]`;
    lines.push(`  ${sanitizeId(screen.id)}${shape}`);
  }

  // Navigation edges
  for (const screen of screens) {
    for (const targetId of screen.navigatesTo) {
      const target = manifest.screens[targetId];
      if (target) {
        lines.push(`  ${sanitizeId(screen.id)} --> ${sanitizeId(targetId)}`);
      }
    }
  }

  // Flow edges
  for (const flow of Object.values(manifest.navigation.flows)) {
    for (let i = 0; i < flow.steps.length - 1; i++) {
      lines.push(`  ${sanitizeId(flow.steps[i]!)} -->|"${flow.name}"| ${sanitizeId(flow.steps[i + 1]!)}`);
    }
  }

  // Data models
  const models = Object.values(manifest.dataModels);
  if (models.length > 0) {
    lines.push('');
    lines.push('  subgraph Data Models');
    for (const model of models) {
      lines.push(`    ${sanitizeId(`model-${model.id}`)}[("${model.name}")]`);
    }
    lines.push('  end');
  }

  // Style classes
  lines.push('');
  lines.push('  classDef entryPoint fill:#10b981,color:#fff');
  lines.push('  classDef authScreen fill:#ef4444,color:#fff');
  lines.push('  classDef modal fill:#f59e0b,color:#fff');
  lines.push('  classDef dataModel fill:#6366f1,color:#fff');

  // Apply classes
  for (const screen of screens) {
    if (screen.isEntryPoint) lines.push(`  class ${sanitizeId(screen.id)} entryPoint`);
    if (screen.type === 'auth') lines.push(`  class ${sanitizeId(screen.id)} authScreen`);
    if (screen.type === 'modal' || screen.type === 'sheet') lines.push(`  class ${sanitizeId(screen.id)} modal`);
  }
  for (const model of models) {
    lines.push(`  class ${sanitizeId(`model-${model.id}`)} dataModel`);
  }

  return lines.join('\n');
}

function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9]/g, '_');
}
