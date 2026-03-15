# Component Map — shadcn Inventory + Styling Handoff

## 1. Component Inventory

Every shadcn/ui component used in the Medici React codebase, with the files that import it.

### Alert
Error boundaries and status messaging in route pages.
- `routes/_app.tsx` (catch-all error boundary)
- `routes/_app.brain.graph.tsx` (error boundary)
- `routes/_app.brain.lessons.tsx` (error boundary)
- `routes/_app.brain.lessons.$id.tsx` (error boundary)
- `routes/_app.brain.memory.tsx` (error boundary)
- `routes/_app.chat.$threadId.tsx` (error boundary)
- `routes/_app.workflows.tsx` (error boundary)
- `routes/_app.workflows.$id.tsx` (error boundary)

### Avatar
Not directly imported by application components (available in ui/).

### Badge
Status indicators, tags, and labels across all views.
- `components/brain/entity-detail.tsx` (entity type, relationship labels)
- `components/brain/lesson-card.tsx` (scope badge)
- `components/brain/lesson-detail.tsx` (scope, status badges)
- `components/brain/memory-fact.tsx` (category badge)
- `components/chat/message-block.tsx` (model badge, gate status chip)
- `components/chat/message-stream.tsx` (streaming status)
- `components/chat/workflow-panel.tsx` (run status, node status)
- `components/layout/app-header.tsx` (panel badges)
- `components/layout/cosimo-panel.tsx` (context badge)
- `components/workflows/lessons-tab.tsx` (lesson scope)
- `components/workflows/node-popover.tsx` (node type badge)
- `components/workflows/overview-tab.tsx` (status, trigger badges)
- `components/workflows/schema-tab.tsx` (field type, required badges)
- `components/workflows/template-detail.tsx` (status badge)
- `components/workflows/workflow-card.tsx` (status, trigger badges)

### Button
Primary interactive element used across all views.
- `components/brain/lesson-detail.tsx` (edit, back actions)
- `components/chat/chat-input.tsx` (send, attach buttons)
- `components/chat/file-panel.tsx` (close, tab actions)
- `components/chat/workflow-panel.tsx` (close, navigate)
- `components/layout/app-header.tsx` (icon buttons, panel toggles)
- `components/layout/app-sidebar.tsx` (new chat, collapse)
- `components/layout/cosimo-panel.tsx` (send, close)
- `components/workflows/node-popover.tsx` (edit with Cosimo)
- `components/workflows/template-detail.tsx` (run, edit, back)
- `components/workflows/workflow-card.tsx` (run button)
- `routes/_app.brain.graph.tsx` (try again)
- `routes/_app.brain.lessons.$id.tsx` (try again)
- `routes/_app.brain.lessons.tsx` (try again)
- `routes/_app.brain.memory.tsx` (try again)
- `routes/_app.chat.$threadId.tsx` (try again)
- `routes/_app.tsx` (try again, catch-all)
- `routes/_app.workflows.$id.tsx` (try again)
- `routes/_app.workflows.tsx` (try again)

### Card
Container for list items.
- `components/brain/lesson-card.tsx` (lesson list item)
- `components/workflows/workflow-card.tsx` (template list item)

### Command
Chat input autocomplete for workflow commands.
- `components/ui/command.tsx` (internal — wraps Dialog, Input)

### Dialog
Modal dialogs (used internally by Command).
- `components/ui/command.tsx` (CommandDialog wrapper)

### DropdownMenu
Context menus and action menus.
- `components/brain/memory-fact.tsx` (edit/delete fact menu)
- `components/chat/chat-input.tsx` (model selector, attach menu)
- `components/workflows/template-detail.tsx` (template actions)

### Input
Text inputs for search and forms.
- `components/brain/memory-list.tsx` (search/filter input)
- `components/layout/app-sidebar.tsx` (global search)

### Label
Not directly imported by application components (available in ui/).

### Popover
Floating panels for node details and header dropdowns.
- `components/layout/app-header.tsx` (task, calendar, usage panels)
- `components/workflows/node-popover.tsx` (flow graph node detail)

### ScrollArea
Scrollable containers for long content.
- `components/chat/file-panel.tsx` (file list scroll)
- `components/chat/workflow-panel.tsx` (run details scroll)
- `routes/_app.chat.$threadId.tsx` (message thread scroll)

### Separator
Visual dividers.
- `components/ui/sidebar.tsx` (internal — sidebar section dividers)

### Sheet
Slide-in side panels.
- `components/layout/cosimo-panel.tsx` (Cosimo AI assistant panel)

### Sidebar
Application navigation sidebar.
- `components/chat/thread-list.tsx` (chat thread list)
- `components/layout/app-sidebar.tsx` (main app sidebar)
- `routes/_app.tsx` (SidebarProvider, SidebarInset)

