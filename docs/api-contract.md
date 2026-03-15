# API Contract — Service Layer Integration Guide

This document maps every service function in the Medici app to its suggested REST API endpoint. The backend team should use this as a reference when implementing the real API layer.

**Current state:** All service functions return mock data from `~/data/mock-*` modules. Each function is async and returns a `Promise<T>`, ready for drop-in replacement with `fetch()` calls.

**Migration pattern:** Replace the body of each service function with a `fetch()` call to the corresponding endpoint. Types remain unchanged — the API should return JSON matching the TypeScript interfaces in `~/services/types.ts`.

---

## Threads Service (`app/services/threads.ts`)

### `getThreads()`

| Field | Value |
|-------|-------|
| **Signature** | `() => Promise<Thread[]>` |
| **Endpoint** | `GET /api/threads` |
| **Parameters** | None |
| **Response** | `Thread[]` — array of all threads, ordered by recency |
| **Current impl** | Returns `MOCK_THREADS` entries ordered by `MOCK_THREAD_ORDER` |
| **Migration notes** | Backend should return threads pre-sorted by last activity. Each thread includes its full `messages[]` array — consider a separate endpoint for messages if thread lists become large. The `indicators` array (ready/waiting/running/streaming/error) should be computed server-side based on linked workflow run status. |

### `getThread(id)`

| Field | Value |
|-------|-------|
| **Signature** | `(id: string) => Promise<Thread | null>` |
| **Endpoint** | `GET /api/threads/:id` |
| **Parameters** | `id` (path) — thread ID string (e.g., `"fund3"`, `"wf-run-rentroll-047"`) |
| **Response** | `Thread` object or `null` (404) |
| **Current impl** | Looks up `MOCK_THREADS[id]`, returns deep copy or `null` |
| **Migration notes** | Should return full thread with all messages. Messages include `attachments[]`, `artifacts[]`, `isGate`, `gateStatus`, and `commandChip` fields. Artifact `data` is polymorphic — can be `ArtifactTableData`, `ArtifactMetadataData`, `ArtifactFlowGraphData`, or `string` depending on `artifact.type`. |

### `getThreadOrder()`

| Field | Value |
|-------|-------|
| **Signature** | `() => Promise<string[]>` |
| **Endpoint** | `GET /api/threads/order` |
| **Parameters** | None |
| **Response** | `string[]` — ordered array of thread IDs |
| **Current impl** | Returns copy of `MOCK_THREAD_ORDER` |
| **Migration notes** | This may be redundant if `getThreads()` returns pre-sorted results. Consider removing this endpoint and sorting server-side in the threads list query. Kept separate in mock layer because the original prototype stored order independently. |

---

## Workflows Service (`app/services/workflows.ts`)

### `getTemplates()`

| Field | Value |
|-------|-------|
| **Signature** | `() => Promise<WorkflowTemplate[]>` |
| **Endpoint** | `GET /api/workflows/templates` |
| **Parameters** | None |
| **Response** | `WorkflowTemplate[]` — all workflow templates |
| **Current impl** | Returns all entries from `MOCK_WORKFLOW_TEMPLATES` as array |
| **Migration notes** | Templates include full `nodes[]` and `edges[]` for the flow graph, plus `inputSchema`, `outputSchema`, `runs` (aggregate stats), and `recentRuns[]`. Consider whether to include `nodes`/`edges` in the list response or only in the detail endpoint — they add bulk but the library view only needs `id`, `title`, `description`, `status`, `triggerType`, `runs`. |

### `getTemplate(id)`

| Field | Value |
|-------|-------|
| **Signature** | `(id: string) => Promise<WorkflowTemplate | null>` |
| **Endpoint** | `GET /api/workflows/templates/:id` |
| **Parameters** | `id` (path) — template ID (e.g., `"rent-roll"`, `"k1-extract"`) |
| **Response** | `WorkflowTemplate` object or `null` (404) |
| **Current impl** | Looks up `MOCK_WORKFLOW_TEMPLATES[id]`, returns deep copy or `null` |
| **Migration notes** | Full template with all fields including `nodes[]`, `edges[]`, `linkedLessons[]`, `linkedEntities[]`, `inputSchema`, `outputSchema`, `recentRuns[]`. The `triggerConfig` shape varies by `triggerType` — see `TriggerConfig` interface. |

