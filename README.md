# Design Studio

**Open-source Figma alternative with BYOAI — design apps visually, export real code.**

Design Studio is a web-based design tool that makes app building accessible to non-technical users. Start from templates, customize with AI assistance, get team feedback, pass design quality gates, and export production-ready React code.

## Design Goal

**One single pane of glass for your entire app.**

Every component, screen, font, color, spacing value, navigation flow, data model, task, vote, and design decision — visible, editable, and connected in one place. Design Studio orchestrates the build by visualizing all elements together so you can see the whole picture and make informed decisions.

Think of it as **MiroFish + Suno + Figma + Linear** — for app building.

## Key Differentiators

| Feature | Figma | Design Studio |
|---------|-------|---------------|
| **Starting point** | Blank canvas | Template with real components |
| **AI assistance** | None / plugins | BYOAI co-designer with function calling |
| **AI design generation** | None | Quorum iterative refinement + Arena parallel generation |
| **Output** | Mockups | Real React code + CSS (gated by quality checks) |
| **Design system** | Manual | Auto-managed token system with alias chains |
| **Accessibility** | Manual | Built-in WCAG checker + CI/CD gate |
| **App awareness** | Per-screen | Full app graph (screens, nav, data models) |
| **Feedback** | Comments only | Likes/dislikes/comments on any element + approval gates |
| **Project management** | External | Built-in tasks, milestones, Kanban board |
| **Design pipeline** | None | CI/CD gates: a11y, feedback, approvals gate export |
| **Documentation** | External | Inline notes + annotations (IDA Pro-style) |
| **Command center** | None | Single dashboard showing entire app state |
| **Cost** | $15-75/mo | Free, open source |
| **AI vendor** | N/A | BYOAI — your key, your cost |

---

## Quorum Design Refiner (the killer feature)

