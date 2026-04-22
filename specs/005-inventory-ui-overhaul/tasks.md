# Tasks: Inventory UI Overhaul

**Input**: Design documents from `/specs/005-inventory-ui-overhaul/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**TDD Required**: Constitution Principle II mandates tests written and failing before implementation.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on each other)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Paths are relative to repository root

---

## Phase 1: Setup — CRA to Vite Migration

**Purpose**: Replace the react-scripts build toolchain with Vite. Required before Tailwind/shadcn/ui can be initialized. All tasks must complete before Phase 2.

- [X] T001 Update `frontend/package.json`: remove `react-scripts`; add `vite`, `@vitejs/plugin-react`, `vite-tsconfig-paths` as devDependencies; run `npm install`
- [X] T002 Create `frontend/vite.config.ts` with `@vitejs/plugin-react` and `resolve.alias` mapping `@/` to `src/`
- [X] T003 [P] Create `frontend/postcss.config.js` with `tailwindcss` and `autoprefixer` plugins
- [X] T004 Move `frontend/public/index.html` to `frontend/index.html`; add `<script type="module" src="/src/index.tsx"></script>` before `</body>`; remove `%PUBLIC_URL%` references
- [X] T005 Update `frontend/tsconfig.json`: add `"baseUrl": "."` and `"paths": { "@/*": ["src/*"] }`; set `"moduleResolution": "bundler"` or `"node"`
- [X] T006 Replace `frontend/src/react-app-env.d.ts` with `/// <reference types="vite/client" />`
- [X] T007 Update `frontend/package.json` scripts: `"start"` → `"dev": "vite"`, `"build"` → `"vite build"`, `"preview": "vite preview"`; update `"dev"` concurrently command to use `vite` instead of `react-scripts start`
- [X] T008 Update `frontend/src/services/inventoryApi.ts`: replace `process.env.REACT_APP_API_URL` with `import.meta.env.VITE_API_URL`; update any `.env` files to rename the variable

**Checkpoint**: Run `npm run dev` from `frontend/` — existing app must load in browser at Vite dev server URL before proceeding.

---

## Phase 2: Foundational — Tailwind CSS + shadcn/ui Initialization

**Purpose**: Install and configure the UI framework layer. All user story phases depend on these components existing. **⚠️ No user story work can begin until Phase 2 is complete.**

- [ ] T009 Install Tailwind CSS v3 dependencies in `frontend/`: `npm install -D tailwindcss@^3 autoprefixer`
- [ ] T010 Create `frontend/tailwind.config.js`: set `content` to `["./index.html", "./src/**/*.{ts,tsx}"]`; include `tailwindcss-animate` in plugins (install: `npm install tailwindcss-animate`)
- [ ] T011 Replace `frontend/src/index.css` with Tailwind base directives (`@tailwind base/components/utilities`) and shadcn/ui CSS variable theme block (`:root { --background: ...; --foreground: ...; ... }`)
- [ ] T012 Delete `frontend/src/App.css`; remove `import './App.css'` from `frontend/src/App.tsx`
- [ ] T013 Initialize shadcn/ui: create `frontend/components.json` configured for React, TypeScript, `@/components/ui` path, `@/lib/utils` utility; create `frontend/src/lib/utils.ts` with `cn` helper (`clsx` + `tailwind-merge`); install peer deps: `npm install clsx tailwind-merge class-variance-authority`
- [ ] T014 [P] Add shadcn/ui Table component: copy generated `table.tsx` to `frontend/src/components/ui/table.tsx`
- [ ] T015 [P] Add shadcn/ui Button component: copy generated `button.tsx` to `frontend/src/components/ui/button.tsx`
- [ ] T016 [P] Add shadcn/ui Input component: copy generated `input.tsx` to `frontend/src/components/ui/input.tsx`
- [ ] T017 [P] Add shadcn/ui Badge component: copy generated `badge.tsx` to `frontend/src/components/ui/badge.tsx`
- [ ] T018 [P] Add shadcn/ui Select component: copy generated `select.tsx` to `frontend/src/components/ui/select.tsx`
- [ ] T019 [P] Add shadcn/ui Label component: copy generated `label.tsx` to `frontend/src/components/ui/label.tsx`
- [ ] T020 [P] Add shadcn/ui Sonner component: install `sonner`; copy generated `sonner.tsx` to `frontend/src/components/ui/sonner.tsx`
- [ ] T021 Add `<Toaster />` from `frontend/src/components/ui/sonner.tsx` to `frontend/src/App.tsx` (placed inside the root fragment, outside `<Routes>`)