### Skeleton
Loading state placeholders.
- `routes/_app.brain.graph.tsx` (graph loading)
- `routes/_app.brain.lessons.tsx` (lesson list loading)
- `routes/_app.brain.lessons.$id.tsx` (lesson detail loading)
- `routes/_app.brain.memory.tsx` (memory loading)
- `routes/_app.chat.tsx` (chat index loading)
- `routes/_app.chat.$threadId.tsx` (thread loading)
- `routes/_app.workflows.tsx` (library loading)
- `routes/_app.workflows.$id.tsx` (template detail loading)

### Slider
Purple intensity adjustment.
- `components/layout/app-header.tsx` (purple intensity slider)

### Switch
Toggle controls for settings.
- `components/layout/app-header.tsx` (dark mode, a11y toggles)

### Table
Data display in tables.
- `components/chat/data-table.tsx` (artifact data tables)
- `components/chat/file-panel.tsx` (spreadsheet view)
- `components/workflows/runs-tab.tsx` (run history table)
- `components/workflows/schema-tab.tsx` (input/output schema table)

### Tabs
Tab navigation for template detail views.
- `components/workflows/template-detail.tsx` (Overview, Schema, Triggers, Runs, Lessons)

### Textarea
Multi-line text input (used internally by InputGroup).
- `components/ui/input-group.tsx` (internal)

### Tooltip
Hover information on sidebar elements.
- `components/ui/sidebar.tsx` (internal — sidebar item tooltips)

---

## 2. Styling Handoff

### Base shadcn Styling (ready for CTO diff)
These components use standard shadcn styling with only Medici design token colors. They are directly diffable against production shadcn components:

- **Alert** — default `variant="destructive"` with AlertCircle icon
- **Avatar** — unmodified
- **Badge** — default + `variant="secondary"`, `variant="outline"`
- **Button** — `variant="ghost"`, `variant="outline"`, `variant="default"`, `size="icon"`, `size="sm"`
- **Card** — CardHeader, CardContent, CardFooter with standard spacing
- **Command** — CommandInput, CommandList, CommandItem, CommandGroup
- **Dialog** — unmodified (used via Command)
- **DropdownMenu** — DropdownMenuTrigger, Content, Item, Separator
- **Input** — standard text input with placeholder
- **Label** — unmodified
- **Popover** — PopoverTrigger, PopoverContent
- **ScrollArea** — vertical scrollbar
- **Separator** — horizontal divider
- **Sheet** — SheetTrigger, SheetContent (side="right" for Cosimo)
- **Sidebar** — full sidebar system (Provider, Header, Content, Footer, Menu, Group, MenuItem)
- **Skeleton** — default shimmer rectangles
- **Slider** — range 0–100 for purple intensity
- **Switch** — boolean toggle for settings
- **Table** — Table, TableHeader, TableBody, TableRow, TableHead, TableCell
- **Tabs** — TabsList, TabsTrigger, TabsContent
- **Textarea** — unmodified (internal to InputGroup)
- **Tooltip** — unmodified (internal to Sidebar)

### Custom Styling (Medici-specific, not standard shadcn)
These elements use custom CSS/Tailwind beyond shadcn defaults:

| Element | Location | Why Custom |
|---------|----------|------------|
| Flow graph SVG | `components/workflows/flow-graph.tsx` | SVG-based directed graph with custom node shapes, edge lines, arrowhead markers. Node colors per type (input=blue, action=violet, gate=amber dashed, branch=taupe, output=green). |
| Entity graph SVG | `components/brain/entity-graph.tsx` | SVG-based entity relationship diagram with custom node rendering, edge paths, and interactive zoom/pan. |
| 6-sphere logo | `components/layout/logo-mark.tsx` | CSS-only animated spheres with radial gradients, positioned in inverted triangle pattern. Uses custom keyframes. |
| Streaming animation | `components/chat/message-stream.tsx` | Multi-phase animation: thinking spheres (bounce keyframe), reasoning panel (pulse), typewriter text streaming. Three custom `@keyframes` in app.css. |
| Gate message border | `components/chat/message-block.tsx` | 3px left amber border + amber-tinted background on `.msg-gate` style messages. Tailwind utilities only (no custom CSS class). |
| Command chip | `components/chat/message-block.tsx` | Inline `/command` chip with violet background, white text, mono font. Tailwind utilities only. |
| Workflow pulse | `app/app.css` | `@keyframes wf-pulse` for running workflow node status indicator. Gated by `[data-a11y-motion="reduce"]`. |
| Thread indicators | `components/chat/thread-list.tsx` | Colored dots (green/amber/violet) with optional pulse animation for active workflow runs. |
| Beveled borders | Various layout components | Retro 3D raised-border effect using `border-color: light dark dark light` pattern on panels and cards. |

---

## 3. Design Token Mapping

Complete mapping from original `tokens.css` variables to shadcn CSS variables in `app.css`.

### shadcn Required Variables

