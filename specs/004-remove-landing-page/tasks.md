# Tasks: Remove Landing Page

**Input**: Design documents from `specs/004-remove-landing-page/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Organization**: Two user stories (US1, US2), both P1. Both touch `App.tsx`; tasks are sequenced accordingly.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Tests MUST be written and FAILING before their corresponding implementation tasks begin (Constitution II)

---

## Phase 1: Setup (Baseline Verification)

**Purpose**: Confirm existing test suite is green before introducing any changes

- [ ] T001 Verify all existing tests pass as baseline: run `CI=true npm test --watchAll=false` in `frontend/` and `dotnet test` in `backend.Tests/`; record pass counts for regression tracking

---

## Phase 2: User Story 1 — Direct Navigation to Inventory List (Priority: P1) 🎯 MVP

**Goal**: Visiting the root URL (`/`) loads the inventory list directly — no landing page click-through.

**Independent Test**: Open `http://localhost:3000/` — inventory list renders immediately; URL changes to `/inventory`; no `Home` page is visible.

### Tests (write first — must FAIL before implementation)

- [ ] T002 [US1] Write failing tests for root URL redirect and unknown route redirect: add two tests in `frontend/src/App.test.tsx` — (1) renders `<App />` with `MemoryRouter initialEntries={['/']}` and asserts the inventory list is displayed (and the old "Household Inventory" home heading is NOT present); (2) renders with `initialEntries={['/nonexistent']}` and asserts the inventory list is displayed (covers FR-005)

### Implementation (after T002 is failing)

- [ ] T003 [US1] Remove `Home` component and update routing in `frontend/src/App.tsx`: delete the `Home` function, add `Navigate` to the react-router-dom import, change root route from `<Route path="/" element={<Home />} />` to `<Route path="/" element={<Navigate to="/inventory" replace />} />`, and add catch-all `<Route path="*" element={<Navigate to="/inventory" replace />} />`

**Checkpoint**: T002 must now PASS. Navigating to `/` redirects to `/inventory`. Unknown routes redirect to inventory list.

---

## Phase 3: User Story 2 — Two-Page Navigation Bar (Priority: P1)

**Goal**: The navigation bar contains exactly two destination links — Inventory and Add Item — on every page.

**Independent Test**: On any page, the topbar nav shows exactly 2 links (Inventory, Add Item); the brand link also navigates to `/inventory`.

### Tests (write first — must FAIL before implementation)

- [ ] T004 [US2] Write failing test for nav bar destination hrefs: add a test in `frontend/src/App.test.tsx` that renders `<App />`, queries all `<a>` elements inside the nav, extracts their `href` values, de-duplicates them, and asserts exactly 2 unique destinations exist (`/inventory` and `/add-item`) with no href pointing to `/` (the old Home route). Do not assert on raw link count — the brand and topbar "Inventory" links both point to `/inventory` and share a destination.

### Implementation (after T004 is failing)

- [ ] T005 [US2] Update navigation bar in `frontend/src/App.tsx`: change the brand `<Link to="/">` to `<Link to="/inventory">` so the logo navigates to the inventory list; confirm the nav contains exactly the "Inventory" and "Add Item" topbar links and no Home link

**Checkpoint**: T004 must now PASS. Nav bar shows exactly 2 destination links. Brand/logo navigates to inventory list.

---

## Phase 4: Polish & Validation

- [ ] T006 Run full test suites with coverage: `CI=true npm test --watchAll=false --coverage --coverageThreshold='{"global":{"lines":80,"functions":80,"branches":80,"statements":80}}'` in `frontend/` (all tests including T002 and T004 must pass, coverage must meet ≥80% threshold, no regressions); `dotnet test` in `backend.Tests/` (all backend tests must pass)
- [ ] T007 Manual validation against quickstart.md: confirm root URL loads inventory list, nav bar shows 2 links, brand link works, unknown route redirects, and all CRUD actions still function

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (US1)**: Depends on Phase 1 baseline passing
- **Phase 3 (US2)**: Depends on Phase 2 completion (both touch `App.tsx` and `App.test.tsx`)
- **Phase 4 (Polish)**: Depends on Phase 2 and Phase 3 completion

### Within Each Phase

- Test task MUST be written and FAILING before implementation task begins
- T003 and T005 are sequential (same file — `App.tsx`)
- T002 and T004 are sequential (same file — `App.test.tsx`)

### Parallel Opportunities

- None within the sequential App.tsx / App.test.tsx edit chain
- Backend test suite (`dotnet test` in T006) can run in parallel with frontend test suite

---

## Implementation Strategy

### MVP (Both Stories Are P1)

1. Complete Phase 1: Baseline verification
2. Write T002: Failing test for root redirect
3. Complete T003: Remove Home, update routes
4. **STOP and VALIDATE**: T002 passes, root redirect works
5. Write T004: Failing test for nav bar
6. Complete T005: Update nav bar
7. **STOP and VALIDATE**: T004 passes, nav bar correct
8. Complete Phase 4: Full regression + manual validation

---

## Notes

- T002 test approach: Use `MemoryRouter` with `initialEntries={['/']}` and mock `fetch` (the inventory list will attempt to load items). Assert that the inventory list heading or component renders, and that the old "Household Inventory" `<h1>` from the `Home` component does NOT render.
- T004 test approach: Query all `<a>` elements inside the nav, extract `href` values, de-duplicate, and assert the unique set equals `['/inventory', '/add-item']`. Do not assert on raw anchor count — the brand link and topbar "Inventory" link both point to `/inventory` (3 anchors, 2 unique hrefs is correct).
- `replace` prop on `<Navigate>` is required — prevents back-button loops through the redirect.
- No backend changes required; no new files needed — only `App.tsx` and `App.test.tsx` are modified.
