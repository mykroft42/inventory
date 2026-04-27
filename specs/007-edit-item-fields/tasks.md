# Tasks: Edit Item Fields on Detail Page

**Input**: Design documents from `specs/007-edit-item-fields/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/item-edit-api.md ✅, quickstart.md ✅

**Tests**: Included per Constitution Principle II (TDD & Coverage) — write tests before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Establish a green baseline before introducing any changes.

- [x] T001 Run full test suite to confirm green baseline before beginning work (`cd frontend && npm test` and `cd backend.Tests && dotnet test`)

---

## Phase 2: Foundational — Backend Validator Removal

**Purpose**: Remove the ValidateExpirationDate constraint that blocks both user stories for items whose expiration date is already in the past.

**⚠️ CRITICAL**: Must complete before US1 or US2 can be tested end-to-end against a real backend.

- [x] T002 Write failing backend integration test in backend.Tests/InventoryControllerTests.cs asserting that PUT /api/inventory/{id} with a past ExpirationDate returns 204 (not 400)
- [x] T003 Remove the `[CustomValidation(typeof(InventoryItem), nameof(ValidateExpirationDate))]` attribute and the `ValidateExpirationDate` static method from backend/Models/InventoryItem.cs (makes T002 pass)
- [x] T004 [P] Remove or update tests in backend.Tests/InventoryControllerTests.cs that assert a past ExpirationDate returns 400
- [x] T005 [P] Inspect backend.Tests/InventoryServiceTests.cs and remove or update any assertions that a past ExpirationDate is rejected

**Checkpoint**: All backend tests pass; PUT with a past ExpirationDate returns 204 No Content.

---

## Phase 3: User Story 1 — Edit Item Category (Priority: P1) 🎯 MVP

**Goal**: Always-visible shadcn/ui Select for category and a Save button on the Item Detail Page; the selected category persists via PUT /api/inventory/{id}.

**Independent Test**: Open any item detail page → select a different category from the dropdown → click Save → reload page → confirm the updated category is displayed.

### Tests for User Story 1 (TDD — write before implementation)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation begins**

- [x] T006 [US1] Write failing Vitest tests for US1 acceptance scenarios in frontend/src/pages/ItemDetailPage.test.tsx: (a) category Select renders showing the current category with options Groceries, Medications, Consumables, and an unset option; (b) selecting a new category and clicking Save calls `inventoryApi.update()` with the new category in the payload; (c) successful save updates the displayed category without navigation; (d) save failure shows an error message and reverts the Select to the previous value; (e) selecting the unset option and saving sends `null` as category; (f) no editable input for item name or quantity is rendered on the page (FR-008); (g) clicking Save with no draft changes (no-op) still calls `inventoryApi.update()` and shows no error message

### Implementation for User Story 1

- [x] T007 [US1] Add `draftCategory: Category | null` and `saveState: 'idle' | 'saving' | 'error'` state initialized from the loaded item in frontend/src/pages/ItemDetailPage.tsx
- [x] T008 [US1] Replace the static category display with a shadcn/ui Select bound to `draftCategory` with options Groceries, Medications, Consumables, and sentinel value `"none"` for the unset state in frontend/src/pages/ItemDetailPage.tsx
- [x] T009 [US1] Add a Save button that sets `saveState` to `'saving'` and disables itself while saving, calls `inventoryApi.update()` with the full item body using draft values, updates `PageState` item and sets `saveState` to `'idle'` on success, and resets `draftCategory` to `item.category` and sets `saveState` to `'error'` on failure in frontend/src/pages/ItemDetailPage.tsx
- [x] T010 [US1] Add an error message element with `role="alert"` and text "Failed to save changes. Please try again." positioned above the Save button, rendered only when `saveState === 'error'` in frontend/src/pages/ItemDetailPage.tsx

**Checkpoint**: User Story 1 is fully functional and independently testable — category can be changed, saved, and confirmed after page reload.

---

## Phase 4: User Story 2 — Edit Expiration Date (Priority: P2)

**Goal**: Always-visible native date input (shadcn/ui Input type="date") for expiration date on the Item Detail Page; changes (including clearing and past dates) persist via PUT.

**Independent Test**: Open any item detail page → pick a new expiration date or clear it → click Save → reload page → confirm updated date and verify the item appears in the correct sort tier on the inventory list.

### Tests for User Story 2 (TDD — write before implementation)

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation begins**

- [x] T011 [US2] Write failing Vitest tests for US2 acceptance scenarios in frontend/src/pages/ItemDetailPage.test.tsx: (a) date input renders showing the current expirationDate as YYYY-MM-DD (or empty if unset); (b) picking a new date and clicking Save calls `inventoryApi.update()` with an ISO datetime string in the payload; (c) clearing the date input and clicking Save sends `null` as expirationDate; (d) saving a past date succeeds without frontend rejection; (e) save failure shows an error message and reverts the date input to its previous value

### Implementation for User Story 2

- [x] T012 [US2] Add `draftExpirationDate: string` state (YYYY-MM-DD format; `""` = unset) initialized from `item.expirationDate` (converted from ISO to YYYY-MM-DD, or `""` if null) in frontend/src/pages/ItemDetailPage.tsx
- [x] T013 [US2] Replace the static expiration date display with a shadcn/ui Input type="date" bound to `draftExpirationDate` in frontend/src/pages/ItemDetailPage.tsx
- [x] T014 [US2] Update the `inventoryApi.update()` call in the Save handler to map `draftExpirationDate`: `""` → `null`, `"YYYY-MM-DD"` → `"YYYY-MM-DDT00:00:00"`; also reset `draftExpirationDate` to the item's last-saved value on save failure in frontend/src/pages/ItemDetailPage.tsx

**Checkpoint**: User Stories 1 and 2 both work independently — category and expiration date can each be changed, saved, and confirmed after page reload.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final accessibility check, full test suite confirmation, and golden-path validation.

- [x] T015 [P] Verify touch targets for the category Select, date Input, and Save button meet the ≥ 44×44 px minimum on a mobile viewport in frontend/src/pages/ItemDetailPage.tsx
- [x] T016 [P] Run full test suite with coverage and confirm all tests pass and coverage meets ≥80% threshold: `cd frontend && npm test -- --coverage` and `cd backend.Tests && dotnet test --collect:"XPlat Code Coverage"`
- [x] T017 Run quickstart.md golden-path validation: start backend and frontend, open an item detail page, change both category and expiration date, click Save, reload, and confirm both values persisted
- [x] T018 Write Playwright E2E tests covering the two critical user journeys in frontend/e2e/item-detail-edit.spec.ts: if Playwright is not yet installed run `cd frontend && npm install -D @playwright/test && npx playwright install` first; (a) navigate to an item detail page, select a new category, click Save, reload, assert updated category is displayed; (b) navigate to an item detail page, set a new expiration date, click Save, reload, assert updated date is displayed and item appears in correct sort tier on the inventory list

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS end-to-end testing for both user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion
- **User Story 2 (Phase 4)**: Depends on Phase 3 completion (shares ItemDetailPage.tsx and the Save button introduced in US1)
- **Polish (Phase 5)**: Depends on Phase 4 completion

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Foundational — no dependency on US2
- **User Story 2 (P2)**: Starts after US1 (shares `ItemDetailPage.tsx`; the Save button added in T009 is extended in T014)

### Within Each User Story

- Tests MUST be written first and MUST FAIL before implementation begins
- Draft state before controls (T007 before T008, T012 before T013)
- Controls before Save handler updates (T008 before T009, T013 before T014)
- Story complete before moving to next priority

### Parallel Opportunities

- T004 and T005 (backend test cleanup) can run in parallel after T003
- T015 and T016 (polish checks) can run in parallel in Phase 5
- T018 (E2E tests) can run in parallel with T015 and T016 in Phase 5

---

## Parallel Example: Phase 2 Backend

```bash
# After T003 (validator removed), launch both cleanup tasks in parallel:
Task T004: Remove past-date rejection assertions in backend.Tests/InventoryControllerTests.cs
Task T005: Remove past-date rejection assertions in backend.Tests/InventoryServiceTests.cs
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (green baseline)
2. Complete Phase 2: Foundational (backend validator removal — CRITICAL)
3. Complete Phase 3: User Story 1 (category dropdown + Save button)
4. **STOP and VALIDATE**: Change an item's category, reload, confirm it persisted
5. Deploy/demo if ready

### Incremental Delivery

1. Phase 1 + Phase 2 → Backend fixed; foundation ready
2. Phase 3 → Category editing works end-to-end (MVP)
3. Phase 4 → Expiration date editing added
4. Phase 5 → Polish and final validation

---

## Notes

- [P] tasks = different files, no dependency on incomplete tasks in the same phase
- [Story] label maps each task to its user story for traceability
- Constitution Principle II requires TDD: tests must be written and failing before implementation
- The testing framework is **Vitest** (not Jest) — use `vi.mock`, `vi.fn()`, `vi.clearAllMocks()`
- shadcn/ui Select uses sentinel `"none"` for the unset category state; map `"none"` → `null` before calling `inventoryApi.update()`
- shadcn/ui Input type="date" uses `""` for the unset date state; map `""` → `null` before calling `inventoryApi.update()`
- The Save button is introduced in US1 (T009) and its handler is extended in US2 (T014) — it always sends both fields together in one PUT call
- Run `npm test` from the `frontend/` directory; run `dotnet test` from the `backend.Tests/` directory
