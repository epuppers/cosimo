# MediciNewUX — Cosimo AI Assistant UI

## What This Is
Medici's AI finance assistant (Cosimo) — a React SPA for CRE/PE finance workflows. Three main views: Chat (thread-based AI conversation), Workflows (template library + flow graph editor), and Brain (memory, lessons, entity graphs).

## Stack
- React 19, TypeScript (strict mode), React Router v7
- Tailwind CSS v4 (native `@import "tailwindcss"`)
- ShadCN UI with Base UI primitives (`@base-ui/react`)
- Vite, Zustand for state management
- CVA (class-variance-authority) for component variants
- tailwind-merge + clsx via `cn()` utility

## CSS Rules (Strictly Enforced)
- **Use Tailwind utility classes only.** No custom CSS classes in components.
- **Never write inline styles** (`style={}`). No exceptions without explicit approval.
- **Never use styled-components, CSS modules, or CSS-in-JS.**
- **Never add new classes to `app.css`** — only design tokens and CSS custom properties live there.
- If something can't be done with Tailwind utilities, **ask before inventing a solution**.
- Use `cn()` from `~/lib/utils` for conditional/merged class names — never string concatenation.

## Component Rules
- **Check `/app/components/ui/` for existing ShadCN components before creating anything new.**
- Use ShadCN components before building from scratch. There are 34 existing UI components.
- Follow established patterns: `data-slot` attributes, CVA for variants, `cn()` for class merging.
- Keep components small and composable — extract sub-components when a file exceeds ~300 lines.
- All component props must be fully typed with TypeScript.
- Use `VariantProps<typeof variantFn>` from CVA for type-safe variant props.

## Before Writing Any UI Code
1. Check if ShadCN already has the component (`/app/components/ui/`)
2. Check if an existing component can be extended with a new variant via CVA
3. Check `app.css` for existing design tokens before defining new colors/spacing
4. Use Lucide React (`lucide-react`) for icons — don't add other icon libraries

## Import Conventions
- Use the `~/` path alias for all internal imports (e.g., `~/components/ui/button`)
- Group imports: React → external libs → internal utils/components
- No barrel files — import directly from the component file

## Accessibility
- `a11y.css` handles accessibility overrides (dyslexic fonts, high contrast, reduced motion)
- All interactive elements must have focus-visible states
- Use proper ARIA attributes and semantic HTML
- Support keyboard navigation (Enter/Space) on custom interactive elements
- Gate all animations with `[data-a11y-motion="reduce"]`

## State Management
- Use Zustand stores in `/app/stores/` — don't introduce Redux, MobX, or other state libraries
- Keep store files focused on a single domain (theme, UI, chat, etc.)

---

## Architecture Overview

### Views (3 tabs in main area)
- **Chat** — Thread-based AI conversation with artifacts, streaming, file panel, workflow context panel
- **Workflows** — Library (template cards) + Template Detail (flow graph + info tabs)
- **Brain** — Memory (facts/traits), Lessons (domain knowledge), Data Graphs (entity SVG)

### Sidebars (swap per active tab)
- chatSidebar, workflowSidebar, brainSidebar

### Overlay Panels
- Cosimo slide-in panel (workflow editing chat)
- Task panel, Calendar panel, Usage panel (header dropdowns)
- File panel (right-side, resizable, spreadsheet + folder views)
- Workflow context panel (right-side, resizable, shows run status in Chat)
- Profile dropdown (theme toggle, purple intensity, accessibility settings)

---

## Workflows Conceptual Model

Three core concepts: Templates, Runs, and Triggers.

### Template
A reusable workflow blueprint containing: identity, input/output schemas, a flow graph of nodes and edges, trigger config, linked lessons, and linked entities.

### Run
A specific execution of a template that lives inside a chat thread. Tracks node execution status, exceptions, input/output manifests.

### Trigger Types
manual, folder-watch, schedule, email, chat-command, chained

### Node Types (in the flow graph)
- **Input** — where data enters (folder, upload, email, API, chat attachment)
- **Action** — Cosimo does work (extract, transform, calculate, generate, enrich)
- **Gate** — human review required (designed or auto-created at runtime)
- **Branch** — conditional routing based on data or confidence
- **Output** — where results go (folder, email, dashboard, another workflow, chat artifact)

### Key UX Principles
- Runs live in Chat threads — the run IS a conversation with Cosimo
- Gate nodes post messages in the thread; user responds in natural language
- Workflows are created through conversation with Cosimo
- Templates are inspectable/editable via the visual flow graph

---

## Design System

### Color & Tokens
- ALL colors must use CSS custom properties from `tokens.css` / `app.css` — no raw hex/rgb
- For alpha colors use `rgba(var(--violet-3-rgb), 0.1)` pattern (RGB triplet tokens)
- Five color scales: taupe, berry, violet, chinese, blue
- Dark mode via `.dark` class — every element MUST work in both themes

### Typography
- ChicagoFLF — pixel/retro display headings
- IBM Plex Mono — UI labels, code
- DM Sans — body text

### Visual Style
- Retro 3D beveled borders, muted palette, subtle shadows
- Border radii via design tokens (sm, md, lg)

### Flow Graph Visual Language
- Node colors by type: Input (blue), Action (violet), Gate (amber, dashed), Branch (taupe), Output (green)
- Run status colors: completed (green), running (violet + pulse), waiting (amber), pending (taupe, 40% opacity), failed (red), skipped (taupe + strikethrough)
- Gate all pulse/motion animations with `[data-a11y-motion="reduce"]`

---

## Bug Fix & Change Protocol

**When fixing a bug or making a change, follow this process:**

1. **Scope the change.** Only touch the files directly related to the bug. Do not refactor, reorganize, rename, or "improve" surrounding code.
2. **Match existing patterns.** Look at how the surrounding code is written and match it exactly — same naming, same structure, same approach. Do not introduce new patterns.
3. **Minimal diff.** The diff should be as small as possible. If a fix requires more than ~50 lines of changes, stop and explain your approach before proceeding.
4. **No drive-by refactors.** If you notice code nearby that could be "improved" — leave it alone. File a comment or mention it, but don't change it as part of a bug fix.
5. **No new dependencies.** Do not `npm install` anything without explicit approval.
6. **No new files without approval.** If the fix seems to require a new component or utility file, explain why before creating it.
7. **Verify the fix compiles.** Run `npx tsc --noEmit` after changes to catch type errors.

---

## Critical Rules

### DO NOT
- Break dark mode — every change must work in both themes
- Break accessibility modes (dyslexia font, reduced motion, high contrast)
- Break the purple intensity slider functionality
- Introduce new CSS methodologies (styled-components, CSS modules, Sass, etc.)
- Add npm dependencies without explicit approval
- Modify `tokens.css` or core `app.css` design tokens unless explicitly told to
- Remove or rename existing mock data content without approval
- Refactor or reorganize code that isn't directly related to the task at hand
- Create new CSS utility classes, custom CSS, or global styles
- Replace working Tailwind classes with a "better" approach
- Change component APIs or prop signatures without approval
- Move files or rename exports

### DO
- Keep all changes incremental — one task at a time
- Test both light and dark mode after any UI change
- Test accessibility toggles after any UI change
- Include focus-visible states for all new interactive elements
- Gate animations with `[data-a11y-motion="reduce"]`
- Use existing design tokens for all colors, spacing, radii
- Follow established component patterns (data-slot, CVA, cn())
- Read the existing code in a file before modifying it
- Confirm the fix works before marking it done
