# Ralph — CSS Restoration Agent Instructions

You are one iteration of an autonomous coding loop. You have a FRESH context — no memory of previous iterations. Your knowledge comes from: the codebase on disk, prd.json, progress.txt, and this CLAUDE.md.

## Your Mission

The MediciNewUX app was migrated from vanilla HTML/CSS/JS to React Router 7 + Tailwind + shadcn/ui. The migration preserved all data and component logic but **lost the visual styling**. The original had ~9,250 lines of hand-crafted CSS with a distinctive retro 3D beveled aesthetic. The React version uses generic shadcn defaults and raw Tailwind utilities that don't match.

Your job: restore the original visual design by updating React components with correct Tailwind classes and adding custom CSS where Tailwind alone can't replicate the original.

## Your Workflow (follow this exactly)

1. **Read prd.json** (in `scripts/ralph-css/`) — find the first user story where `"passes": false`. That is your ONE task.

2. **Read progress.txt** (in `scripts/ralph-css/`) — check the Patterns section first, then review recent iteration notes for context.

3. **Read app/app.css** — check what design tokens, custom CSS classes, and keyframe animations already exist. Do NOT duplicate anything that's already defined.

4. **Read the REFERENCE CSS file(s)** specified in your story's description. These live in `reference/css/`. This is what the app SHOULD look like.

5. **Read the TARGET React component(s)** you need to modify. These live in `app/components/` and `app/routes/`.

6. **Read the reference index.html** at `reference/index.html` if you need to see the original HTML structure for a component.

7. **Implement the ONE story.** Follow ALL rules below. Do not work on any other story.

8. **Verify your work** (see Verification section below).

9. **If all checks pass, commit:**
   ```bash
   git add -A
   git commit -m "style [TASK_ID]: [brief description]"
   ```

10. **Update prd.json** — set `"passes": true` for the completed story.

11. **Update progress.txt** — append a section (see format below).

12. **Stop.** Do not continue to the next story.

## Critical Rules

- **ONE story per iteration.** Never combine tasks.
- **Do not output any completion signals.** The shell script checks prd.json directly.
- **If you can't complete the story**, update progress.txt explaining WHY, leave passes as false, and stop.
- **If TypeScript breaks after your changes**, fix it before committing. Do not commit broken code.
- **Read the reference CSS first, every time.** You have no memory.
- **NEVER modify files in reference/.** That directory is read-only reference material.

## How to Apply Styles

You have three tools for restoring styles. Use them in this priority order:

### 1. Tailwind Classes (Preferred)
For standard CSS properties, use Tailwind utilities directly on JSX elements:
```tsx
// Colors via CSS custom properties (defined in app.css)
className="bg-[var(--off-white)] text-[var(--taupe-5)] border-[var(--taupe-2)]"

// Standard Tailwind
className="rounded-[var(--r-lg)] px-2 py-1 text-xs font-semibold"

// Dark mode
className="dark:bg-[var(--surface-1)] dark:text-[var(--taupe-1)]"

// Hover/focus states
className="hover:bg-[var(--violet-1)] focus-visible:ring-2"
```

### 2. Custom CSS in app.css (For Complex Patterns)
For patterns Tailwind can't express — beveled borders, complex selectors, keyframe animations, accessibility modes:
```css
/* Add to app.css in the @layer components section */
@layer components {
  .bevel {
    border-style: solid;
    border-width: 1px;
    border-color: var(--taupe-2) var(--taupe-3) var(--taupe-3) var(--taupe-2);
  }
}
```

### 3. CSS Module (Last Resort)
Only for truly component-specific complex styles (like the logo animation). Create a `.module.css` file next to the component.

## Design Token Reference

All colors MUST use CSS custom properties from `app.css`, never raw hex or Tailwind color classes like `text-blue-500`.

**WRONG:**
```tsx
className="bg-blue-100 text-green-500 border-gray-300"
```

**RIGHT:**
```tsx
className="bg-[var(--blue-1)] text-[var(--green)] border-[var(--taupe-2)]"
```

### Color Tokens Available
- **Taupes** (neutral scale): `--taupe-1` (lightest) → `--taupe-5` (darkest)
- **Violets** (primary/brand): `--violet-1` → `--violet-4`
- **Accents**: `--blue-1`/`--blue-2`/`--blue-3`, `--berry-1`/`--berry-2`/`--berry-3`, `--green`, `--red`, `--amber`
- **Surfaces**: `--off-white`, `--white`; dark mode: `--surface-0` → `--surface-3`
- **RGB triplets** for alpha: `rgba(var(--violet-3-rgb), 0.1)`, `rgba(var(--amber-rgb), 0.08)`
- **Typography**: `font-[family-name:var(--pixel)]`, `font-[family-name:var(--mono)]`, `font-[family-name:var(--sans)]`
- **Radii**: `rounded-[var(--r-sm)]` (3px), `rounded-[var(--r-md)]` (4px), `rounded-[var(--r-lg)]` (6px)

### The Bevel Pattern
The app's visual signature is a 3D beveled border. Two variants:
- **Raised** (.bevel): `border-color: var(--taupe-2) var(--taupe-3) var(--taupe-3) var(--taupe-2)`
- **Inset** (.bevel-inset): `border-color: var(--taupe-3) var(--taupe-1) var(--taupe-1) var(--taupe-3)`

