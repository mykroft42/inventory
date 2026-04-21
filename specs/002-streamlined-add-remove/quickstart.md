# Quickstart: Streamlined Inventory Add/Remove

## Key Flows

### Flow 1: Add an existing item (increment)

1. User navigates to `/add`.
2. `QuickAddForm` is rendered. Existing items are available from the parent `InventoryPage` context (already loaded).
3. User types "mil" → `ComboBox` filters suggestions to show "Milk (qty: 5)".
4. User selects "Milk" from the dropdown (or types "Milk" exactly and tabs out).
5. User types "3" in the quantity field.
6. User submits.
7. Frontend looks up "Milk" in the item list (case-insensitive) → finds `id: 1, quantity: 5`.
8. Frontend calls `PUT /api/inventory/1` with `quantity: 8` (5 + 3), name "Milk", existing category.
9. On success: form resets, focus returns to name input.

### Flow 2: Add a new item

1. User types "Olive Oil" → no autocomplete match.
2. User types "1" in the quantity field.
3. User optionally expands "More options" and selects category "Groceries".
4. User submits.
5. Frontend finds no case-insensitive match → calls `POST /api/inventory` with `{name: "Olive Oil", quantity: 1, category: "Groceries"}`.
6. On success: form resets.

### Flow 3: Remove an item with undo

1. User sees "Aspirin" in the inventory list.
2. User clicks the delete (trash) button on the Aspirin row.
3. Frontend immediately removes Aspirin from the rendered list (optimistic update).
4. Frontend calls `DELETE /api/inventory/{id}`.
   - **If DELETE fails**: Aspirin reappears with an error message "Failed to remove — please try again".
   - **If DELETE succeeds**: Undo toast appears for 5 seconds.
5a. User clicks "Undo" within 5 seconds → Frontend calls `PATCH /api/inventory/{id}/restore` → Aspirin reappears at its original list position.
5b. User ignores toast → toast disappears after 5 seconds, deletion is permanent from user's perspective.

---

## Component Map

```
AddItemPage (/add)
└── QuickAddForm
    ├── ComboBox (name input with autocomplete)
    │   └── uses: items list from InventoryPage context or prop
    ├── QuantityInput
    └── MoreOptionsExpander
        ├── CategorySelect
        └── ExpirationDateInput

InventoryPage (/)
└── InventoryList
    ├── InventoryRow (per item)
    │   ├── QuantityControls (+/− / inline edit)
    │   └── DeleteButton
    └── UndoToast (conditional, shown after delete)
```

---

## Backend Changes Summary

| File | Change |
|------|--------|
| `Models/InventoryItem.cs` | `Category` → `Category?`; add `DeletedAt DateTime?` |
| `Services/IInventoryService.cs` | Add `RestoreItemAsync(int id)` |
| `Services/InventoryService.cs` | `GetAll` filters soft-deleted; `Delete` → soft-delete; add `Restore`; `EnsureUniqueName` → case-insensitive name-only |
| `Controllers/InventoryController.cs` | Add `PATCH {id}/restore`; update `Create`/`Update` for nullable category |
| New migration | Add `DeletedAt`, nullable Category, new name-only unique index |

---

## Test Entry Points

- `ComboBox.test.tsx` — rendering, filtering, keyboard nav (↑↓ Enter Escape), selection
- `QuickAddForm.test.tsx` — submit existing item (increment), submit new item (create), validation, optional fields collapse/expand
- `InventoryList.test.tsx` — delete button visible, optimistic removal, undo toast, error reappear on API failure
- Backend unit tests — `RestoreItemAsync`, soft-delete filtering, case-insensitive uniqueness
- Backend integration tests — `DELETE` soft-deletes, `PATCH restore` is idempotent, `GET` excludes soft-deleted
