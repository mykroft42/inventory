# Data Model: Edit Item Fields on Detail Page

**Feature**: 007-edit-item-fields
**Date**: 2026-04-25

---

## Schema Changes

**No database schema changes required.** The `InventoryItem` table already has `Category` (nullable enum) and `ExpirationDate` (nullable datetime) columns. All persistence is handled by the existing `PUT /api/inventory/{id}` endpoint.

---

## Backend Model Change

**File**: `backend/Models/InventoryItem.cs`

Remove the `ValidateExpirationDate` custom validator from `ExpirationDate`. The field becomes:

```
ExpirationDate: DateTime? (nullable, no date-range constraint)
```

**Before** (current):
```
[CustomValidation(typeof(InventoryItem), nameof(ValidateExpirationDate))]
public DateTime? ExpirationDate { get; set; }
```

**After**:
```
public DateTime? ExpirationDate { get; set; }
```

The `ValidateExpirationDate` static method is also deleted.

**Reason**: The validator rejects past dates, blocking both intentional recording of already-expired items and updates to items whose expiration date has naturally passed. See research.md Decision 1.

---

## Frontend State Model

### Page-Level State (existing, unchanged)

```
PageState =
  | { type: 'loading' }
  | { type: 'loaded'; item: InventoryItem }
  | { type: 'not-found' }
  | { type: 'error'; message: string }
```

### Save State (new)

```
SaveState = 'idle' | 'saving' | 'error'
```

### Draft Fields (new)

Two pieces of controlled state, initialized from the loaded item and updated by user interaction:

```
draftCategory: Category | null    // null = unset
draftExpirationDate: string       // YYYY-MM-DD string, "" = unset
```

**Initialization**: When `PageState` transitions to `loaded`, drafts are set from `item.category` and `item.expirationDate` (converted to YYYY-MM-DD).

**On save success**: The loaded `item` in `PageState` is updated to reflect the saved values; drafts remain in sync.

**On save failure**: Drafts reset to the values last reflected in `state.item` (last successful save). `saveState` transitions to `'error'`.

---

## Category Values

| Select display | Draft value | API value sent |
|----------------|-------------|----------------|
| Groceries      | `'Groceries'` | `'Groceries'` |
| Medications    | `'Medications'` | `'Medications'` |
| Consumables    | `'Consumables'` | `'Consumables'` |
| — (unset)      | `null` | `null` |

In the shadcn/ui `Select`, the unset state uses sentinel string `"none"` internally and is mapped to `null` before the API call.

---

## Expiration Date Encoding

| Date picker state | Draft value | API value sent |
|-------------------|-------------|----------------|
| Date selected     | `"2026-12-31"` (YYYY-MM-DD) | `"2026-12-31T00:00:00"` (ISO, time set to midnight UTC) |
| Cleared / unset   | `""` | `null` |

The frontend converts `""` → `null` and `"YYYY-MM-DD"` → ISO datetime string before calling `inventoryApi.update()`.

Existing items with past expiration dates stored in the database are unaffected by schema changes.
