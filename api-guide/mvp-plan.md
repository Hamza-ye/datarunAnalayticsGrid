# Angular Analytics Dashboard — Prioritized MVP Plan

\*Canonical reference: **[Analytics API Guide](datarun-analytics-api-guide)**

**Goal:** deliver a production-grade, standalone Angular v19 analytics UI driven by the Analytics API. 8 prioritized deliverables (MVP → Production).

---

1. **Auth + App Shell & Config**
   A. Lightweight standalone bootstrap, token storage, refresh flow.
   B. `POST /api/v1/authenticate` (login); `POST /api/v1/authenticate/refresh` (refresh).
   C. App config (`app.config.ts`), AuthService, Route guard, Login component, Topbar.
   D. Acceptance: (1) successful login stores access/refresh tokens; (2) 401 triggers refresh and retries.
   Complexity: **Low**. Risk: token-storage XSS — use HttpOnly cookies or secure storage.

2. **Metadata discovery & Field Picker**
   A. Fetch and present `PivotFieldDto` metadata so users can build queries.
   B. `GET /api/v1/analytics/pivot/metadata?templateId&templateVersionId`.
   C. FieldPicker component (grouped accordions by `displayGroup`), search, type-aware icons.
   D. Acceptance: (1) metadata loads and groups fields; (2) clicking a field adds to Dimensions/Measures.
   Complexity: **Low**. Risk: inconsistent metadata shape → robust typing + defensive parsing.

3. **Basic Data Table (TABLE_ROWS)** — core MVP visualisation
   A. Build, send queries and render `TABLE_ROWS` table with pagination.
   B. `POST /api/v1/analytics/pivot/query?format=TABLE_ROWS`.
   C. QueryBuilder (dimensions/measures UI), DataGrid component, Pagination control.
   D. Acceptance: (1) query returns rows & columns and grid shows them; (2) total used for paging.
   Complexity: **Medium**. Risk: large result sets — enforce sensible default `limit` and server-side paging.

4. **Filtering, Sorting & Pagination UX**
   A. Type-driven filter controls, sortable headers and limit/offset paging.
   B. Same `POST /api/v1/analytics/pivot/query?format=TABLE_ROWS` (include `filters`, `sorts`, `limit`, `offset`).
   C. FilterPanel, ColumnHeader sort toggles, Page size selector.
   D. Acceptance: (1) filters narrow results; (2) sort toggles change order for sortable fields only.
   Complexity: **Medium**. Risk: filter UI mismatch for complex operators — derive operators from `dataType`.

5. **UID Resolution & Formatting layer**
   A. Replace UIDs with friendly labels and apply `formatHint` (currency, percent, dates).
   B. `POST /api/v1/resolveUids`; plus any `extras.resolution.endpoint` (e.g., `/api/v1/teams`).
   C. Resolver service, cell-formatters, async placeholder skeletons.
   D. Acceptance: (1) UIDs replaced by names after batch resolve; (2) numeric/date cells respect format hints.
   Complexity: **Low–Medium**. Risk: missing UID mappings — show fallback UID and lazy-resolve on demand.

6. **Pivot Matrix & Pivot UI**
   A. Support `PIVOT_MATRIX` queries and render a pivot grid with collapsible axes and measures.
   B. `POST /api/v1/analytics/pivot/query?format=PIVOT_MATRIX`.
   C. PivotBuilder (row/column dimension pickers), PivotGrid (virtualized matrix), export button.
   D. Acceptance: (1) pivot returns matrix and grid renders cells correctly; (2) measure alias mapping works.
   Complexity: **High**. Risk: UI complexity & performance — require virtualization and cell caching.

7. **Drill-down & Hierarchical Navigation**
   A. Click cell/row to clone query with contextual filters (including hierarchical childDimension drill).
   B. Reuse `POST /api/v1/analytics/pivot/query` with added `filters` or swapped `childDimensionId`.
   C. DrillModal/DetailView, breadcrumb trail, back/expand controls.
   D. Acceptance: (1) drill shows underlying rows for clicked context; (2) hierarchical drill swaps dims correctly.
   Complexity: **Medium**. Risk: exploding queries — cap default row results and allow users to add granular filters.

8. **Errors, Validation UI & Observability**
   A. Surface API validation (400 details), instrumentation (request timing), retry logic and user-friendly error states.
   B. All API endpoints (handle 400/401/5xx).
   C. ErrorBanner, Field-level validation hints in QueryBuilder, telemetry hooks (PerfService).
   D. Acceptance: (1) API validation details map to UI hints; (2) failed request shows retry and logs metric.
   Complexity: **Medium**. Risk: silent failures — ensure visible, actionable messages and monitoring.

---

## First 3 PRs (suggested sequence)

1. **PR #1 — App Shell + Auth + Metadata fetch**
   Scope: standalone bootstrap, AuthService with token flow, initial FieldPicker fetching `pivot/metadata`.
2. **PR #2 — Core Table: Query builder + TABLE_ROWS grid + pagination**
   Scope: QueryBuilder UI, POST `pivot/query?format=TABLE_ROWS`, DataGrid rendering and paging.
3. **PR #3 — Filters, Sorting & UID Resolution**
   Scope: Type-driven filter panel, sortable columns, batch UID resolver integration and cell formatting.
