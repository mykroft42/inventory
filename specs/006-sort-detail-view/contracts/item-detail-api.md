# API Contracts: Item Detail Page

**Branch**: `006-sort-detail-view` | **Date**: 2026-04-23

The Item Detail Page consumes two existing API endpoints. No new endpoints are introduced. These contracts document the exact shape the frontend depends on.

---

## GET /api/inventory/{id}

**Purpose**: Fetch a single inventory item by ID for the detail page.

**Request**:
```
GET /api/inventory/{id}
Content-Type: application/json
```

**Success Response** — `200 OK`:
```json
{
  "id": 42,
  "name": "Ibuprofen",
  "quantity": 3,
  "category": "Medications",
  "expirationDate": "2025-12-31T00:00:00",
  "createdAt": "2026-01-15T10:23:45",
  "updatedAt": "2026-03-01T08:00:00",
  "deletedAt": null
}
```

**Not Found Response** — `404 Not Found`:
```json
{
  "message": "Item not found"
}
```

**Frontend handling**:
- `200`: Render detail view with item data.
- `404`: Render not-found message with link back to `/inventory`.
- Other errors: Render error message with retry option.

---

## DELETE /api/inventory/{id}

**Purpose**: Soft-delete the item after the user confirms removal on the detail page.

**Request**:
```
DELETE /api/inventory/{id}
```

**Success Response** — `204 No Content`

**Not Found Response** — `404 Not Found`:
```json
{
  "message": "Item not found"
}
```

**Frontend handling**:
- `204`: Item deleted; navigate to `/inventory`.
- `404` / other errors: Display error message; remain on detail page so user can retry or navigate back manually.

---

## No New Endpoints

All existing endpoints are sufficient. The sort is entirely client-side (applied to the `GET /api/inventory` response already used by `InventoryTable`).
