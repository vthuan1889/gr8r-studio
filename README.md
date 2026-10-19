# Gr8r Studio

A calm, structured project management workspace: home dashboard, inbox, my tasks, projects with
board / list / table / calendar / timeline / files views, members, teams, activity and settings.

It doubles as the Gr8r template workbench: the same design system and UI kit ship six complete app
archetypes (project tracker, analytics & FinOps, CRM & support inbox, AI studio, commerce admin and
auth/settings flows), a live four-state simulator and a record inspector.

Built with plain JavaScript ES modules and CSS, bundled by [Vite](https://vite.dev). There is no
UI framework and no runtime dependency.

![Gr8r Studio home dashboard](docs/preview.png)

## Getting started

Requires Node.js 18 or newer (`.nvmrc` pins 22).

```bash
npm install
npm run dev       # http://localhost:5173 with hot reload
npm run build     # production build in dist/
npm run preview   # serve the production build locally
npm run lint      # ESLint
npm run format    # Prettier
```

## Project structure

```
index.html              HTML entry; loads src/main.js
public/favicon.svg      brand mark
vite.config.js          Vite config, including the Lucide icon-subset plugin
eslint.config.js        lint rules (ESLint flat config); formatting by Prettier (.prettierrc.json)
.github/workflows/      CI: lint, format check, build
docs/preview.png        README screenshot
src/
  main.js               entry: imports styles and modules, then boots the app
  styles/
    index.css           imports every stylesheet in cascade order
    tokens.css          colours, spacing, type, radius, the shared --gutter
    base.css  components.css  shell.css  panels.css  overlays.css  states.css  motion.css  responsive.css
    views/              list, board, table, calendar, timeline, projects & files
    pages/              settings, auth & onboarding
  core/                 utilities, constants, icons, store (state + lookups), theme
  data/seed.js          demo workspace data
  data/templates-seed.js  archetype metadata + fixtures for the six templates
  ui/kit.js             domain-agnostic render primitives (kit) — no store imports
  ui/                   shared render helpers, toasts, the select dropdown
  shell/                render loop and router, sidebar/topbar layout, skeletons, view engine
  components/           task list renderer
  pages/templates.js    the six archetypes, the gallery and the state gates
  pages/                one module per route
  views/                project views: board, table, calendar, timeline, files, overview
  overlays/             task drawer, modals, popovers, context menu, command palette
  features/             teams, subtasks, archive (rendering)
  actions/              user actions, event wiring, keyboard shortcuts, drag and drop
```

### Layers

Dependencies point downward:

1. `core/` and `data/` depend on nothing else in the app.
2. `ui/`, `shell/`, `components/`, `pages/`, `views/`, `overlays/` and `features/` render HTML from state.
3. `actions/` change state and re-render. Each action module registers its handlers on the
   shared action table (`A`) when it loads, so `main.js` imports them after `actions/actions.js`.

## App templates

`src/data/templates-seed.js` names the six archetypes and owns their demo data (`S.tpl`). Each one
owns a route prefix, so the shell infers the active app from navigation alone:

| Archetype                   | Routes   | Screens                                    |
| --------------------------- | -------- | ------------------------------------------ |
| Project & issue tracker     | (none)   | existing `home`, `projects`, `timeline`, … |
| SaaS analytics & FinOps     | `an-`    | overview, revenue, usage, billing ledger   |
| CRM & support inbox         | `crm-`   | split-pane inbox, deal pipeline, accounts  |
| AI & knowledge studio       | `st-`    | prompt workbench, docs, eval logs          |
| Commerce & order admin      | `cm-`    | orders, SKUs, customers                    |
| Auth, onboarding & settings | `fl-hub` | flow catalog, all six settings sections    |

- **Switcher:** the app button under the workspace name (or `Template gallery` → `src/pages/templates.js`)
  changes templates; the sidebar, breadcrumb and command menu follow.
- **States:** the `Default · Loading · Empty · Error` pill in the topbar re-renders any screen through
  `uiStateGate`, so every template can be inspected in all four states without leaving the page.
- **Inspector:** tables and cards open the record in the right-hand drawer
  (`S.ui.inspector`), with its own actions (fulfill, refund, advance stage, restock).

## Conventions

- **Rendering:** each page or view is a function that returns an HTML string from the store
  (`S`). `render()` rebuilds the shell and keeps focus and scroll positions.
- **Interactions:** elements declare `data-a="actionName"`. `actions/events.js` delegates the
  click to `A.actionName`. Inputs use `data-in`, blur handlers use `data-blur`.
- **Layout:** every page edge uses `var(--gutter)`, so the breadcrumb, page header, toolbar,
  list, table and board start on the same line.
- **Dropdowns:** write a normal `<select class="select">`. `ui/select.js` renders it as the
  design-system menu and keeps the native element as the source of truth.
- **Icons:** call `ic('name')` with any [Lucide](https://lucide.dev) icon name. The
  `virtual:icons` plugin bundles only the icons the source uses.

## Continuous integration

Every push and pull request runs lint, the format check and a production build
(`.github/workflows/ci.yml`).

## Deploy

`vercel.json` builds with Vite and serves `dist/`.