Design Studio integrates [Quorum](https://github.com/qinnovates/quorum) for iterative AI design refinement. Instead of dumping N parallel designs, each AI persona reviews the current design and makes **one targeted improvement** — building on the last, converging on quality.

### How It Works

```
User: "Professional SaaS pricing page, dark theme, trustworthy but modern"

  Pass 1: ♿ Aria (Accessibility)
  ─────────────────────────────────
  Focus: accessibility
  "Increased text contrast from 3.8:1 to 7.2:1 for AAA compliance.
   Darkened secondary text from #9ca3af to #4b5563."

   Before: aesthetics 5.2 | usability 5.8 | a11y 4.1 | consistency 5.5
   After:  aesthetics 5.2 | usability 6.0 | a11y 7.8 | consistency 5.5
   [✓ Accept]


  Pass 2: ◯ Mina (Minimalist)
  ─────────────────────────────────
  Focus: simplification
  "Removed heavy drop shadows in favor of subtle borders.
   Cleaner hierarchy — content breathes."

   Before: aesthetics 5.2 | usability 6.0 | a11y 7.8 | consistency 5.5
   After:  aesthetics 6.8 | usability 6.2 | a11y 7.8 | consistency 6.4
   [✓ Accept]


  Pass 3: ✦ Edith (Editorial)
  ─────────────────────────────────
  Focus: typography
  "Increased heading size contrast from 30px to 36px.
   Better typographic hierarchy tells a clearer story."

   Before: aesthetics 6.8 | usability 6.2 | a11y 7.8 | consistency 6.4
   After:  aesthetics 7.4 | usability 6.8 | a11y 7.8 | consistency 7.0
   [✓ Accept]


  Pass 4: ◆ Blaze (Bold)
  ─────────────────────────────────
  Focus: visual-hierarchy
  "Deepened CTA button color from #3b82f6 to #1d4ed8 for
   stronger visual impact."

   Before: aesthetics 7.4 | usability 6.8 | a11y 7.8 | consistency 7.0
   After:  aesthetics 7.9 | usability 6.8 | a11y 7.6 | consistency 7.0
   [✗ Skip — user preferred the lighter blue]


  ✓ Quorum Review Complete
  ─────────────────────────────────
  3 of 4 improvements accepted
  Overall improvement: +2.3 points

  "Design refined by Quorum AI — 3 iterative passes by
   ♿ Aria, ◯ Mina, ✦ Edith. Powered by Design Studio."
```

### Why Quorum-Style Beats Parallel Generation

| Parallel (Suno-style) | Iterative (Quorum-style) |
|------------------------|--------------------------|
| 6 disconnected visions | One coherent, improving design |
| Overwhelming choice paralysis | One decision at a time |
| Can't explain the "why" | Each step explains the rationale |
| All-or-nothing selection | Accept/reject individual changes |
| Spreads across options | Converges on quality |

Both modes are available in the Design Arena:
- **Quorum (default)** — iterative refinement, one persona at a time
- **Arena** — parallel generation for early exploration

### The 6 AI Design Personas

| Persona | Avatar | Philosophy | Style |
|---------|--------|-----------|-------|
| **Mina** | ◯ | Less is more | Clean, whitespace, minimal |
| **Blaze** | ◆ | Make a statement | Bold, contrast, dramatic |
| **Aria** | ♿ | Design for everyone | Accessible, readable, clear |
| **Edith** | ✦ | Typography leads the narrative | Editorial, elegant, serif |
| **Pixel** | ✿ | Delight is a feature | Playful, friendly, colorful |
| **Brix** | ▦ | Function IS the aesthetic | Brutalist, raw, structural |

### Smart Review Order

The review order is chosen based on your design prompt:
- **Accessibility always goes first** (foundation)
- Style persona matched to keywords goes second
- Remaining personas fill in: typography → impact → delight → structure

Example: "fun health app" → Aria → Pixel → Edith → Blaze → Mina → Brix

---

## Design Pipeline (CI/CD for Design)

Every screen progresses through a pipeline. Export is gated — you can't ship code until quality checks pass.

```
Draft → Design Review → Approved → Export Ready → Shipped
  │          │              │            │
  │     Feedback open    Approvals    A11y ≥ 80
  │     for voting       met (N/M)   No urgent tasks
  │                      No blocking  No blocking
  │                      comments     comments
  │
  Has components
```

### Gate Checks

| Gate | Stage Transition | Required | What It Checks |
|------|-----------------|----------|----------------|
| Has Components | Draft → Review | Yes | Screen has at least 1 element |
| Positive Feedback | Review → Approved | Yes | More likes than dislikes |
| No Blocking Comments | Review → Approved | Yes | All blocking comments resolved |
| Team Approvals | Review → Approved | Yes | Required number of approvals met |
| A11y Score ≥ 80 | Approved → Export | Yes | Accessibility score passes threshold |
| No Urgent Tasks | Approved → Export | Yes | All urgent tasks for this screen done |
| AAA Compliance | Approved → Export | Advisory | A11y score ≥ 95 |
| All Tasks Done | Approved → Export | Advisory | All tasks (not just urgent) complete |

The pipeline status bar appears above the canvas, showing gate pass/fail indicators and an "Advance" button when all required gates pass.

---

## Command Center (Single Pane of Glass)

The Command Center is a MiroFish-style dashboard showing the entire app at once:

| Section | What It Shows |
|---------|--------------|
| **Project Header** | App name, platform badges, quick stats, task completion progress |
| **Screen Grid** | All screens as cards with type badges, routes, inline voting |
| **Task Board** | Kanban columns (To Do / In Progress / Review / Done) |
| **Component Inventory** | All component types with usage heatmap |
| **Design System** | Color palette, typography, spacing scale with voting |
| **Feedback Summary** | Most liked, needs attention, most discussed elements |
| **Milestones** | Progress bars, due dates, task counts |
| **Activity Feed** | Recent votes, comments, task changes |

Everything is interactive — vote on colors, add tasks, click screens to navigate to canvas.

---

## Feedback System

Like, dislike, or comment on **any element** in the app:

- **Screens** — vote on screen designs
- **Components** — vote on individual UI elements
- **Colors** — vote on color choices
- **Fonts** — vote on typography selections
- **Design decisions** — vote on architectural choices
- **Annotations** — vote on design notes

Feedback aggregates into the Command Center and feeds the Design Pipeline gates.

---

## Current Status (v0.2.0)

### What Works

**Design:**
- Template gallery (6 templates, 5 scaffold presets)
- Visual canvas (Konva.js — drag/drop, zoom/pan, selection, resize, keyboard shortcuts)
- 9 component definitions (Button, TextInput, Card, Text, Heading, Image, Container, Navbar, Alert)
- Design token system (80+ tokens, alias chains, light/dark themes, CSS export)
- App Map (SVG relationship diagram of screens, nav flows, data models)
- Font library (15 fonts, 8 pairings, live preview)
- Property inspector (position, size, props, variants, token bindings)
- Token manager (color picker, typography scale, spacing, corners, shadows)
- Responsive preview (iPhone, iPad, Desktop frames)

**AI:**
- BYOAI (OpenAI, Anthropic, Ollama with streaming + function calling)
- 7 canvas tools (add component, add text, add frame, modify, remove, update token, suggest)
- Quorum iterative refinement (6 personas, smart review order, accept/reject per step)
- Design Arena parallel generation (all personas generate + critique simultaneously)
- Zod-validated tool call arguments

**Collaboration:**
- Feedback system (likes/dislikes/comments on any element)
- Project management (tasks, milestones, Kanban board)
- Notes & annotations (IDA Pro-style — decisions, requirements, todos, bugs)
- Version history (save/restore snapshots, auto-save)
- Yjs CRDT binding + presence indicators
- Plugin system (sandboxed iframe runtime, 3 example plugins)

**Quality:**
- Design Pipeline (CI/CD gates for export)
- Accessibility checker (contrast, touch targets, alt text, WCAG references)
- Command Center (single-pane-of-glass dashboard)

**Export:**
- React + Tailwind code generation
- CSS variables
- JSON tokens (DTCG-compatible)
- Quorum attribution in exports

**Security:**
- BaseUrl allowlist validation (prevents API key exfiltration)
- Zod schema validation on all AI tool calls
- Content Security Policy headers
- Plugin sandbox (allow-scripts only, no allow-same-origin)
- XSS escaping in export generator
- No eval, no dangerouslySetInnerHTML, no raw SQL

### What's Next

- [ ] Real-time multiplayer cursors
- [ ] SwiftUI / Jetpack Compose / Flutter export
- [ ] Animation / interaction design
- [ ] Figma import
- [ ] Plugin marketplace
- [ ] Wire Quorum personas to real BYOAI providers
- [ ] Documentation site (Nextra)
- [ ] Docker production image

---

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+ (`npm install -g pnpm`)
- Docker (for PostgreSQL + Redis, optional)

### Setup

```bash
git clone https://github.com/qinnovates/design-studio.git
cd design-studio
pnpm install
pnpm dev
# Open http://localhost:3000
```

### Configure AI (BYOAI)

1. Open the editor → click **AI** panel
2. Click **Configure AI**
3. Choose your provider (OpenAI, Anthropic, Ollama)
4. Enter your API key
5. Select a model
6. Start designing: "Add a login form with email and password"

Your API key stays in your browser. Never sent to our servers.

### Try the Quorum Refiner

1. Open any project → click **Design Arena** tab
2. Quorum mode is selected by default
3. Enter your design intent: "Modern SaaS landing page, dark theme"
4. Select how many review passes (2-6)
5. Watch each AI persona improve the design one step at a time
6. Accept or reject each change
7. View the final result on canvas

---

## Architecture

```
design-studio/
├── apps/
│   └── web/                    # Next.js 15 + React 19 (App Router)
│       ├── src/
│       │   ├── app/            # Pages (home, editor)
│       │   ├── components/     # 20+ editor components
│       │   │   └── editor/
│       │   │       ├── canvas/         # Konva renderer (6 files)
│       │   │       ├── CommandCenter   # Single pane of glass
│       │   │       ├── DesignArena     # AI swarm + Quorum
│       │   │       ├── QuorumRefiner   # Iterative refinement UI
│       │   │       ├── PipelineStatus  # CI/CD gate bar
│       │   │       └── ...             # Inspector, Toolbar, Panels
│       │   ├── stores/         # 7 Zustand stores
│       │   │   ├── canvasStore     # Scene graph, selection, undo
│       │   │   ├── projectStore    # App manifest, screens, notes
│       │   │   ├── tokenStore      # Design tokens, theme switching
│       │   │   ├── uiStore         # Panels, views, overlays
│       │   │   ├── aiStore         # BYOAI config, chat messages
│       │   │   ├── feedbackStore   # Votes, comments, summaries
│       │   │   ├── pmStore         # Tasks, milestones, stats
│       │   │   └── swarmStore      # AI swarm sessions, pipeline
│       │   ├── lib/            # Zod validation, utilities
│       │   └── templates/      # Scene graph factories
│       └── ...
├── packages/
│   ├── canvas/                 # Scene graph + node types
│   ├── components/             # 9 UI component definitions
│   ├── tokens/                 # Token resolver + presets
│   ├── ai/                     # BYOAI + Quorum + Pipeline
│   │   ├── providers/          # OpenAI, Anthropic, Ollama
│   │   ├── swarm/              # Personas, sessions, QuorumRefiner
│   │   ├── pipeline/           # Stages, gates, checks
│   │   ├── functions/          # 7 design tool definitions
│   │   └── prompts/            # System prompts, scene serializer
│   ├── app/                    # App manifest, scaffolder, fonts
│   ├── export/                 # AST, React/CSS generators
│   ├── a11y/                   # WCAG checks (contrast, targets)
│   ├── collab/                 # Yjs CRDTs, version history
│   ├── plugins/                # Sandboxed plugin runtime
│   ├── db/                     # Prisma schema (12 models)
│   └── ui/                     # Shared utilities
├── docker-compose.yml
├── CLAUDE.md                   # AI agent instructions
└── LICENSE                     # MIT
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15, React 19, App Router |
| Canvas | Konva.js (react-konva) |
| State | Zustand (7 stores) |
| Real-time | Yjs CRDTs |
| Database | PostgreSQL 16, Prisma 6 |
| AI | Custom BYOAI (OpenAI, Anthropic, Ollama) |
| Validation | Zod |
| Styling | Tailwind CSS 4 |
| Testing | Vitest, Playwright |

---

## For AI Agents

This repo includes `CLAUDE.md` with full instructions for AI coding agents. Any AI agent can:

1. Read `CLAUDE.md` for repo rules and architecture
2. Run `pnpm typecheck` to validate changes (23 tasks, 0 errors)
3. Follow the package dependency graph
4. Use the scene graph API to add features

## Contributing

1. Fork the repo
2. Create a feature branch
3. Make changes (ensure `pnpm typecheck` passes)
4. Submit a PR

## License

MIT — Kevin Qi / [qinnovates](https://github.com/qinnovates)

---

*Powered by [Quorum](https://github.com/qinnovates/quorum) — multi-persona AI review.*
