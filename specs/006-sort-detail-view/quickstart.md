# Quickstart: Inventory Sort Order & Item Detail View

**Branch**: `006-sort-detail-view`

## Run the Application

```bash
# Terminal 1 — backend (port 5007)
cd backend
dotnet run

# Terminal 2 — frontend (port 5173)
cd frontend
npm run dev
```

Open `http://localhost:5173` in a browser.

## Run Tests

```bash
# Frontend tests (Vitest)
cd frontend
npm test           # watch mode
npm run coverage   # with coverage report

# Backend tests (xUnit)
cd backend.Tests
dotnet test
```

## Feature Development Order (TDD)

Per Constitution Principle II, tests must be written and **failing** before implementation.

### Story P1 — Sort Order
1. In `InventoryTable.test.tsx`, add tests covering the three-tier sort (expired-stocked first, non-expired-stocked second, zero-qty last; each tier alphabetical).
2. Verify tests fail on the unmodified `InventoryTable.tsx`.
3. Add `sortInventoryItems()` function and apply it before render.
4. Verify tests pass.

### Story P2 — Item Detail Page
1. Create `frontend/src/pages/ItemDetailPage.test.tsx` with tests covering: renders all fields, shows "—" for missing fields, Remove button triggers confirmation, confirmation deletes and navigates, cancel stays on page, back button navigates, not-found state.
2. Verify tests fail (component does not exist yet).
3. Install `@radix-ui/react-alert-dialog`: `npm install @radix-ui/react-alert-dialog` in `frontend/`.
4. Create `frontend/src/components/ui/alert-dialog.tsx` (shadcn/ui pattern).
5. Create `frontend/src/pages/ItemDetailPage.tsx`.
6. Add route `/inventory/:id` to `App.tsx`.
7. Update `InventoryTable.tsx`: make name a `<Link>`, remove Expires column, remove Actions column.
8. Verify tests pass.

### Story P3 — Expiry Warning Indicator
1. In `InventoryTable.test.tsx`, add tests: warning indicator shown for expired items, not shown for future/no-date items.
2. Verify tests fail.
3. Add `TriangleAlert` icon next to item name in `InventoryTable.tsx` when `isExpired`.
4. Verify tests pass.

## Key Files

| File | Purpose |
|------|---------|
| [frontend/src/App.tsx](../../../frontend/src/App.tsx) | Add `/inventory/:id` route |
| [frontend/src/components/InventoryTable.tsx](../../../frontend/src/components/InventoryTable.tsx) | Sort, links, warning indicator, remove columns |
| [frontend/src/components/ui/alert-dialog.tsx](../../../frontend/src/components/ui/alert-dialog.tsx) | New: Radix UI AlertDialog |
| [frontend/src/pages/ItemDetailPage.tsx](../../../frontend/src/pages/ItemDetailPage.tsx) | New: item detail + remove |
| [frontend/src/components/InventoryTable.test.tsx](../../../frontend/src/components/InventoryTable.test.tsx) | Updated: sort + indicator tests |
| [frontend/src/pages/ItemDetailPage.test.tsx](../../../frontend/src/pages/ItemDetailPage.test.tsx) | New: detail page tests |

## Acceptance Verification Checklist

- [ ] Inventory loads with expired-stocked items first, then non-expired-stocked, then zero-qty; each tier alphabetical
- [ ] Quantity decrement to 0 moves item to the bottom tier immediately
- [ ] Each item name is a clickable link
- [ ] Detail page shows name, quantity, category, expiration date (or "—")
- [ ] Remove button on detail page shows confirmation dialog
- [ ] Confirming removes the item and returns to inventory list
- [ ] Cancelling leaves user on detail page unchanged
- [ ] Back button returns to inventory without changes
- [ ] Navigating to a deleted/invalid item ID shows not-found message with back link
- [ ] Main table has no Remove button column and no Expires column
- [ ] Warning indicator (TriangleAlert) visible next to expired item names
- [ ] No warning indicator for items with future or no expiration date
