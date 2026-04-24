# Tasks: Inventory Sort Order & Item Detail View

**Input**: Design documents from `/specs/006-sort-detail-view/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: TDD required — tests must be written and **failing** before implementation (Constitution Principle II).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install the new Radix UI AlertDialog package and create the shared UI component needed by US2. US1 and US3 have no setup prerequisites beyond this phase.

- [ ] T001 Install @radix-ui/react-alert-dialog npm package in frontend/
- [ ] T002 Create Radix UI AlertDialog wrapper component in frontend/src/components/ui/alert-dialog.tsx following the existing shadcn/ui pattern (see research.md Decision 3)

---

## Phase 2: User Story 1 — Smart Sort Order (Priority: P1) 🎯 MVP

**Goal**: Items in the inventory table are sorted into three tiers — expired stocked items first, non-expired stocked items second, zero-quantity items last — with ascending alphabetical order within each tier.

**Independent Test**: Load the inventory page and verify item display order matches the three-tier spec. No navigation required.

### Tests for User Story 1 ⚠️ Write FIRST — verify they FAIL before proceeding

- [ ] T003 [P] [US1] Add failing three-tier sort tests to frontend/src/components/InventoryTable.test.tsx covering: all-same-tier alphabetical order, expired-stocked above non-expired-stocked, zero-qty tier at bottom, tier transition after quantity update, case-insensitive tie-breaking

### Implementation for User Story 1

- [ ] T004 [US1] Implement `sortInventoryItems(items: InventoryItem[]): InventoryItem[]` pure function and apply it to the items array before render in frontend/src/components/InventoryTable.tsx (tier key: 0=expired qty>0, 1=non-expired qty>0, 2=qty=0; within tier: ascending `localeCompare`)

**Checkpoint**: Inventory loads with correct three-tier sort; all T003 tests pass. No navigation needed to verify. US1 is MVP-complete.

---

## Phase 3: User Story 2 — Item Detail Page (Priority: P2)

**Goal**: Item names in the inventory table are clickable links to a detail page that shows all fields and the Remove button. The detail page requires a confirmation dialog before deletion and handles the 404 not-found state. The inventory table no longer shows the Expires column or the Remove/Actions column.

**Independent Test**: Click an item name link, verify the detail page shows all fields and the Remove button, confirm the Remove flow, verify cancelling stays on the page, and verify the main table has no Remove or Expires columns.

### Tests for User Story 2 ⚠️ Write FIRST — verify they FAIL before proceeding

- [ ] T005 [P] [US2] Create frontend/src/pages/ItemDetailPage.test.tsx with failing tests for: loading state renders, all fields displayed (name, quantity, category, expiration date), "—" shown for missing optional fields, Remove button opens AlertDialog, confirming deletes item and navigates to /inventory, cancelling stays on detail page unchanged, back control navigates to /inventory, 404 response renders not-found message with link back
- [ ] T006 [P] [US2] Add failing tests for name-as-link and column removal to frontend/src/components/InventoryTable.test.tsx: item name renders as an anchor/Link element, no Remove button present in table rows, no expiration date column present in table

### Implementation for User Story 2

- [ ] T007 [US2] Create frontend/src/pages/ItemDetailPage.tsx implementing the Loading → Loaded → ConfirmDialog → Deleting → Redirect state machine; call GET /api/inventory/:id and DELETE /api/inventory/:id per contracts/item-detail-api.md; render AlertDialog from alert-dialog.tsx on Remove click; navigate to /inventory after confirmed delete; render not-found message with Link on 404
- [ ] T008 [P] [US2] Add /inventory/:id route pointing to ItemDetailPage component in frontend/src/App.tsx
- [ ] T009 [P] [US2] Update frontend/src/components/InventoryTable.tsx: render item name as `<Link to={/inventory/${item.id}}>`, remove the Expires column header and all Expires cells, remove the Actions column header and all Remove button cells

**Checkpoint**: Clicking an item name navigates to the detail page; all fields shown; Remove requires confirmation; confirmed delete returns to inventory; main table shows neither Remove nor Expires columns; all T005 and T006 tests pass.

---

## Phase 4: User Story 3 — Expiry Status Indicator (Priority: P3)

**Goal**: A `TriangleAlert` warning icon from Lucide React appears inline next to the item name in the inventory table for any item whose expiration date is on or before today. Items with a future or missing expiration date show no icon.

**Independent Test**: Add an item with a past expiration date and verify the warning icon appears next to its name. Add an item with a future date and verify no icon appears. Tests live in `InventoryTable.test.tsx`.

### Tests for User Story 3 ⚠️ Write FIRST — verify they FAIL before proceeding

- [ ] T010 [P] [US3] Add failing warning indicator tests to frontend/src/components/InventoryTable.test.tsx: expired item (date ≤ today) shows TriangleAlert icon adjacent to name, future-dated item shows no icon, item with no expiration date shows no icon

### Implementation for User Story 3

- [ ] T011 [US3] Render `TriangleAlert` icon from `lucide-react` inline next to item name in frontend/src/components/InventoryTable.tsx only when `isExpired(item)` is true; apply `text-destructive` class for visual consistency with the existing Expired badge

**Checkpoint**: Expired items display the warning icon; non-expired and undated items do not; all T010 tests pass.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Verify overall quality, coverage, and acceptance criteria across all three user stories.

- [ ] T012 [P] Run frontend test coverage report via `npm run coverage` in frontend/ and verify ≥ 80% coverage for all new and modified logic (InventoryTable.tsx sort + indicator, ItemDetailPage.tsx)
- [ ] T013 Verify all items in the quickstart.md acceptance checklist against the running application (backend on port 5007, frontend on port 5173 at http://localhost:5173)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (US1)**: Depends on Phase 1 completion — can start after T001 and T002
- **Phase 3 (US2)**: Depends on Phase 1 (T002 alert-dialog.tsx needed by T007) — recommended after Phase 2 to avoid InventoryTable.tsx merge conflicts, but independently implementable
- **Phase 4 (US3)**: Recommended after Phase 3 to avoid InventoryTable.tsx conflicts — independent of US2 functionality
- **Phase 5 (Polish)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Depends only on Phase 1 — no cross-story dependencies
- **US2 (P2)**: Depends on Phase 1 (T002 alert-dialog.tsx) — independent of US1 logic
- **US3 (P3)**: No functional dependency on US1 or US2 — `isExpired` may already exist in InventoryTable.tsx; reuse rather than duplicate

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD, Constitution Principle II)
- All three user stories touch `InventoryTable.tsx` — implement in priority order (US1 → US2 → US3) to avoid merge conflicts

### Parallel Opportunities

**Phase 1** (sequential — T002 imports the T001 package):
```
T001 → T002
```

**Phase 2 (US1)**:
```
T003 (write failing tests)  → T004 (implement sort)
```

**Phase 3 (US2)**:
```
# Start together after Phase 1:
T005 (ItemDetailPage.test.tsx)   ← parallel
T006 (InventoryTable.test.tsx)   ← parallel

