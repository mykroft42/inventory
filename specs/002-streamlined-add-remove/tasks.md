# Tasks: Streamlined Inventory Add/Remove

**Input**: Design documents from `specs/002-streamlined-add-remove/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/inventory-api.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Tests MUST be written and FAILING before their corresponding implementation tasks begin (Constitution II)

---

## Phase 1: Setup (Baseline Verification)

**Purpose**: Confirm existing test suite is green before introducing any changes

- [X] T001 Verify all existing tests pass as baseline: run `CI=true npm test --watchAll=false` in `frontend/` and `dotnet test` in `backend.Tests/`; record pass count for regression tracking

---

## Phase 2: Foundational (Blocking Backend Changes)

**Purpose**: Model, service, and migration changes that ALL user stories depend on. No user story frontend work can proceed until this phase is complete.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tests (write first — must FAIL before implementation)

- [X] T002 Write failing unit tests for soft-delete: `DeleteItemAsync` sets `DeletedAt` and item is excluded from `GetAllItemsAsync` — extend `backend.Tests/InventoryServiceTests.cs`
- [X] T003 Write failing unit tests for `RestoreItemAsync`: clears `DeletedAt`, item reappears in `GetAllItemsAsync`, idempotent on active item — extend `backend.Tests/InventoryServiceTests.cs`
- [X] T004 Write failing unit tests for case-insensitive name-only uniqueness: "Milk" and "milk" cannot coexist; same name different category is now rejected — extend `backend.Tests/InventoryServiceTests.cs`
- [X] T005 [P] Write failing integration tests for `DELETE /api/inventory/{id}` returning 204 and item absent from subsequent GET — extend `backend.Tests/InventoryControllerTests.cs`
- [X] T006 [P] Write failing integration tests for `PATCH /api/inventory/{id}/restore` returning 200 with item body and item present in subsequent GET; test idempotency on active item — extend `backend.Tests/InventoryControllerTests.cs`

### Implementation (after tests are failing)

- [X] T007 Update `InventoryItem` model: make `Category` nullable (`Category?`), add `DeletedAt DateTime?` column, configure `Name` column with `COLLATE NOCASE` for case-insensitive uniqueness — in `backend/Models/InventoryItem.cs`
- [X] T008 Add `RestoreItemAsync(int id)` to `IInventoryService` interface — in `backend/Services/IInventoryService.cs`
- [X] T009 Update `InventoryService`: (1) `GetAllItemsAsync` filters `WHERE DeletedAt IS NULL`; (2) `DeleteItemAsync` sets `DeletedAt = UtcNow` instead of removing; (3) add `RestoreItemAsync` clearing `DeletedAt`; (4) change `EnsureUniqueNameAsync` to case-insensitive name-only (`StringComparison.OrdinalIgnoreCase`); (5) add audit log lines for delete and restore events — in `backend/Services/InventoryService.cs`
- [X] T010 Add `PATCH {id}/restore` action to `InventoryController`: call `RestoreItemAsync`, return `200 Ok(item)` on success, `404` if ID not found — in `backend/Controllers/InventoryController.cs`
- [X] T011 Create EF Core migration `SoftDeleteAndNullableCategory`: adds `DeletedAt DateTime?` column, makes `Category` nullable, replaces (Name, Category) unique index with case-insensitive name-only unique index using `COLLATE NOCASE` — run `dotnet ef migrations add SoftDeleteAndNullableCategory` from `backend/`, then review generated migration file in `backend/Migrations/`
- [X] T012 Apply migration to local database: run `dotnet ef database update` from `backend/`; verify `dotnet run` starts without errors

**Checkpoint**: Run all backend tests — T002–T006 must now PASS. `dotnet run` starts clean.

---

## Phase 3: User Story 1 — Add Item with Autocomplete (Priority: P1) 🎯 MVP

**Goal**: Replace the existing add-item form with a streamlined combo-box interface. Typing autocompletes from existing item names. Submitting an exact case-insensitive name match increments the existing item's quantity; otherwise creates a new item. Optional fields (category, expiry) are accessible via a "More options" expander.

**Independent Test**: Open `/add`, type a partial name of an existing item, see filtered suggestions, select one, enter a quantity, submit — the item's quantity increases by the entered amount. Type a brand-new name, enter quantity, submit — a new item appears in the inventory list.

### Tests (write first — must FAIL before implementation)

- [X] T013 [P] [US1] Write failing `ComboBox` component tests: renders input, filters suggestions by substring on typing, highlights match, selects on Enter/click, clears on Escape, passes empty suggestions gracefully, accessible role attributes present — in `frontend/src/components/ComboBox.test.tsx`
- [X] T014 [P] [US1] Write failing `QuickAddForm` component tests: renders name (ComboBox) and quantity fields only by default; "More options" expander reveals category and expiry; submitting existing-name item calls `update` API with incremented quantity; submitting new-name item calls `create` API; form resets and focuses name field after success; shows inline error for missing name or negative quantity — in `frontend/src/components/QuickAddForm.test.tsx`

### Implementation (after tests are failing)

- [X] T015 [P] [US1] Build `ComboBox` component: controlled `<input>` with absolutely-positioned suggestion dropdown; filters `items` prop by case-insensitive substring; keyboard nav (↑↓ to move, Enter to select, Escape to close); WCAG 2.1 AA aria attributes (`role="combobox"`, `aria-expanded`, `aria-activedescendant`, `aria-autocomplete="list"`); mobile touch targets ≥44px — in `frontend/src/components/ComboBox.tsx`
- [X] T016 [US1] Build `QuickAddForm` component: name field uses `ComboBox` fed from items prop; quantity `<input type="number" min="0">`; submit logic resolves name case-insensitively against items list — if match found calls `inventoryApi.update(id, {...existing, quantity: existing.quantity + delta})`; if no match calls `inventoryApi.create({name, quantity, category})`; after success resets form and focuses name input; inline validation for required name and non-negative quantity; "More options" `<details>`/`<summary>` expander revealing CategorySelect and ExpirationDate inputs — in `frontend/src/components/QuickAddForm.tsx`
- [X] T017 [US1] Update `AddItemPage` to render `QuickAddForm` instead of `AddItemForm`, passing the items list loaded from `inventoryApi.getAll()` — in `frontend/src/pages/AddItemPage.tsx`

**Checkpoint**: Run frontend tests. T013–T014 must PASS. Manually: open `/add`, add an existing item (quantity increments), add a new item (created), verify optional fields expand on click.

---

## Phase 4: User Story 2 — Remove Item in Fewest Clicks (Priority: P2)

**Goal**: Each inventory row shows a single delete button. Clicking it removes the item immediately (optimistic UI) and fires the DELETE API. An undo toast appears for 5 seconds. Clicking undo calls the restore endpoint. If DELETE fails, the item reappears with an error message.

**Independent Test**: On the inventory list, click delete on a row — item disappears, undo toast visible. Click undo — item reappears. Click delete again, wait 5 seconds — toast disappears, item stays gone.

### Tests (write first — must FAIL before implementation)

- [X] T018 [P] [US2] Write failing `UndoToast` component tests: renders message and undo button; undo callback fires on click; auto-dismisses after 5 seconds; does not render when `visible` is false — in `frontend/src/components/UndoToast.test.tsx`
- [X] T019 [P] [US2] Write failing `InventoryList` delete+undo tests: delete button present on each row; clicking it removes item from DOM immediately; undo toast appears; clicking undo restores item; when DELETE API rejects, item reappears with error message; +/− quantity controls still render after delete button is added — extend `frontend/src/components/InventoryList.test.tsx`

### Implementation (after tests are failing)

- [X] T020 [P] [US2] Build `UndoToast` component: accepts `message`, `onUndo`, `onDismiss`, `visible` props; renders accessible toast (`role="status"`, `aria-live="polite"`); starts 5-second countdown on mount, calls `onDismiss` on expiry; undo button calls `onUndo` and dismisses — in `frontend/src/components/UndoToast.tsx`
- [X] T021 [P] [US2] Add `restoreItem(id: number): Promise<InventoryItem>` method calling `PATCH /api/inventory/{id}/restore` to `inventoryApi` — in `frontend/src/services/inventoryApi.ts`
- [X] T022 [US2] Add delete button and undo flow to `InventoryList`: per-row trash icon button; on click — optimistically remove item from local state and fire `inventoryApi.delete(id)`; if DELETE rejects — restore item to state with inline error; if DELETE resolves — show `UndoToast`; on undo — call `inventoryApi.restoreItem(id)` and restore item to state; on toast dismiss — do nothing (item stays soft-deleted); on successful delete move keyboard focus to the next row or to the list container if the deleted item was last — in `frontend/src/components/InventoryList.tsx`

**Checkpoint**: Run frontend tests. T018–T019 must PASS. Manually: delete an item, verify undo works, verify error reappear when API is down.

---

## Phase 5: User Story 3 — Inline Quantity Adjustment (Priority: P3)

**Goal**: Clicking the quantity value on a row makes it an editable input. Confirming (Enter or blur) saves the new value immediately. Invalid values show an inline error without saving.

**Independent Test**: Click a quantity value — it becomes an input pre-filled with the current value. Type a new number, press Enter — quantity updates. Type a negative number — inline error shown, quantity unchanged.

### Tests (write first — must FAIL before implementation)

- [X] T023 [P] [US3] Write failing inline quantity edit tests: clicking quantity value renders editable input with current value; confirming valid value calls update API and shows new value; confirming invalid value shows error and does not call API; pressing Escape cancels without saving — extend `frontend/src/components/InventoryList.test.tsx`

### Implementation (after tests are failing)

- [X] T024 [US3] Add inline quantity editing to `InventoryList` rows: quantity display is a `<button>` or `<span>` that on click switches to `<input type="number">`; on blur or Enter with valid value — calls `inventoryApi.update(id, {...item, quantity: newValue})` and updates local state; on Escape — reverts to display mode; on invalid value (negative, non-numeric) — shows inline error without saving — in `frontend/src/components/InventoryList.tsx`

**Checkpoint**: Run all frontend tests. T023 must PASS. Manually verify click-to-edit on any row.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, mobile layout, and regression hardening across all stories

- [X] T025 [P] Add mobile-first CSS for `ComboBox` (suggestion dropdown full-width on small screens, 44px touch targets), `QuickAddForm` (stacked single-column layout, large submit button), and `UndoToast` (fixed bottom bar on mobile, top-right on desktop) — in `frontend/src/App.css`
- [X] T026 [P] Add `aria-label` and keyboard navigation documentation comments to `ComboBox.tsx` and `UndoToast.tsx`; verify tab order in `QuickAddForm` (name → quantity → submit → more options) — in `frontend/src/components/ComboBox.tsx` and `frontend/src/components/UndoToast.tsx`
- [X] T027 Run full test suites with coverage: `CI=true npm test --watchAll=false --coverage` in `frontend/` (verify ≥80% on component/service business logic); `dotnet test --collect:"XPlat Code Coverage"` in `backend.Tests/` (verify ≥80% on service layer); confirm all tests pass with no regressions
- [X] T028 Manual validation against quickstart.md flows: Flow 1 (add existing item increments quantity in ≤3 interactions), Flow 2 (add new item), Flow 3 (delete with undo, error reappear); verify SC-001 and SC-002 success criteria

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — **BLOCKS all user story phases**
- **Phase 3 (US1)**: Depends on Phase 2 — can start as soon as backend is complete
- **Phase 4 (US2)**: Depends on Phase 2 — can run in parallel with Phase 3 (different files)
- **Phase 5 (US3)**: Depends on Phase 4 completion (both modify `InventoryList.tsx`)
- **Phase 6 (Polish)**: Depends on Phases 3–5

### User Story Dependencies

- **US1 (P1)**: Independent after Phase 2. Frontend only — no backend changes needed beyond Phase 2.
- **US2 (P2)**: Independent after Phase 2. Shares `InventoryList.tsx` with US3 — must complete before US3.
- **US3 (P3)**: Depends on US2 completion (modifies same `InventoryList.tsx` file).

### Within Each Phase

- Tests MUST be written and FAILING before implementation tasks begin
- `ComboBox.tsx` (T015) must be complete before `QuickAddForm.tsx` (T016)
- `UndoToast.tsx` (T020) and `restoreItem` (T021) are parallel; both must complete before `InventoryList.tsx` update (T022)
- US3 `InventoryList.tsx` changes (T024) must come after US2 changes (T022)

### Parallel Opportunities

- T002–T006 (backend test writing): all parallel
- T007–T010 (backend implementation): T007 → T008 → T009 → T010 (sequential)
- T013–T014 (US1 test writing): parallel
- T015 (ComboBox) and T013/T014 (tests): parallel with each other
- T018–T019 (US2 test writing): parallel
- T020–T021 (UndoToast + restoreItem): parallel
- T025–T026 (polish): parallel

---

## Parallel Example: Phase 2 (Backend Tests)

```
Parallel — write all failing tests simultaneously:
  T002: InventoryServiceTests — soft-delete
  T003: InventoryServiceTests — restore
  T004: InventoryServiceTests — case-insensitive uniqueness
  T005: InventoryControllerTests — DELETE soft-delete
  T006: InventoryControllerTests — PATCH restore
```

## Parallel Example: US1

```
Parallel — write failing tests:
  T013: ComboBox.test.tsx
  T014: QuickAddForm.test.tsx

Then sequential — implementation:
  T015: ComboBox.tsx  ← required by QuickAddForm
  T016: QuickAddForm.tsx
  T017: AddItemPage.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1: Baseline verification
2. Complete Phase 2: Foundational backend changes
3. Complete Phase 3: US1 — autocomplete add form
4. **STOP and VALIDATE**: app is functional with streamlined add
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → backend ready
2. US1 → streamlined add with autocomplete (**MVP**)
3. US2 → delete with undo
4. US3 → inline quantity edit
5. Polish → accessibility + mobile layout

---

## Notes

- [P] tasks = different files, no dependencies on each other within same phase
- [Story] label maps task to specific user story for traceability
- All tests MUST be written before their implementation task begins (Constitution II)
- `AddItemForm.tsx` is retained but no longer used on the add page after T017; its tests remain valid
- The soft-delete migration (T011) will need a pre-migration check for any existing duplicate names (case-insensitive) — the migration comment should document this
- After T012, restart the backend and confirm `GET /api/inventory` still returns existing items