### `getRun(id)`

| Field | Value |
|-------|-------|
| **Signature** | `(id: string) => Promise<WorkflowRun | null>` |
| **Endpoint** | `GET /api/workflows/runs/:id` |
| **Parameters** | `id` (path) — run ID (e.g., `"wf-run-rentroll-047"`) |
| **Response** | `WorkflowRun` object or `null` (404) |
| **Current impl** | Looks up `MOCK_WORKFLOW_RUNS[id]` |
| **Migration notes** | Run includes `nodeStatuses` (Record mapping node ID to status string), `exceptions[]` with per-node error details, and `inputManifest`/`outputManifest` file lists. The `threadId` links to the chat thread where the run's conversation lives. |

### `getRunsForTemplate(templateId)`

| Field | Value |
|-------|-------|
| **Signature** | `(templateId: string) => Promise<WorkflowRun[]>` |
| **Endpoint** | `GET /api/workflows/templates/:id/runs` |
| **Parameters** | `templateId` (path) — template ID |
| **Response** | `WorkflowRun[]` — all runs for the given template |
| **Current impl** | Filters `MOCK_WORKFLOW_RUNS` by `templateId` field |
| **Migration notes** | Used by the Runs tab in template detail view. Consider pagination if run history grows large. |

### `getAllRuns()`

| Field | Value |
|-------|-------|
| **Signature** | `() => Promise<Record<string, WorkflowRun>>` |
| **Endpoint** | `GET /api/workflows/runs` |
| **Parameters** | None |
| **Response** | `Record<string, WorkflowRun>` — all runs keyed by run ID |
| **Current impl** | Returns deep copy of `MOCK_WORKFLOW_RUNS` |
| **Migration notes** | Used by the chat sidebar to show active run indicators on workflow-linked threads. Consider whether to return an array instead of a Record — the Record shape is inherited from the mock data structure. An array with `id` fields may be more conventional for REST. |

### `getCommands()`

| Field | Value |
|-------|-------|
| **Signature** | `() => Promise<WorkflowCommand[]>` |
| **Endpoint** | `GET /api/workflows/commands` |
| **Parameters** | None |
| **Response** | `WorkflowCommand[]` — all available slash commands |
| **Current impl** | Returns copy of `MOCK_WORKFLOW_COMMANDS` |
| **Migration notes** | Used by the chat input autocomplete when user types `/`. Each command has `command` (e.g., `"/rent-roll"`), `label`, `description`, `templateId`, and optional `argPlaceholder`. The command list should be derived from active templates that have `triggerType: 'chat-command'` or a `chatCommand` in their `triggerConfig`. |

### `findRunThread(templateId)`

| Field | Value |
|-------|-------|
| **Signature** | `(templateId: string) => string | null` |
| **Endpoint** | N/A — derive client-side or `GET /api/workflows/templates/:id/latest-run-thread` |
| **Parameters** | `templateId` — template ID |
| **Response** | Thread ID string or `null` |
| **Current impl** | Synchronous. Searches `MOCK_WORKFLOW_RUNS` for a run matching the template, returns its `threadId` |
| **Migration notes** | This is synchronous (not async) — the only non-async service function. Used for "Run" button navigation (template detail → chat thread). Consider making this a query parameter on the runs endpoint or a dedicated endpoint returning the most recent run's thread ID. |

---

## Brain Service (`app/services/brain.ts`)

### `getMemory()`

