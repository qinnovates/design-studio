# Design Studio

**Open-source Figma alternative with BYOAI — design apps visually, export real code.**

Design Studio is a web-based design tool that makes app building accessible to non-technical users. Instead of learning complex design software, users start from templates, customize with AI assistance, and export production-ready React code.

## Design Goal

**One single pane of glass for your entire app.**

Every component, screen, font, color, spacing value, navigation flow, data model, and design decision — visible, editable, and connected in one place. Design Studio orchestrates the build by visualizing all elements together so you can see the whole picture and make informed decisions.

Think of it as IDA Pro for app design: every element is annotated, documented, and navigable.

## Key Differentiators

| Feature | Figma | Design Studio |
|---------|-------|---------------|
| **Starting point** | Blank canvas | Template with real components |
| **AI assistance** | None / plugins | Built-in BYOAI co-designer |
| **Output** | Mockups | Real React code + CSS |
| **Design system** | Manual | Auto-managed token system |
| **Accessibility** | Manual | Built-in WCAG checker |
| **App awareness** | Per-screen | Full app graph (screens, nav, data) |
| **Documentation** | External | Inline notes (IDA Pro-style) |
| **Cost** | $15-75/mo | Free, open source |
| **AI vendor** | N/A | BYOAI — your key, your cost |

## Current Status

### What Works (v0.1.0)

- **Template Gallery** — 6 templates, auto-scaffold 5 app types (Social, E-Commerce, Dashboard, SaaS, Health)
- **Visual Canvas** — Konva.js with drag/drop, zoom/pan, selection, resize, keyboard shortcuts
- **Component Library** — 9 components (Button, TextInput, Card, Text, Heading, Image, Container, Navbar, Alert)
- **Design Token System** — 80+ tokens, alias resolution, light/dark themes, CSS variable export
- **App Map** — SVG relationship diagram of all screens, navigation flows, data models
- **Font Library** — 15 curated fonts, 8 pairings with live preview
- **BYOAI** — OpenAI, Anthropic, Ollama providers with streaming + function calling (7 canvas tools)
- **Property Inspector** — Position, size, component props, variants, token bindings
- **Token Manager** — Color picker, typography scale, spacing, corners, shadows
- **Export** — React + Tailwind codegen, CSS variables, JSON tokens
- **Accessibility Checker** — Contrast, touch targets, alt text, heading order, WCAG references
- **Notes & Annotations** — IDA Pro-style documentation (decisions, requirements, todos, bugs)
- **Version History** — Save/restore snapshots, auto-save every 2 minutes
- **Plugin System** — Sandboxed iframe runtime, 3 example plugins
- **Collaboration** — Yjs CRDT binding, presence indicators (foundation)

### What's Next

- [ ] Real-time multiplayer cursors
- [ ] SwiftUI / Jetpack Compose / Flutter export
- [ ] Animation / interaction design
- [ ] Figma import
- [ ] Plugin marketplace
- [ ] Documentation site
- [ ] Docker production image

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+ (`npm install -g pnpm`)
- Docker (for PostgreSQL + Redis, optional for dev)

### Setup

```bash
# Clone
git clone https://github.com/qinnovates/design-studio.git
cd design-studio

# Install
pnpm install

# Start dev server
pnpm dev

# Open http://localhost:3000
```

### With Database (optional, for save/load)

```bash
# Start PostgreSQL + Redis
docker compose up -d

# Copy environment
cp .env.example .env

# Generate Prisma client
pnpm db:generate

# Push schema
pnpm db:push
```

### Configure AI (BYOAI)

1. Open the editor → click **AI** panel
2. Click **Configure AI**
3. Choose your provider (OpenAI, Anthropic, Ollama)
4. Enter your API key
5. Select a model
6. Test connection
7. Start chatting: "Add a login form"

Your API key stays in your browser. Never sent to our servers.

## Architecture

```
design-studio/
├── apps/
│   └── web/                    # Next.js 15 + React 19 (App Router)
├── packages/
│   ├── canvas/                 # Scene graph + Konva renderer
│   ├── components/             # 9 UI component definitions
│   ├── tokens/                 # Design token resolver + presets
│   ├── ai/                     # BYOAI providers + function calling
│   ├── app/                    # App manifest, scaffolder, fonts
│   ├── export/                 # Scene → AST → React/CSS generators
│   ├── a11y/                   # WCAG accessibility checks
│   ├── collab/                 # Yjs CRDTs + version history
│   ├── plugins/                # Sandboxed plugin runtime
│   ├── db/                     # Prisma schema (12 models)
│   └── ui/                     # Shared utilities
├── templates/                  # Starter template definitions
├── docker-compose.yml          # PostgreSQL + Redis
└── CLAUDE.md                   # AI agent instructions
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15, React 19, App Router |
| Canvas | Konva.js (react-konva) |
| State | Zustand + Immer |
| Real-time | Yjs CRDTs |
| Database | PostgreSQL 16, Prisma 6 |
| Auth | NextAuth.js v5 |
| AI | Vercel AI SDK pattern, custom BYOAI |
| Styling | Tailwind CSS 4, Radix UI |
| API | tRPC v11 (planned) |
| Testing | Vitest, Playwright |

### How It Works

```
User picks template
  → AppScaffolder generates manifest (screens, nav, data models)
  → Template scene graph loaded onto canvas
  → User drags components from palette → creates nodes
  → Inspector edits props, tokens, variants
  → AI assistant receives scene context + tools → function calls update canvas
  → Token changes propagate to all components via resolver
  → Export pipeline: Scene Graph → AST → React/CSS code
  → A11y checker runs in background, flags issues
```

### BYOAI Architecture

```
User message → TaskRouter → Prompt (scene context + tools) → Provider → Stream
  ↓
Text chunks → displayed in chat
Tool calls → validated → executed on canvas
  ↓
Canvas updates in real-time
```

Supported providers:
- **OpenAI** — GPT-4o, GPT-4o Mini, GPT-4.1
- **Anthropic** — Claude Sonnet 4.6, Opus 4.6, Haiku 4.5
- **Ollama** — Any local model (Llama, Mistral, Phi, etc.)
- **OpenRouter** — Multi-model gateway

## For AI Agents

This repo includes `CLAUDE.md` with full instructions for AI coding agents. Any AI agent (Claude, GPT, Copilot, Cursor, etc.) can:

1. Read `CLAUDE.md` for repo rules and architecture
2. Run `pnpm typecheck` to validate changes
3. Follow the package dependency graph
4. Use the scene graph API to add features

## Contributing

1. Fork the repo
2. Create a feature branch
3. Make changes (ensure `pnpm typecheck` passes)
4. Submit a PR

## License

MIT
