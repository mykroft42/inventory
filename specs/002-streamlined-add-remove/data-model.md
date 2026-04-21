# Data Model: Streamlined Inventory Add/Remove

## Changed Entities

### InventoryItem (modified)

Extends the existing `InventoryItem` model with two changes: nullable category and soft-delete support.

| Field | Type | Required | Notes |
|---|---|---|---|
| Id | int | yes | Primary key, auto-increment |
| Name | string (max 100) | yes | Unique case-insensitively across all items; alphanumeric + spaces/hyphens/underscores |
| Quantity | int (0–10,000) | yes | Non-negative integer |
| Category | Category? (enum) | **no** | Now nullable; null = uncategorised. Values: Groceries, Medications, Consumables |
| ExpirationDate | DateTime? | no | Must not be in the past |
| CreatedAt | DateTime | yes | Set on creation, UTC |
| UpdatedAt | DateTime | yes | Updated on every mutation, UTC |
| **DeletedAt** | **DateTime?** | **new** | Null = active; non-null = soft-deleted. Set on delete, cleared on restore |

**Uniqueness constraint**: `Name` must be unique across all items (case-insensitive). The previous (Name, Category) composite uniqueness is replaced by Name-only uniqueness.

**Soft-delete behaviour**: `GetAllItemsAsync` filters `WHERE DeletedAt IS NULL`. Soft-deleted items are invisible to all normal queries. A future cleanup job may hard-delete records older than a configurable retention period.

---

## New Transient Concepts (no schema changes)

### AutocompleteSuggestion (view-only, not persisted)

Derived at runtime from the in-memory item list on the frontend.

| Field | Type | Notes |
|---|---|---|
| id | number | Item ID for upsert resolution |
| name | string | Display name |
| quantity | number | Current quantity (shown in suggestion list as context) |
| category | string \| null | Current category |

---

## Migration Requirements

1. **Add `DeletedAt` column** (`DateTime?`, nullable, default `NULL`) to `InventoryItems` table.
2. **Make `Category` nullable**: change column from `NOT NULL` to `NULL` in `InventoryItems` table.
3. **Replace (Name, Category) unique index** with a case-insensitive **Name-only** unique index.
   - Pre-migration check: verify no existing rows have duplicate names (case-insensitive). If collisions exist, surface them to the user before applying.
4. **No seed data changes** required.

---

## State Transitions

```
Active item (DeletedAt = NULL)
    │
    ├─ [DELETE action] → Soft-deleted (DeletedAt = UtcNow)
    │       │
    │       ├─ [Undo within 5s] → Active (DeletedAt = NULL)
    │       │
    │       └─ [Undo window expires] → Permanently soft-deleted
    │               (visible to future cleanup job only)
    │
    └─ [PUT quantity update] → Active (UpdatedAt = UtcNow)
```
