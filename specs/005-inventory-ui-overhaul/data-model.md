# Data Model: Inventory UI Overhaul

**Branch**: `005-inventory-ui-overhaul` | **Date**: 2026-04-21

## Scope Note

This feature is a **frontend-only** change. No backend data model changes. All entities and API contracts are unchanged. This document describes the frontend component model and UI state.

---

## Backend Data Model (unchanged, for reference)

### InventoryItem (backend entity — no changes)

| Field | Type | Notes |
|-------|------|-------|
| `id` | `number` (int) | Auto-increment primary key |
| `name` | `string` | Required, display in Name column |
| `quantity` | `number` (int) | Non-negative integer; drives quantity controls |
| `category` | `string \| null` | Optional; one of Groceries, Medications, Consumables |
| `expirationDate` | `string \| null` | ISO date string; optional |
| `isDeleted` | `boolean` | Soft-delete flag; filtered server-side |

---

## Frontend UI Component Model

### InventoryTable (new — replaces InventoryList)

Replaces the card grid. Renders a `<Table>` with one `InventoryRow` per item.

**Props**: none (fetches data internally, same as current `InventoryList`)

**State**:

| State | Type | Purpose |
|-------|------|---------|
| `items` | `InventoryItem[]` | Loaded item list |
| `loading` | `boolean` | Loading spinner display |
| `error` | `string \| null` | Page-level fetch error |
| `updatingItems` | `Set<number>` | Items with in-flight quantity updates |
| `deleted` | `DeletedState \| null` | Tracks last removed item for undo |
| `editingQty` | `{ id: number; value: string; error: string } \| null` | Inline quantity edit state |

**Column layout**:

| Column | Content | Mobile visibility |
|--------|---------|-------------------|
| Name | Item name (truncated at 30ch) | Always visible |
| Category | Category text or `—` | Hidden on mobile (<640px) |
| Expires | Formatted date + expired Badge | Hidden on mobile (<640px) |
| Qty | `−` button · qty value/input · `+` button | Always visible |
| Actions | Remove button | Always visible |

---

### QuantityCell (new — extracted sub-component)

Encapsulates the `−` / qty display / `+` control group within a single `TableCell`.

**Props**:

| Prop | Type | Notes |
|------|------|-------|
| `item` | `InventoryItem` | The item being displayed |
| `isUpdating` | `boolean` | Disables controls during in-flight update |
| `editingQty` | `{ id: number; value: string; error: string } \| null` | Shared edit state |
| `onDecrement` | `() => void` | Triggers quantity − 1 |
| `onIncrement` | `() => void` | Triggers quantity + 1 |
| `onStartEdit` | `() => void` | Enters inline edit mode |
| `onCommitEdit` | `() => void` | Commits typed value |
| `onCancelEdit` | `() => void` | Discards edit |
| `onEditChange` | `(value: string) => void` | Updates edit input value |

**Validation rules** (unchanged from current logic):
- Decrement disabled when `quantity === 0`
- Invalid if typed value is non-integer or negative
- Confirmed with Enter; cancelled with Escape or blur

---

### StatusBadge (new — inline in InventoryTable)

A `Badge` component rendered inside the Expires column cell.

| Condition | Rendered output |
|-----------|----------------|
| `expirationDate` is null | Empty cell (`—`) |
| `expirationDate` is in the future | Date string only (no badge) |
| `expirationDate` is today or in the past | Date string + `<Badge variant="destructive">Expired</Badge>` |

---

### Row visual states

| Condition | CSS treatment |
|-----------|---------------|
| `quantity === 0` | Row gets `text-muted-foreground` (dimmed) |
| `isExpired` | Expiration cell has `text-destructive`; Badge shown |
| `isUpdating` | Quantity controls show `opacity-50`; buttons disabled |
| `deleteError` | Inline `text-destructive` message in row |

---

## Component Replacement Map

| Current component | Disposition | Replacement |
|-------------------|-------------|-------------|
| `InventoryList.tsx` | Replace | `InventoryTable.tsx` |
| `UndoToast.tsx` | Replace | Sonner `toast()` API |
| `AddItemForm.tsx` | Restyle | shadcn/ui `Input`, `Select`, `Label`, `Button` |
| `QuickAddForm.tsx` | Restyle | shadcn/ui `Input`, `Button` |
| `ComboBox.tsx` | Restyle | shadcn/ui `Input` + `Command`/`Popover` (or keep current logic styled with Tailwind) |
| `App.tsx` | Restyle | shadcn/ui `Button` for nav links; Tailwind layout classes |
| `App.css` | Remove | Replaced by Tailwind utility classes |
| `index.css` | Keep (minimal) | Base Tailwind directives + CSS variables for shadcn theming |