**Checkpoint**: shadcn/ui Button renders without errors; Tailwind utility classes apply visible styles. Verify in browser before proceeding to user story phases.

---

## Phase 3: User Story 1 — Compact Inventory Table (Priority: P1) 🎯 MVP

**Goal**: Replace the card grid with a compact shadcn/ui Table (32–36px rows). Quantity +/− controls remain inline per row. Undo toast migrates to Sonner.

**Independent Test**: Populate 20+ items; verify all rows visible without excess scrolling; click `+` on any row and confirm quantity updates in place; delete an item and confirm Sonner toast appears with undo.

### Tests for User Story 1 ⚠️ Write first — must FAIL before T025

- [ ] T022 [P] [US1] Write failing `InventoryTable` unit tests in `frontend/src/components/InventoryTable.test.tsx`: table element present; column headers (Name, Category, Expires, Qty, Actions) render; one row per item; empty-state message shown when items array is empty; row renders item name, category, expiration date
- [ ] T023 [P] [US1] Write failing `QuantityCell` unit tests in `frontend/src/components/QuantityCell.test.tsx`: increment button calls handler; decrement button calls handler; decrement button is disabled when quantity is 0; clicking quantity value enters edit mode; Enter commits edit; Escape cancels edit; invalid input shows error

### Implementation for User Story 1

- [ ] T024 [P] [US1] Create `frontend/src/components/QuantityCell.tsx`: accepts props from data-model.md `QuantityCell` spec; renders shadcn/ui `Button` (variant `outline`, size `icon`) for − and +; renders clickable `<button>` for qty display; renders shadcn/ui `Input` (autoFocus) when in edit mode; disables − at zero
- [ ] T025 [US1] Create `frontend/src/components/InventoryTable.tsx`: replaces `InventoryList`; renders shadcn/ui `Table` with `TableHeader` + `TableBody`; columns: Name, Category, Expires, Qty (uses `QuantityCell`), Actions; fetches data and manages state (items, loading, updatingItems, deleted, editingQty) identical to current `InventoryList` logic; on remove: calls `inventoryApi.delete` then `sonner.toast()` with Undo action; on undo: calls `inventoryApi.restoreItem`; on qty change: calls `handleQuantityChange`; responsive: non-critical columns hidden below `sm` breakpoint; zero-qty rows and expired rows handled in Phase 5
- [ ] T026 [US1] Update `frontend/src/pages/InventoryPage.tsx`: import `InventoryTable` instead of `InventoryList`
- [ ] T027 [US1] Delete `frontend/src/components/InventoryList.tsx`, `frontend/src/components/InventoryList.test.tsx`, `frontend/src/components/UndoToast.tsx`, `frontend/src/components/UndoToast.test.tsx`
- [ ] T028 [US1] Update `frontend/cypress/e2e/inventory.cy.ts`: replace `.inventory-item` class selectors with `tr` row selectors or `data-testid` attributes; update quantity update test to target table row instead of card; keep all other scenario coverage intact

**Checkpoint**: User Story 1 fully functional. 20 items render in compact table; quantity +/− works; delete + undo toast works. Run `npm test` and confirm InventoryTable + QuantityCell tests pass.

---

## Phase 4: User Story 2 — Visually Consistent Experience (Priority: P2)

**Goal**: Apply shadcn/ui and Tailwind styling consistently to all remaining surfaces: AddItemForm, QuickAddForm, ComboBox, nav header, page layouts.

**Independent Test**: Visit both `/inventory` and `/add-item`; verify buttons, inputs, typography, and spacing are visually uniform; verify hover/focus states are consistent across all interactive elements.

### Tests for User Story 2 ⚠️ Update to fail before T032

