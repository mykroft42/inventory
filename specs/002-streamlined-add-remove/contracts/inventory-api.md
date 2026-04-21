# API Contracts: Streamlined Inventory Add/Remove

These contracts amend the existing `001-household-inventory-framework` contracts. Only changed or new endpoints are documented here.

---

## Modified: POST /api/inventory

Category is now optional.

**Request body**:
```json
{
  "name": "Milk",
  "quantity": 2,
  "category": "Groceries",   // optional — omit or null for uncategorised
  "expirationDate": "2026-12-01"  // optional
}
```

**Success**: `201 Created` with full item body.

**Error — name already exists (case-insensitive)**:
```json
HTTP 409 Conflict
{ "error": "Item already exists", "details": "An item named 'Milk' already exists." }
```

**Note**: The frontend resolves name→ID before calling this endpoint; a 409 here indicates a race condition or bug.

---

## Modified: PUT /api/inventory/{id}

Category is now optional.

**Request body**:
```json
{
  "id": 1,
  "name": "Milk",
  "quantity": 7,
  "category": "Groceries",   // optional
  "expirationDate": null      // optional
}
```

**Success**: `204 No Content`.

---

## Modified: DELETE /api/inventory/{id}

Now performs a **soft-delete** (sets `DeletedAt`). Response is unchanged.

**Success**: `204 No Content`.
**Not found**: `404 Not Found`.

The item is immediately excluded from `GET /api/inventory` responses after this call. The item remains in the database and can be restored via the restore endpoint within any window.

---

## New: PATCH /api/inventory/{id}/restore

Clears `DeletedAt`, making the item active again. Used by the undo action.

**Request body**: none.

**Success**: `200 OK` with the restored item body.

```json
{
  "id": 1,
  "name": "Milk",
  "quantity": 5,
  "category": "Groceries",
  "expirationDate": null,
  "createdAt": "2026-04-20T10:00:00Z",
  "updatedAt": "2026-04-20T10:05:00Z",
  "deletedAt": null
}
```

**Idempotent**: If the item is already active (not soft-deleted), returns `200 OK` with the current item — no error.

**Not found**: `404 Not Found` (item ID does not exist at all).

---

## Unchanged Endpoints

- `GET /api/inventory` — returns all active (non-soft-deleted) items; no contract change.
- `GET /api/inventory/{id}` — returns a single active item; returns `404` for soft-deleted items.
