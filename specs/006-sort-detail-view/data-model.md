# Data Model: Inventory Sort Order & Item Detail View

**Branch**: `006-sort-detail-view` | **Date**: 2026-04-23

## No Schema Changes

This feature requires **no backend schema changes**. The `InventoryItem` entity already has all fields needed by the detail page and the sort logic.

---

## Existing Entity: InventoryItem

**Source**: `backend/Models/InventoryItem.cs`

| Field | Type | Nullable | Constraints |
|-------|------|----------|-------------|
| `Id` | `int` | No | PK, auto-increment |
| `Name` | `string` | No | 1–100 chars, alphanumeric/spaces/hyphens/underscores |
| `Quantity` | `int` | No | 0–10,000 |
| `Category` | `Category?` (enum) | Yes | `Groceries`, `Medications`, `Consumables` |
| `ExpirationDate` | `DateTime?` | Yes | Must not be in past (on creation) |
| `CreatedAt` | `DateTime` | No | Set on creation |
| `UpdatedAt` | `DateTime` | No | Updated on every mutation |
| `DeletedAt` | `DateTime?` | Yes | Soft-delete timestamp; null = active |

**Frontend TypeScript type** (`frontend/src/services/inventoryApi.ts`):

```typescript
export interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  category?: Category | null;
  expirationDate?: string | null;   // ISO 8601 string
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
```

---

## New View: Item Detail Page

The "Item Detail Page" is a **frontend route and component only** — not a new database entity.

**Route**: `/inventory/:id`
**Component**: `frontend/src/pages/ItemDetailPage.tsx`

**Data source**: `GET /api/inventory/{id}` (existing endpoint, returns `InventoryItem` JSON)

**Fields displayed**:
| Field | Display value when empty |
|-------|--------------------------|
| Name | Always present |
| Quantity | Always present |
| Category | "—" |
| Expiration Date | "—" |

**State machine** for the detail page:

```
Loading → Loaded → (user clicks Remove) → ConfirmDialog open
                                         ↓ confirm     ↓ cancel
                                       Deleting      Loaded (unchanged)
                                         ↓
                                       Redirect to /inventory

Loading → NotFound (404 from API)
```

---

## Sort Logic (frontend, no persistence)

The sort is a pure client-side transform applied in `InventoryTable.tsx` before rendering. No database query changes.

**Tier assignment**:
```
tier(item):
  if item.expirationDate != null
     && new Date(item.expirationDate) <= today
     && item.quantity > 0  → 0  (expired, stocked)
  else if item.quantity > 0 → 1  (non-expired, stocked)
  else                      → 2  (zero quantity)
```

**Sort order**: ascending by `[tier, name.localeCompare]`
