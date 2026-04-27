# Quickstart: Edit Item Fields on Detail Page

**Feature**: 007-edit-item-fields
**Date**: 2026-04-25

---

## What Is Being Built

Two always-visible edit controls (category dropdown, expiration date picker) and a Save button are added to the existing Item Detail Page. Changes are persisted via the existing `PUT /api/inventory/{id}` endpoint. A backend model validation that incorrectly rejects past expiration dates is removed.

---

## Files Changed

### Backend

| File | Change |
|------|--------|
| `backend/Models/InventoryItem.cs` | Remove `[CustomValidation]` attribute and `ValidateExpirationDate` method from `ExpirationDate` field |
| `backend.Tests/InventoryControllerTests.cs` | Remove/update tests that assert past dates are rejected; add tests confirming past dates are now accepted |
| `backend.Tests/InventoryServiceTests.cs` | Update if any service-level tests rely on the removed validator |

### Frontend

| File | Change |
|------|--------|
| `frontend/src/pages/ItemDetailPage.tsx` | Add draft state, save state, category Select, date Input, Save button, error display |
| `frontend/src/pages/ItemDetailPage.test.tsx` | Add tests for all new acceptance scenarios |

No new files or routes are needed.

---

## Running the App

```bash
# Terminal 1 — backend
cd backend
dotnet run

# Terminal 2 — frontend
cd frontend
npm run dev
```

Then navigate to any item's detail page via the inventory list.

---

## Running Tests

```bash
# Frontend unit tests
cd frontend
npm test

# Backend tests
cd backend.Tests
dotnet test
```

---

## TDD Sequence (Constitution Principle II)

Follow Red-Green-Refactor for each task:

1. **Write failing test** for the new behaviour (e.g., category Select is present, Save button triggers update).
2. **Run tests** — confirm they fail for the right reason.
3. **Implement** the minimum code to make the test pass.
4. **Refactor** if needed, keeping tests green.

Key test areas:
- Category dropdown renders with all options including unset.
- Selecting a new category and clicking Save calls `inventoryApi.update()` with the correct payload.
- Date picker renders with current date value; clearing it and saving sends `null`.
- Save failure shows error message and reverts draft values.
- Save success updates the displayed values without navigation.
- Items with past expiration dates can be updated (backend integration test).

---

## Key Design Constraints

- Category and expiration date use **always-visible controls** (no edit mode toggle). Name and quantity remain read-only text.
- The Save button submits **both fields together** in one PUT call.
- On save failure: both fields revert to their last-saved values; a visible error message is shown.
- The shadcn/ui `Select` component handles category; native `<input type="date">` wrapped in shadcn `Input` handles the date.
- The `"none"` sentinel in the Select maps to `null` before the API call.
- The empty string `""` in the date input maps to `null` before the API call.