| Field | Value |
|-------|-------|
| **Signature** | `() => Promise<MemoryData>` |
| **Endpoint** | `GET /api/brain/memory` |
| **Parameters** | None |
| **Response** | `MemoryData` — `{ roleProfile, selectedTraits, presetTraits, facts }` |
| **Current impl** | Returns deep copy of `MOCK_MEMORY` |
| **Migration notes** | `roleProfile` is a text string describing the user's role. `presetTraits` are system-defined personality traits. `selectedTraits` are user-selected active traits. `facts[]` each have `text`, `category`, optional `source`/`date`, and optional `linkedEntities[]`. The memory system is per-user — backend should scope to authenticated user. Mutations (add fact, toggle trait, edit fact, delete fact) are not yet service functions — they'll need `POST/PUT/DELETE` endpoints. |

### `getLessons()`

| Field | Value |
|-------|-------|
| **Signature** | `() => Promise<Lesson[]>` |
| **Endpoint** | `GET /api/brain/lessons` |
| **Parameters** | None |
| **Response** | `Lesson[]` — all lessons |
| **Current impl** | Returns entries from `MOCK_LESSONS` as array |
| **Migration notes** | Each lesson has `scope` (`"user"` or `"company"`), `usage` count, `lastUsed` date, and optional `linkedWorkflows[]` (template IDs) and `content` (full text). The list view only needs summary fields — `content` could be deferred to the detail endpoint. |

### `getLesson(id)`

| Field | Value |
|-------|-------|
| **Signature** | `(id: string) => Promise<Lesson | null>` |
| **Endpoint** | `GET /api/brain/lessons/:id` |
| **Parameters** | `id` (path) — lesson ID |
| **Response** | `Lesson` object or `null` (404) |
| **Current impl** | Looks up `MOCK_LESSONS[id]` |
| **Migration notes** | Returns full lesson including `content` field (lesson body text). Mutations (edit, delete, toggle scope, create) are not yet service functions — they'll need corresponding endpoints. |

### `getGraphData()`

| Field | Value |
|-------|-------|
| **Signature** | `() => Promise<GraphData>` |
| **Endpoint** | `GET /api/brain/graph` |
| **Parameters** | None |
| **Response** | `GraphData` — `{ categories, nodes }` |
| **Current impl** | Returns deep copy of `MOCK_GRAPH_DATA` |
| **Migration notes** | `categories[]` define entity types (fund, person, property, company) with icons and counts. `nodes` is a `Record<string, GraphNode[]>` keyed by category ID. Each `GraphNode` has `id`, `label`, `sub` (subtitle), `facts[]`, and `related[]` (IDs of related nodes). The graph visualization is rendered client-side as SVG — backend only needs to provide the data. Consider also exposing `GraphEdge[]` if the backend computes relationships (currently edges are derived client-side from `related[]` arrays). |

---

## Panels Service (`app/services/panels.ts`)

### `getTasks()`

| Field | Value |
|-------|-------|
| **Signature** | `() => Promise<TaskData[]>` |
| **Endpoint** | `GET /api/panels/tasks` |
| **Parameters** | None |
| **Response** | `TaskData[]` — `{ title, meta, urgent }` |
| **Current impl** | Returns copy of `MOCK_TASKS` |
| **Migration notes** | Used by the task dropdown panel in the header. Each task has `title`, `meta` (descriptive text), and `urgent` boolean. This is a simple notification-style list — consider whether tasks should come from a dedicated task/todo service or be derived from workflow run statuses. |

### `getCalendar()`

| Field | Value |
|-------|-------|
| **Signature** | `() => Promise<CalendarData>` |
| **Endpoint** | `GET /api/panels/calendar` |
| **Parameters** | None |
| **Response** | `CalendarData` — `{ month, events }` |
| **Current impl** | Returns copy of `MOCK_CALENDAR` |
| **Migration notes** | `month` is a display string (e.g., `"March 2026"`). `events[]` each have `title`, `meta`, and `color` (CSS color string for the event dot). Consider accepting `month`/`year` query params to fetch specific months. The mini calendar grid is rendered client-side — only events are needed from the API. |

### `getUsage()`