| tokens.css Variable | shadcn Variable | Light Value | Dark Value |
|---------------------|-----------------|-------------|------------|
| `--off-white` | `--background` | `#F8F6FA` | `#18181b` |
| `--taupe-5` | `--foreground` | `#2D2D2E` | `#e0dee5` |
| `--white` | `--card` | `#FFFFFF` | `#1f1f23` |
| `--taupe-5` | `--card-foreground` | `#2D2D2E` | `#e0dee5` |
| `--white` | `--popover` | `#FFFFFF` | `#1f1f23` |
| `--taupe-5` | `--popover-foreground` | `#2D2D2E` | `#e0dee5` |
| `--violet-3` | `--primary` | `#74418F` | `#8855a8` |
| — | `--primary-foreground` | `#FFFFFF` | `#FFFFFF` |
| `--taupe-1` | `--secondary` | `#E8E6EC` | `#28282d` |
| `--taupe-5` | `--secondary-foreground` | `#2D2D2E` | `#e0dee5` |
| `--taupe-1` | `--muted` | `#E8E6EC` | `#28282d` |
| `--taupe-3` | `--muted-foreground` | `#87868B` | `#76757c` |
| `--taupe-1` | `--accent` | `#E8E6EC` | `#28282d` |
| `--taupe-5` | `--accent-foreground` | `#2D2D2E` | `#e0dee5` |
| `--red` | `--destructive` | `#C04848` | `#e05555` |
| `--taupe-2` | `--border` | `#B4B2B9` | `#36363c` |
| `--taupe-2` | `--input` | `#B4B2B9` | `#36363c` |
| `--violet-3` | `--ring` | `#74418F` | `#8855a8` |
| `--r-lg` | `--radius` | `0.375rem` (6px) | — |

### Sidebar Variables

| tokens.css Source | shadcn Variable | Light Value | Dark Value |
|-------------------|-----------------|-------------|------------|
| `--off-white` | `--sidebar` | `#F8F6FA` | `#1f1f23` |
| `--taupe-5` | `--sidebar-foreground` | `#2D2D2E` | `#e0dee5` |
| `--violet-3` | `--sidebar-primary` | `#74418F` | `#8855a8` |
| — | `--sidebar-primary-foreground` | `#FFFFFF` | `#FFFFFF` |
| `--taupe-1` | `--sidebar-accent` | `#E8E6EC` | `#28282d` |
| `--taupe-5` | `--sidebar-accent-foreground` | `#2D2D2E` | `#e0dee5` |
| `--taupe-2` | `--sidebar-border` | `#B4B2B9` | `#36363c` |
| `--violet-3` | `--sidebar-ring` | `#74418F` | `#8855a8` |

### Medici Custom Tokens (preserved as CSS custom properties)

These tokens are NOT mapped to shadcn variables — they are used directly via `var(--token-name)` in custom Tailwind classes and inline styles.

| Token Group | Variables | Purpose |
|-------------|-----------|---------|
| Taupe scale | `--taupe-1` through `--taupe-5` | Neutral grays, text hierarchy |
| Berry scale | `--berry-1` through `--berry-5` | Accent tints for bevels |
| Blue scale | `--blue-1` through `--blue-3` | Input node colors, link accents |
| Violet scale | `--violet-1` through `--violet-5` | Primary brand, action nodes, purple intensity |
| Chinese scale | `--chinese-1` through `--chinese-5` | Bevel shading, subtle accents |
| Semantic colors | `--green`, `--red`, `--amber` | Status: success, error, warning |
| Bevel pairs | `--green-hi/lo`, `--red-hi/lo` | 3D raised border highlights/shadows |
| Surface depth | `--surface-0` through `--surface-3`, `--surface-graph`, `--surface-graph-bg` | Dark mode layered surfaces |
| Text | `--text-light` | Light text on dark backgrounds |
| Red shade | `--red-dark` | Hover/pressed state for destructive |
| RGB triplets | `--violet-3-rgb`, `--berry-3-rgb`, `--green-rgb`, `--red-rgb`, `--amber-rgb`, `--blue-3-rgb`, `--taupe-3-rgb`, `--black-rgb`, `--white-pure-rgb`, `--surface-tooltip-rgb`, `--cosimo-error-rgb` | Alpha transparency via `rgba(var(--token-rgb), alpha)` |
| Font families | `--pixel`, `--mono`, `--sans` | ChicagoFLF, IBM Plex Mono, DM Sans |
| Border radii | `--r-xs` (2px), `--r-sm` (3px), `--r-md` (4px), `--r-lg` (6px), `--r-pill` (9px) | Consistent corner rounding |

### Font Mapping

| tokens.css | Tailwind Theme Variable | Font Stack |
|------------|------------------------|------------|
| `--pixel` | `--font-pixel` | `'ChicagoFLF', monospace` |
| `--mono` | `--font-mono` | `'IBM Plex Mono', monospace` |
| `--sans` | `--font-sans` | `'DM Sans', sans-serif` |

### Dark Mode Mechanism Change

| Original (tokens.css) | React (app.css) |
|----------------------|-----------------|
| `[data-theme="dark"]` selector | `.dark` class on `<html>` |
| `data-theme` attribute set via JS | `dark:` Tailwind variant + Zustand theme store |
| `[data-a11y-contrast="high"]` | `[data-a11y-contrast="high"]` (preserved) |
