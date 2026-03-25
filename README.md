# Launchable

### Need tighter visibility, control, and integration of your builds — at scale?

**Launchable** is an open-source build orchestration platform. Scaffold apps, design visually, get AI-powered feedback, pass quality gates, analyze market readiness, and export production code — all from a single pane of glass.

It's not a design tool. It's not a project manager. It's not an AI chatbot. **It's the mission control for shipping apps.**

```
Idea → Scaffold → Design → AI Review → Team Feedback → Quality Gates → Market Analysis → Export Code → Ship
         ↑                                                                                              |
         └──────────────────────── all visible in one dashboard ────────────────────────────────────────┘
```

---

## The Problem

Building apps today means context-switching between 6+ tools:

| Tool | What it does | What's missing |
|------|-------------|----------------|
| Figma | Design mockups | No code output, no feedback gates, no project tracking |
| Linear/Jira | Track tasks | Disconnected from the actual design |
| Slack/email | Collect feedback | Unstructured, no voting, no gates |
| Storybook | Preview components | No design system management, no AI |
| GitHub Actions | CI/CD for code | Nothing for design quality |
| Google Docs | Document decisions | Disconnected from everything |

**You have zero single-pane visibility into what's being built, who approved it, whether it's accessible, whether it's competitive, and whether it's ready to ship.**

## The Solution

Launchable puts everything in one place:

```
┌─────────────────────────────────────────────────────────────┐
│                    COMMAND CENTER                            │
│                                                             │
│  ┌─ Screens ──┐  ┌─ Tasks ────┐  ┌─ Design System ───────┐ │
│  │ Home    ✓  │  │ To Do   3  │  │ Colors  ████████████  │ │
│  │ Login  👍5 │  │ Active  2  │  │ Fonts   Inter + Lora  │ │
│  │ Dash   👎2 │  │ Review  1  │  │ Spacing ▪▪▪▪▪▪▪▪▪▪▪  │ │
│  │ Cart    ●  │  │ Done    8  │  │ Theme   ◑ Dark        │ │
│  └────────────┘  └────────────┘  └────────────────────────┘ │
│                                                             │
│  ┌─ Pipeline ─────────────────────────────────────────────┐ │
│  │ Draft ──→ Review ──→ Approved ──→ Export Ready ──→ 🚀  │ │
│  │            ✓ Feedback  ✓ A11y ≥80  ✓ No blockers       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─ Market Intel ─────┐  ┌─ Activity ──────────────────┐   │
│  │ Score: 74/100      │  │ 2m ago  👍 Alex liked Login  │   │
│  │ vs. Stripe: -11    │  │ 5m ago  💬 "CTA too small"   │   │
│  │ "Add trust badges" │  │ 8m ago  ✓ Task completed     │   │
│  └────────────────────┘  └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## What Launchable Does

### 1. Scaffold → full app structure in seconds
Pick a preset (SaaS, E-Commerce, Social, Dashboard, Health) or describe your app to AI. Launchable generates the complete app structure: screens, navigation flows, data models, and a starter design — ready to customize.

### 2. Design → visual canvas with AI co-designer
Drag-and-drop components onto a Konva.js canvas. Edit properties, tokens, variants. Or tell the AI: "Add a login form with Google sign-in" and watch it build it live via function calling.

### 3. AI Review → Quorum iterative refinement
6 AI design personas review your work one at a time, each making a single targeted improvement. Accept or reject each change. The design converges on quality through iteration — not parallel chaos.

### 4. Team Feedback → structured voting on everything
Like, dislike, or comment on any element — screens, colors, fonts, components, decisions. Feedback feeds directly into quality gates.

### 5. Quality Gates → CI/CD pipeline for design
Every screen progresses through: **Draft → Review → Approved → Export Ready → Shipped**. Gates enforce: accessibility score, positive feedback, team approvals, no blocking comments, no urgent tasks. You can't export code until the design passes.

### 6. Market Intelligence → competitive analysis
AI analyzes your design against the competitive landscape. Scores across 7 dimensions: category fit, intuitiveness, professionalism, visual quality, UX patterns, info architecture, conversion readiness. Benchmarked against top apps in your space.

### 7. Export → real code, not mockups
Scene graph → platform-neutral AST → React + Tailwind code. CSS variables. JSON tokens. Quorum attribution baked in.

### 8. Track → project management built in
Tasks, milestones, Kanban board — all linked to screens and components. No context-switching to Linear. Everything visible in the Command Center.

---

## Quorum Design Refiner

Launchable integrates [Quorum](https://github.com/qinnovates/quorum) for iterative AI design refinement. Instead of dumping options, each AI persona reviews the current design and makes **one targeted improvement**.

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
   ♿ Aria, ◯ Mina, ✦ Edith. Powered by Launchable."
```

### The 6 AI Design Personas

| Persona | Avatar | Philosophy | Style |
|---------|--------|-----------|-------|
| **Mina** | ◯ | Less is more | Clean, whitespace, minimal |
| **Blaze** | ◆ | Make a statement | Bold, contrast, dramatic |
| **Aria** | ♿ | Design for everyone | Accessible, readable, clear |
| **Edith** | ✦ | Typography leads the narrative | Editorial, elegant, serif |
| **Pixel** | ✿ | Delight is a feature | Playful, friendly, colorful |
| **Brix** | ▦ | Function IS the aesthetic | Brutalist, raw, structural |

