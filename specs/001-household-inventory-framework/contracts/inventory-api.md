# Inventory API Contracts

## Overview

RESTful API for household inventory management. All endpoints return JSON responses.

Base URL: `/api/inventory`

## Endpoints

### GET /api/inventory

Retrieve all inventory items.

**Response**: 200 OK
```json
[
  {
    "id": 1,
    "name": "Milk",
    "quantity": 2,
    "category": "Groceries",
    "expirationDate": "2026-05-01T00:00:00Z",
    "createdAt": "2026-04-19T10:00:00Z",
    "updatedAt": "2026-04-19T10:00:00Z"
  }
]
```

### POST /api/inventory

Create a new inventory item.

**Request Body**:
```json
{
  "name": "Bread",
  "quantity": 1,
  "category": "Groceries",
  "expirationDate": "2026-04-25T00:00:00Z"
}
```

**Response**: 201 Created
```json
{
  "id": 2,
  "name": "Bread",
  "quantity": 1,
  "category": "Groceries",
  "expirationDate": "2026-04-25T00:00:00Z",
  "createdAt": "2026-04-19T10:30:00Z",
  "updatedAt": "2026-04-19T10:30:00Z"
}
```

**Error Responses**:
- 400 Bad Request: Validation errors
- 409 Conflict: Item name already exists in category

### PUT /api/inventory/{id}

Update an existing inventory item.

**Request Body**:
```json
{
  "name": "Milk",
  "quantity": 1,
  "category": "Groceries",
  "expirationDate": "2026-05-01T00:00:00Z"
}
```

**Response**: 200 OK (updated item)

### DELETE /api/inventory/{id}

Soft-delete an inventory item.

**Response**: 204 No Content

## Data Types

### InventoryItem
- id: integer
- name: string (1-100 chars)
- quantity: integer (>=0)
- category: string (enum)
- expirationDate: string? (ISO 8601 date)
- createdAt: string (ISO 8601 datetime)
- updatedAt: string (ISO 8601 datetime)

### Error Response
```json
{
  "message": "Validation failed",
  "errors": {
    "name": ["Name is required"],
    "quantity": ["Quantity must be non-negative"]
  }
}
```