- [ ] T029 [P] [US2] Update `frontend/src/components/AddItemForm.test.tsx`: change selectors to match shadcn/ui Input, Select, Label, Button rendered output (e.g., `getByRole('textbox', { name: /item name/i })` instead of `getByTestId`); run tests and confirm they fail against current implementation
- [ ] T030 [P] [US2] Update `frontend/src/components/QuickAddForm.test.tsx`: update selectors for shadcn/ui Input and Button; confirm tests fail against current implementation

### Implementation for User Story 2

- [ ] T031 [P] [US2] Restyle `frontend/src/components/AddItemForm.tsx`: replace `className="form-group"` divs with shadcn/ui `Label` + `Input` / `Select` / `SelectTrigger` / `SelectContent` / `SelectItem`; replace `className="btn"` submit button with shadcn/ui `Button`; replace `.error-message` spans with Tailwind `text-destructive text-sm` spans
- [ ] T032 [P] [US2] Restyle `frontend/src/components/QuickAddForm.tsx`: replace custom-class inputs and button with shadcn/ui `Input` and `Button`; apply Tailwind gap/flex utilities for layout
- [ ] T033 [P] [US2] Restyle `frontend/src/components/ComboBox.tsx`: replace `.combobox-container`, `.combobox-dropdown`, `.combobox-option` classes with Tailwind utility classes; keep existing ARIA and keyboard logic unchanged; update `frontend/src/components/ComboBox.test.tsx` selectors if needed
- [ ] T034 [US2] Restyle navigation header in `frontend/src/App.tsx`: replace `.topbar` / `.topbar-nav` / `.brand` / `.topbar-link` class-based styles with Tailwind utilities; use shadcn/ui `Button` (variant `ghost` or `link`) for nav links
- [ ] T035 [US2] Apply Tailwind layout utilities to `frontend/src/pages/InventoryPage.tsx` and `frontend/src/pages/AddItemPage.tsx`: replace `.container`, `.page-header`, `.action-bar` class references with Tailwind equivalents

**Checkpoint**: User Stories 1 AND 2 both function correctly. No custom `.btn`, `.form-group`, `.inventory-item`, `.topbar`, or `.quantity-controls` CSS class references remain in component files. Run `npm test` and confirm all updated tests pass.

---

## Phase 5: User Story 3 — Status Indicators at a Glance (Priority: P3)

**Goal**: Visually distinguish expired items (Badge in Expiration column) and zero-quantity items (muted row) within the table.

**Independent Test**: Add an item with a past expiration date → verify "Expired" badge appears in its row without navigating away. Set an item to quantity 0 → verify the row is visually dimmed compared to rows with stock.

### Tests for User Story 3 ⚠️ Write first — must FAIL before T038

- [ ] T036 [US3] Add failing tests to `frontend/src/components/InventoryTable.test.tsx`: (a) item with past expiration date renders a `Badge` with text "Expired" in the Expires column; (b) item with future expiration renders no badge; (c) item with quantity 0 has row element with class containing `muted`; (d) item with quantity > 0 does not have muted row class

### Implementation for User Story 3

- [ ] T037 [US3] Update `frontend/src/components/InventoryTable.tsx` Expiration column cell: compute `isExpired = expirationDate && new Date(expirationDate) <= new Date()`; render formatted date; if `isExpired`, render `<Badge variant="destructive">Expired</Badge>` from shadcn/ui after the date
- [ ] T038 [US3] Update `frontend/src/components/InventoryTable.tsx` row class: apply `text-muted-foreground` Tailwind class to `<TableRow>` when `item.quantity === 0`; confirm decrement button remains disabled at zero regardless of muting
- [ ] T039 [US3] Update `frontend/cypress/e2e/inventory.cy.ts`: add e2e scenario verifying expired badge visibility and zero-qty row dimming against live dev server

**Checkpoint**: All three user stories independently functional. Expired and zero-qty items distinguishable at a glance. Run `npm test` — all test files pass.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, dead code removal, coverage verification.