Apply to: cards, panels, buttons, dropdowns, artifacts, sidebar borders, inputs.

### Dark Mode Pattern
The original uses `[data-theme="dark"]`. The React app uses Tailwind's `dark:` variant (`.dark` class on `<html>`). When porting:
- Light backgrounds → dark surfaces (`--off-white` → `--surface-1`)
- Dark text → light text (`--taupe-5` → `--taupe-1`)
- Alpha increases: `0.08` → `0.12` for tinted fills
- Bevel borders flatten (subtler in dark mode)

### Accessibility Modes
Gate animations with `[data-a11y-motion="reduce"]`. Support:
- `[data-a11y-font="dyslexia"]` — font override
- `[data-a11y-motion="reduce"]` — disable all animations
- `[data-a11y-contrast="high"]` — boost contrast
- `[data-a11y-labels="show"]` — show icon text labels

## Flow Graph Node Colors
| Type | Stroke | Fill | Dark Stroke | Dark Fill |
|------|--------|------|-------------|-----------|
| Input | `var(--blue-3)` | `var(--blue-1)` | `var(--blue-2)` | `rgba(var(--blue-3-rgb),0.12)` |
| Action | `var(--violet-3)` | `var(--violet-1)` | `var(--violet-2)` | `rgba(var(--violet-3-rgb),0.12)` |
| Gate | `var(--amber)` dashed | `rgba(var(--amber-rgb),0.08)` | `var(--amber)` | `rgba(var(--amber-rgb),0.12)` |
| Branch | `var(--taupe-3)` | `var(--off-white)` | `var(--taupe-2)` | `var(--surface-2)` |
| Output | `var(--green)` | `rgba(var(--green-rgb),0.08)` | `var(--green)` | `rgba(var(--green-rgb),0.12)` |

## Run Status Colors
| Status | Color | Extra |
|--------|-------|-------|
| completed | `var(--green)` | — |
| running | `var(--violet-3)` | pulse animation |
| waiting | `var(--amber)` | — |
| pending | `var(--taupe-1)` | 40% opacity |
| failed | `var(--red)` | — |
| skipped | `var(--taupe-1)` | strikethrough on title |

## Font Usage
- **ChicagoFLF** (`--pixel`): Section headings, sidebar titles, logo, tab labels, card titles
- **IBM Plex Mono** (`--mono`): Code, data tables, metadata values, node titles, timestamps, badges
- **DM Sans** (`--sans`): Body text, descriptions, message content, form labels

## Project Structure
```
medici-app/
  reference/          ← READ-ONLY. Original CSS, JS, HTML, fonts.
    css/              ← tokens.css, layout.css, chat.css, workflows.css, components.css, utilities.css
    js/               ← app.js, mock-data.js, icons.js
    fonts/            ← ChicagoFLF.ttf
    index.html        ← Original HTML structure
    login.html        ← Original login page
  app/                ← EDIT THESE
    app.css           ← Tailwind imports + design tokens + custom CSS layers
    a11y.css          ← Accessibility overrides
    components/
      ui/             ← shadcn base components (modify sparingly)
      layout/         ← Sidebar, header, logo, Cosimo panel
      chat/           ← Messages, input, threads, panels
      workflows/      ← Flow graph, templates, runs
      brain/          ← Memory, lessons, graph
    routes/           ← Page routes
    stores/           ← Zustand state
    hooks/            ← Custom hooks
    data/             ← Mock data
    lib/              ← Utilities
  scripts/ralph-css/  ← This loop's files
```

## Verification Steps

### For every story:
```bash
npx tsc --noEmit    # Must exit 0 — no type errors
```
If `tsc` is not available or takes too long, at minimum verify the file you edited has no syntax errors by checking imports resolve.

### For visual stories, also check:
1. Read the reference CSS carefully
2. Compare your Tailwind classes against the reference CSS properties
3. Verify dark mode variants exist for every light mode style
4. Verify accessibility data attributes are respected where relevant

### If verification fails:
1. Fix the issue
2. Re-run verification
3. If you can't fix after 2 attempts, document in progress.txt and leave passes as false

## Progress.txt Format

Append after each completed story:

```
## Iteration [N] — Task [ID]: [Title]
- What was done: [brief summary]
- Files modified: [list]
- CSS patterns ported: [list of class names / visual patterns restored]
- Key decisions: [Tailwind class vs custom CSS vs CSS module]
- Dark mode: [verified / not applicable]
- Gotchas: [anything next iteration should know]
```

If you discover reusable Tailwind patterns or custom CSS classes, add them to the **Patterns** section at the top of progress.txt.

## What NOT to Do
- Do NOT modify files in `reference/` — they are read-only
- Do NOT change component logic, props, state, or data flow — only styling. EXCEPTION: if a story explicitly says to move hard-coded colors from JS to CSS, that is allowed.
- Do NOT remove existing Tailwind classes that are correct — only add/replace incorrect ones
- Do NOT use raw hex colors — always use CSS custom properties
- Do NOT use Tailwind color classes (bg-blue-500, text-green-600) — use `bg-[var(--token)]` pattern
- Do NOT skip dark mode — every style needs a dark: variant
- Do NOT add npm dependencies
- Do NOT work on more than one story per iteration
- Do NOT modify the shadcn ui/ components unless the story specifically says to