---

## Design Pipeline (CI/CD for Design)

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

| Gate | Required | What It Checks |
|------|----------|----------------|
| Has Components | Yes | Screen has at least 1 element |
| Positive Feedback | Yes | More likes than dislikes |
| No Blocking Comments | Yes | All blocking comments resolved |
| Team Approvals | Yes | Required number of approvals met |
| A11y Score ≥ 80 | Yes | Accessibility score passes threshold |
| No Urgent Tasks | Yes | All urgent tasks for this screen done |
| Market Readiness ≥ 70 | Advisory | Competitive analysis score |
| AAA Compliance | Advisory | A11y score ≥ 95 |

---

## Market Intelligence

AI analyzes your design against the competitive landscape:

| Dimension | What It Measures |
|-----------|-----------------|
| **Category Fit** | Does it look like it belongs in this space? |
| **User Intuitiveness** | Will users understand it without instructions? |
| **Professionalism** | Does it look trustworthy and polished? |
| **Visual Quality** | Is it visually competitive with top apps? |
| **UX Patterns** | Does it follow proven patterns for this category? |
| **Info Architecture** | Is the information structure clear? |
| **Conversion Ready** | Would users sign up / buy / engage? |

Benchmarked against top apps: Stripe, Linear, Headspace, Shopify, Instagram, Duolingo — depending on your category.

Covers 6 categories: **Fintech, Health, SaaS, E-Commerce, Social, Education**.

---

## Quick Start

```bash
git clone https://github.com/qinnovates/design-studio.git
cd design-studio
pnpm install
pnpm dev
# → http://localhost:3000
```

### Configure AI (BYOAI)

1. Open the editor → click **AI** panel → **Configure AI**
2. Choose your provider: OpenAI, Anthropic, or Ollama (local, free)
3. Enter your API key → Test → Save
4. Start building: "Add a hero section with a signup form"

Your key stays in your browser. Never touches our servers.

---

## Architecture

**99 TypeScript source files. 11 packages. 8 Zustand stores. 0 type errors.**

```
launchable/
├── apps/web/               # Next.js 15 + React 19
│   ├── components/editor/  # 25+ editor components
│   │   ├── canvas/         # Konva.js renderer
│   │   ├── CommandCenter   # Single pane of glass dashboard
│   │   ├── DesignArena     # AI swarm (Quorum + Arena modes)
│   │   ├── PipelineStatus  # CI/CD gate status bar
│   │   ├── MarketIntel     # Competitive analysis panel
│   │   └── ...             # Inspector, Toolbar, Fonts, Export, A11y, Notes, Versions, Plugins
│   └── stores/             # 8 Zustand stores (canvas, project, tokens, AI, feedback, PM, swarm, UI)
├── packages/
│   ├── ai/                 # BYOAI providers + Quorum + Pipeline + Market Intelligence
│   ├── canvas/             # Scene graph + node types
│   ├── components/         # 9 UI component definitions
│   ├── tokens/             # Design token resolver
│   ├── app/                # App manifest + scaffolder + fonts
│   ├── export/             # React/CSS code generators
│   ├── a11y/               # WCAG accessibility checks
│   ├── collab/             # Yjs CRDTs + version history
│   ├── plugins/            # Sandboxed iframe plugin runtime
│   ├── db/                 # Prisma schema (12 models)
│   └── ui/                 # Shared utilities
└── docker-compose.yml      # PostgreSQL + Redis
```

### Tech Stack

Next.js 15, React 19, Konva.js, Zustand, Yjs, PostgreSQL, Prisma, Tailwind CSS 4, Zod, BYOAI (OpenAI/Anthropic/Ollama)

---

## What's Built (v0.2.0)

**Orchestration:** Command Center dashboard, Design Pipeline (CI/CD gates), Market Intelligence (7-dimension competitive scoring), project management (tasks, milestones, Kanban), feedback system (votes + comments on any element), version history, activity feed

**Design:** Visual canvas (drag/drop, zoom/pan, selection, resize), 9 component definitions, 80+ design tokens with alias chains, light/dark themes, app map (screen relationships), font library (15 fonts, 8 pairings), responsive preview, inline annotations

**AI:** BYOAI (OpenAI, Anthropic, Ollama), 7 canvas tools via function calling, Quorum iterative refinement (6 personas), Arena parallel generation, market readiness analysis, Zod-validated tool calls

**Export:** React + Tailwind codegen, CSS variables, JSON tokens, Quorum attribution

**Security:** BaseUrl allowlist, Zod validation, CSP headers, plugin sandbox, XSS escaping

### What's Next

- [ ] Wire Quorum + Market Intel to real BYOAI providers
- [ ] Real-time multiplayer
- [ ] SwiftUI / Compose / Flutter export
- [ ] Figma import
- [ ] Plugin marketplace
- [ ] Docker production image

---

## Contributing

```bash
# Fork → clone → install → branch → code → typecheck → PR
pnpm typecheck  # must pass (23 tasks, 0 errors)
```

## License

MIT — Kevin Qi / [qinnovates](https://github.com/qinnovates)

---

*Build orchestration powered by [Quorum](https://github.com/qinnovates/quorum) — iterative multi-persona AI review.*
