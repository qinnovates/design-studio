# Launchable — AI Agent Instructions

## What This Is
Open-source build orchestration platform. Scaffold apps, design visually, get AI-powered feedback (Quorum), pass CI/CD quality gates, analyze market readiness, and export production code — from a single pane of glass.

## Architecture
Turborepo monorepo with 11 packages under `packages/` and 1 app under `apps/web/`.

### Package Dependency Graph
```
apps/web (Next.js 15)
  ├── @design-studio/canvas (scene graph, Konva renderer)
  ├── @design-studio/components (UI component definitions)
  ├── @design-studio/tokens (design token resolver)
  ├── @design-studio/ai (BYOAI providers, function calling)
  ├── @design-studio/app (app manifest, scaffolder, fonts)
  ├── @design-studio/export (AST, React/CSS generators)
  ├── @design-studio/a11y (WCAG accessibility checks)
  ├── @design-studio/collab (Yjs CRDTs, version history)
  ├── @design-studio/plugins (sandboxed plugin runtime)
  ├── @design-studio/db (Prisma schema)
  └── @design-studio/ui (shared utilities)
```

## Rules
- Scene graph is plain JSON (not Konva objects). The renderer maps nodes to Konva shapes.
- Component definitions are schemas, not React components. Same definition renders on canvas AND exports to code.
- Tokens use alias chains: `{color.action.primary}` → `{color.blue.600}` → `#2563eb`
- AI uses function calling (tool_call), not text parsing. 7 tools manipulate the canvas.
- JSONB for scene graphs in PostgreSQL. No N+1 normalization.
- Plugins run in iframe sandboxes with declared permissions.
- All user-facing labels use plain English (not design jargon).

## Key Commands
```bash
pnpm dev          # Start everything (Turbopack)
pnpm build        # Build all packages + web app
pnpm typecheck    # Type-check entire monorepo
pnpm test         # Run all tests
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema to database
```

## Critical Files
- `packages/canvas/src/scene/SceneGraph.ts` — Core data model
- `packages/components/src/registry/ComponentDefinition.ts` — Component schema
- `packages/tokens/src/resolver/TokenResolver.ts` — Token resolution
- `packages/ai/src/providers/ProviderInterface.ts` — BYOAI contract
- `packages/ai/src/functions/designTools.ts` — AI tool definitions
- `packages/export/src/converters/SceneToAST.ts` — Export bridge
- `packages/app/src/manifest/AppManifest.ts` — App-level structure

## Testing
- Vitest for unit/integration (packages)
- Playwright for E2E (apps/web) — not yet configured
- `pnpm typecheck` must pass before any PR