# After T005 completes and T002 is done:
T007 (ItemDetailPage.tsx)        ← sequential

# After T007 and T006 respectively — these two are parallel with each other:
T008 (App.tsx route)             ← parallel with T009
T009 (InventoryTable.tsx update) ← parallel with T008
```

**Phase 4 (US3)**:
```
T010 (write failing tests) → T011 (add TriangleAlert icon)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001, T002)
2. Complete Phase 2: User Story 1 (T003, T004)
3. **STOP and VALIDATE**: Sort works correctly in browser; tests pass
4. Demo or deploy if ready

### Incremental Delivery

1. Phase 1 → Foundation ready
2. Phase 2 (US1): Three-tier sort → Test independently → **MVP demo**
3. Phase 3 (US2): Detail page + decluttered table → Test independently → Demo
4. Phase 4 (US3): Warning indicator → Test independently → Demo
5. Each story adds value without breaking the previous ones

### Parallel Team Strategy

With two developers (after Phase 1 completes):
- Developer A: Phase 2 (US1 sort — InventoryTable.tsx only)
- Developer B: Phase 3 setup — T005, T006, T007 (new files, no conflict)
- Coordinate on InventoryTable.tsx before Developer B starts T009

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks within the phase
- [Story] label maps each task to its user story for traceability
- All tests must fail before implementation begins (TDD)
- `InventoryTable.tsx` is modified by US1 (sort), US2 (link + column removal), and US3 (warning indicator) — implement in priority order to minimise conflicts
- `isExpired` helper may already exist in `InventoryTable.tsx`; reuse it for both the sort tier logic (US1) and the warning indicator (US3)
