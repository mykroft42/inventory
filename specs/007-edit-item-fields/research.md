# Research: Edit Item Fields on Detail Page

**Feature**: 007-edit-item-fields
**Date**: 2026-04-25

---

## Decision 1: Backend Validation Constraint — ExpirationDate

**Decision**: Remove the `ValidateExpirationDate` custom validator from `InventoryItem.cs`.

**Rationale**: The existing `[CustomValidation(typeof(InventoryItem), nameof(ValidateExpirationDate))]` on `ExpirationDate` rejects any date in the past with the error "Expiration date cannot be in the past". This validation is fundamentally incompatible with the inventory app's domain for two reasons:
1. **Existing items with past dates cannot be updated at all.** The PUT endpoint sends the full object, so an item whose expiration date has already passed will fail model validation when the user tries to change its category — even though they are not touching the expiration date.
2. **Legitimate use case blocked.** Users need to record items that are already expired (e.g., just found an old item on the shelf). The sort/expiry feature's entire expired tier depends on items having past dates.

**Alternatives considered**:
- Make validation create-only (remove from PUT but keep on POST): adds asymmetric validation logic that would be surprising; the validation is wrong for both cases in an inventory tracking app.
- Keep validation and add frontend restriction (only allow future dates in the date picker): prevents recording already-expired items and doesn't fix the category-update-on-expired-item bug.
- Remove the validator entirely: chosen — simplest, correct for the domain.

---

## Decision 2: Category Selector Component

**Decision**: Use the existing shadcn/ui `Select` component (`frontend/src/components/ui/select.tsx`) already present in the project.

**Rationale**: The project already uses shadcn/ui (Button, AlertDialog, Input, etc.). The `Select` component is already installed. Using it maintains visual and accessibility consistency. The "unset" category state is represented as a sentinel value `"none"` in the Select and mapped to `null` before calling the API.

**Alternatives considered**:
- Native `<select>`: Works but inconsistent with the existing design system.
- Custom dropdown: Unnecessary complexity when shadcn/ui Select is already available.

---

## Decision 3: Date Input Component

**Decision**: Use a native `<input type="date">` wrapped with the existing shadcn/ui `Input` component for the expiration date field.

**Rationale**: The `Input` component is already available. A native date input provides OS-appropriate date picker UX on both desktop and mobile (which is important given the mobile-first principle VI). No additional library is needed. The value is managed as a `YYYY-MM-DD` string; an empty string represents the cleared/unset state and maps to `null` before calling the API.

**Alternatives considered**:
- A dedicated date-picker library (e.g., react-day-picker): Adds a dependency for minimal benefit over native date input for this use case.
- Plain text input with manual parsing: Poor UX and error-prone.

---

## Decision 4: Save State Management

**Decision**: Add a separate `saveState` value (type: `'idle' | 'saving' | 'error'`) alongside the existing `PageState` discriminated union. Track editable field drafts (`draftCategory`, `draftExpirationDate`) separately from the loaded item.

**Rationale**: The existing `PageState` (`loading | loaded | not-found | error`) describes page-level state. Save state is orthogonal to page state — an item can be fully loaded while a save is in progress or has failed. Mixing them would create an unwieldy union. Separate draft state allows revert-on-failure: on save error, drafts reset to the item's last known good values.

**Alternatives considered**:
- Add `saving` and `save-error` variants to `PageState`: Causes combinatorial explosion (e.g., `loaded-saving`, `loaded-save-error`) and couples unrelated concerns.
- No draft state (read field values directly from DOM on save): Makes revert-on-failure harder and test-unfriendly.

---

## Decision 5: Testing Framework — Vitest vs. Jest

**Finding**: The project uses **Vitest** (not Jest), despite the constitution referencing Jest. The existing test files (`ItemDetailPage.test.tsx`, `InventoryTable.test.tsx`) import `vi` from `vitest`. The Vitest API is Jest-compatible (`vi.mock`, `vi.clearAllMocks`, `describe`, `test`, `expect`).

**Decision**: Continue using Vitest for all new frontend tests. No migration or change needed.

---

## Decision 6: Save Triggers a Full PUT (No PATCH)

**Decision**: The Save button sends a full PUT to `PUT /api/inventory/{id}` with all item fields, preserving the existing name, quantity, and any other fields while applying the new category and expiration date values.

**Rationale**: The existing `inventoryApi.update()` already wraps the full PUT. No PATCH endpoint exists. The service's `UpdateItemAsync` already handles `Category` and `ExpirationDate`. No backend changes to the routing or service layer are needed beyond removing the date validator.

**Alternatives considered**:
- Add a PATCH endpoint: Cleaner semantically but adds unnecessary backend complexity for a two-field edit.