- [ ] T040 [P] Confirm all dead code removed: `frontend/src/App.css` deleted; `InventoryList.tsx`, `InventoryList.test.tsx`, `UndoToast.tsx`, `UndoToast.test.tsx` deleted; no unused `import` statements remain in any modified file
- [ ] T041 [P] Run full Jest test suite from `frontend/`: confirm all tests pass and frontend coverage meets ≥80% threshold per Constitution Principle II
- [ ] T042 [P] Run Cypress e2e suite (`npm run cypress:run` from `frontend/`): confirm all scenarios pass including add-item, quantity-update, delete-with-undo, expired-badge, zero-qty-muting
- [ ] T043 Run quickstart.md validation: `npm run dev` starts Vite server; `npm test` passes; `dotnet run` (backend) starts; full app loads and all pages function end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Vite Migration)**: No dependencies — start immediately
- **Phase 2 (Tailwind + shadcn)**: Requires Phase 1 complete — **blocks all user story phases**
- **Phase 3 (US1)**: Requires Phase 2 complete
- **Phase 4 (US2)**: Requires Phase 2 complete; independent from Phase 3
- **Phase 5 (US3)**: Requires Phase 3 complete (builds on `InventoryTable.tsx`)
- **Phase 6 (Polish)**: Requires all story phases complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no dependencies on US2 or US3
- **US2 (P2)**: Can start after Phase 2 — independent from US1 (different components)
- **US3 (P3)**: Requires US1 complete (extends `InventoryTable.tsx`)

### Within Each Phase

- TDD tasks (Tx → Ty) MUST be written and confirmed failing before paired implementation tasks begin
- Models/components before consumers (QuantityCell before InventoryTable)
- Core implementation before integration updates (InventoryTable before InventoryPage update)

---

## Parallel Opportunities

### Phase 1 (within-phase parallel)

```
T003 (postcss.config.js) — in parallel with T001, T002, T004, T005, T006, T007, T008
```

### Phase 2 (within-phase parallel once T013 done)

```
T014 table.tsx  ──┐
T015 button.tsx   │
T016 input.tsx    │─ all parallel after T013 (shadcn init)
T017 badge.tsx    │
T018 select.tsx   │
T019 label.tsx    │
T020 sonner.tsx  ──┘
```

### Phase 3 + Phase 4 (inter-story parallel after Phase 2)

```
Phase 3 (US1): T022 → T023 → T024 → T025 → T026 → T027 → T028
Phase 4 (US2): T029 → T030 → T031 → T032 → T033 → T034 → T035
                ↑ Can run concurrently with Phase 3
```

### Within Phase 3

```
T022 (InventoryTable.test.tsx) — parallel with T023 (QuantityCell.test.tsx)
T024 (QuantityCell.tsx) — parallel with T022/T023; QuantityCell before InventoryTable
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Vite Migration
2. Complete Phase 2: Tailwind + shadcn/ui Foundation
3. Complete Phase 3: US1 — Compact Table
4. **STOP and VALIDATE**: 20+ items render compactly; quantity controls work; undo toast works
5. Demo/deploy if sufficient

### Incremental Delivery

1. Phase 1 + 2 → build toolchain ready
2. Phase 3 → compact table MVP — primary density win delivered
3. Phase 4 → full visual consistency across all pages
4. Phase 5 → status indicators (expired/out-of-stock)
5. Phase 6 → polish and coverage verification

### Parallel Team Strategy

After Phase 2 completes:
- Developer A: Phase 3 (InventoryTable + QuantityCell)
- Developer B: Phase 4 (AddItemForm, QuickAddForm, ComboBox, App nav)
- Merge and then tackle Phase 5 together (extends InventoryTable)

---

## Notes

- All Phase 1 tasks must complete before `npm install` can pick up new deps; run `npm install` after T001 and T009
- shadcn/ui components are copied into `src/components/ui/` — do NOT import from an npm package
- `cn()` utility (`frontend/src/lib/utils.ts`) is required by all shadcn/ui component files
- Cypress selectors in `inventory.cy.ts` reference old CSS class names; T028 and T039 must update these
- The `VITE_API_URL` rename (T008) affects `.env` files which are gitignored — document in quickstart.md if not already done
- Each story checkpoint is a valid stop point for demo or incremental delivery