| Field | Value |
|-------|-------|
| **Signature** | `() => Promise<UsageData>` |
| **Endpoint** | `GET /api/panels/usage` |
| **Parameters** | None |
| **Response** | `UsageData` — `{ planLimit, used, remaining, percentUsed, overage, renews }` |
| **Current impl** | Returns copy of `MOCK_USAGE` |
| **Migration notes** | All fields are display strings (e.g., `"1,000,000"`, `"78%"`). Backend should compute these from actual usage data. `renews` is the renewal date string. Consider returning raw numbers and formatting client-side for consistency. |

### `getSpreadsheet()`

| Field | Value |
|-------|-------|
| **Signature** | `() => Promise<SpreadsheetData>` |
| **Endpoint** | `GET /api/panels/spreadsheet` |
| **Parameters** | None |
| **Response** | `SpreadsheetData` — `{ columns, headers, rows }` |
| **Current impl** | Returns deep copy of `MOCK_SPREADSHEET` |
| **Migration notes** | Used by the file panel's spreadsheet view. `columns` are column letters (A, B, C...), `headers` are column display names, `rows[]` each have `row` (number), `cells[]` (string values), and optional `formulas[]` (formula strings or null). In production, this should be replaced with actual file content parsing — the spreadsheet view is for previewing uploaded Excel/CSV files. Consider accepting a file ID parameter. |

---

## Missing Endpoints (Mutations)

The current service layer is **read-only**. The following mutations exist as UI interactions but have no service functions yet. Backend should plan endpoints for these:

### Thread Mutations
| Action | Suggested Endpoint | Notes |
|--------|-------------------|-------|
| Send message | `POST /api/threads/:id/messages` | Body: `{ content, attachments? }`. Should trigger AI response stream. |
| Create thread | `POST /api/threads` | Body: `{ title? }`. Returns new thread with generated ID. |
| Delete thread | `DELETE /api/threads/:id` | |
| Export thread | `GET /api/threads/:id/export` | Returns downloadable format (PDF/MD). |

### Workflow Mutations
| Action | Suggested Endpoint | Notes |
|--------|-------------------|-------|
| Create template | `POST /api/workflows/templates` | Body: `WorkflowTemplate` (partial). |
| Update template | `PUT /api/workflows/templates/:id` | |
| Start run | `POST /api/workflows/templates/:id/runs` | Body: `{ files?, triggerType }`. Returns `WorkflowRun`. |
| Resolve gate | `POST /api/workflows/runs/:id/gates/:nodeId` | Body: `{ decision, message }`. |

### Brain Mutations
| Action | Suggested Endpoint | Notes |
|--------|-------------------|-------|
| Add memory fact | `POST /api/brain/memory/facts` | Body: `{ text, category }` |
| Edit memory fact | `PUT /api/brain/memory/facts/:index` | |
| Delete memory fact | `DELETE /api/brain/memory/facts/:index` | |
| Toggle trait | `PUT /api/brain/memory/traits/:name` | Body: `{ active: boolean }` |
| Create lesson | `POST /api/brain/lessons` | Body: `Lesson` (partial) |
| Update lesson | `PUT /api/brain/lessons/:id` | |
| Delete lesson | `DELETE /api/brain/lessons/:id` | |
| Toggle lesson scope | `PUT /api/brain/lessons/:id/scope` | Body: `{ scope: 'user' \| 'company' }` |

---

## Type Reference

All TypeScript interfaces are defined in `app/services/types.ts`. Key types referenced above:

- `Thread`, `Message`, `Attachment`, `Artifact` — Chat data
- `WorkflowTemplate`, `FlowNode`, `FlowEdge`, `InputSchema`, `OutputSchema` — Template data
- `WorkflowRun`, `NodeStatus`, `RunException`, `FileManifest` — Run data
- `WorkflowCommand` — Slash commands
- `MemoryData`, `MemoryFact`, `PersonalityTrait` — Memory data
- `Lesson` — Lesson data
- `GraphData`, `GraphNode`, `GraphCategory` — Entity graph data
- `TaskData`, `CalendarData`, `UsageData`, `SpreadsheetData` — Header panel data

See the full file for complete interface definitions with all fields and their types.
