# API Contract: Edit Item Fields

**Feature**: 007-edit-item-fields
**Date**: 2026-04-25

---

## Endpoint: Update Inventory Item

`PUT /api/inventory/{id}`

This endpoint already exists. The only breaking change in this feature is **removal of the past-date validation** on `ExpirationDate`.

### Request

**Path parameter**: `id` (integer) — the item's ID.

**Body** (JSON):

```json
{
  "id": 42,
  "name": "Ibuprofen",
  "quantity": 3,
  "category": "Medications",
  "expirationDate": "2025-06-01T00:00:00",
  "createdAt": "2026-01-15T10:23:45Z",
  "updatedAt": "2026-03-01T08:00:00Z",
  "deletedAt": null
}
```

**Field rules**:

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `id` | integer | yes | Must match path `{id}` |
| `name` | string | yes | 1–100 chars, `[a-zA-Z0-9 \-_]+` |
| `quantity` | integer | yes | 0–10,000 |
| `category` | string \| null | no | One of `"Groceries"`, `"Medications"`, `"Consumables"`, or `null` |
| `expirationDate` | ISO datetime string \| null | no | **Any date (past or future) is accepted** — the previous past-date rejection is removed |

### Responses

| Status | Meaning |
|--------|---------|
| `204 No Content` | Update successful |
| `400 Bad Request` | Validation error (name invalid, quantity out of range, id mismatch) |
| `404 Not Found` | Item does not exist or is soft-deleted |
| `409 Conflict` | Name already used by another item |
| `500 Internal Server Error` | Unexpected server error |

### Change from Previous Behavior

**Before this feature**: Sending an `expirationDate` with a value in the past returns:
```json
{ "error": "Validation failed", "details": ["Expiration date cannot be in the past"] }
```

**After this feature**: Past expiration dates are accepted. The `ValidateExpirationDate` validator is removed from the model. Items with past expiration dates are displayed in the expired tier on the inventory page.

---

## Frontend API Client

**No changes to `inventoryApi.update()` signature.** The call site in `ItemDetailPage` maps draft state to the full PUT body:

```
inventoryApi.update(item.id, {
  name: item.name,
  quantity: item.quantity,
  category: draftCategory,           // Category | null
  expirationDate: draftExpirationDate === "" ? null : draftExpirationDate + "T00:00:00",
  deletedAt: item.deletedAt,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
})
```
