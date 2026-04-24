# Feature Specification: Inventory Sort Order & Item Detail View

**Feature Branch**: `006-sort-detail-view`
**Created**: 2026-04-23
**Status**: Draft
**Input**: User description: "make the default sort be alphabetical with 0 quantity items forced to the bottom. additionally move the remove button and the date columns to a detail page available by clicking a linked backed into the name of the item. add a checkmark next to items that are expired if that field is filled in and out of date"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Smart Sort Order (Priority: P1)

When a user views the inventory, items are sorted alphabetically by name so they can quickly scan the list. Items with zero quantity are pushed to the bottom of the list, regardless of their name, so in-stock items are always immediately visible without scrolling past empty slots.

**Why this priority**: The sorted view is the first thing every user sees on every visit. Surfacing available stock before empty items directly reduces scanning effort and is a self-contained improvement with no dependencies.

**Independent Test**: Can be fully tested by loading the inventory page and verifying the item order — no navigation required.

**Acceptance Scenarios**:

1. **Given** the inventory contains items with different names and positive quantities, **When** the page loads, **Then** items are displayed in ascending alphabetical order by name.
2. **Given** the inventory contains items with quantity > 0 and items with quantity = 0, **When** the page loads, **Then** all zero-quantity items appear below all positive-quantity items, and each group is itself sorted alphabetically.
3. **Given** two items both have quantity 0, **When** the page loads, **Then** they are sorted alphabetically within the zero-quantity group.
4. **Given** a user increments an item's quantity from 0 to 1, **When** the update completes, **Then** the item moves up out of the zero-quantity section to its correct alphabetical position among stocked items.

---

### User Story 2 — Item Detail Page (Priority: P2)

A user can click the item name in the inventory table, which acts as a navigation link, and be taken to a dedicated detail page for that item. The detail page shows all item fields including the expiration date and contains the Remove button. The main inventory table is decluttered by removing the Remove button and the expiration date column.

**Why this priority**: Decluttering the main table improves scannability for users with large inventories. Moving destructive actions (Remove) behind a deliberate click to a detail page reduces accidental deletions.

**Independent Test**: Can be fully tested by clicking one item's name link, verifying the detail page shows all fields and the Remove button, then confirming the main table no longer has those elements.

**Acceptance Scenarios**:

1. **Given** the user is on the inventory page, **When** they view any table row, **Then** the item name is rendered as a clickable link.
2. **Given** the user clicks an item name link, **When** the detail page loads, **Then** it displays the item's name, quantity, category, and expiration date.
3. **Given** the user is on the item detail page, **When** they click Remove, **Then** the item is deleted and they are returned to the inventory list (with an undo option).
4. **Given** the user is on the item detail page, **When** they click a Back/Cancel control, **Then** they are returned to the inventory list with no changes.
5. **Given** the inventory table is rendered, **When** the user views it, **Then** neither a Remove button nor an expiration date column appears in the table rows.

---

### User Story 3 — Expiry Status Indicator (Priority: P3)

When an item has an expiration date that has passed, a visual checkmark or indicator is shown next to the item name in the inventory table (in addition to any existing Expired badge on the detail page), making it immediately obvious which items need attention.

**Why this priority**: Expiry visibility is a useful at-a-glance signal, but it is an enhancement to existing expired-badge behavior and delivers less value than sort order or the detail page.

**Independent Test**: Can be tested by adding an item with a past expiration date and verifying the checkmark indicator appears next to its name in the table.

**Acceptance Scenarios**:

1. **Given** an item has an expiration date that is today or earlier, **When** the user views the inventory table, **Then** a checkmark indicator appears adjacent to the item name.
2. **Given** an item has an expiration date in the future, **When** the user views the inventory table, **Then** no checkmark indicator appears next to its name.
3. **Given** an item has no expiration date set, **When** the user views the inventory table, **Then** no checkmark indicator appears next to its name.

---

### Edge Cases

- What happens when two items share the same name (case-insensitive)? Alphabetical tie-breaking falls back to insertion order.
- What happens if a user navigates directly to an item detail URL for an item that has been deleted or does not exist? A not-found message is shown with a link back to the inventory.
- What happens when an item's quantity is decremented to zero via the inline +/− control on the inventory table? The row moves to the bottom of the list immediately after the update.
- What happens when a user removes an item from the detail page and then clicks Undo? The item is restored and the user can navigate back to it.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The inventory table MUST display items sorted in ascending alphabetical order by item name by default.
- **FR-002**: Items with a quantity of zero MUST appear below all items with a quantity greater than zero; each group (stocked, zero) MUST be independently sorted alphabetically.
- **FR-003**: When a quantity update causes an item to transition between the stocked and zero-quantity groups, the sort order MUST update without requiring a full page reload.
- **FR-004**: Each item name in the inventory table MUST be rendered as a navigation link that opens the item's detail page.
- **FR-005**: The item detail page MUST display all item fields: name, quantity, category, and expiration date (shown as "—" when not set).
- **FR-006**: The item detail page MUST contain the Remove action for that item.
- **FR-007**: After a successful removal from the detail page, the user MUST be returned to the inventory list and an undo option MUST be offered.
- **FR-008**: The item detail page MUST provide a way to return to the inventory list without making changes.
- **FR-009**: The inventory table MUST NOT display a Remove button column.
- **FR-010**: The inventory table MUST NOT display an expiration date column.
- **FR-011**: When an item has an expiration date that is on or before the current date, a checkmark indicator MUST appear adjacent to the item name in the inventory table.
- **FR-012**: The checkmark indicator MUST NOT appear for items whose expiration date is in the future or whose expiration date is not set.

### Key Entities

- **InventoryItem**: Existing entity — name, quantity, category (optional), expiration date (optional). No schema changes required.
- **Item Detail Page**: New route/view displaying a single item and its Remove action.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can identify the first in-stock item alphabetically without scrolling past any zero-quantity rows.
- **SC-002**: The inventory table row height and column count are reduced by removing the Remove button and expiration date column, increasing the number of items visible in a standard viewport without scrolling.
- **SC-003**: Users can reach an item's detail page and return to the inventory list in two clicks or fewer.
- **SC-004**: 100% of items with a past or present expiration date display the checkmark indicator; 0% of items without a past expiration date display it.
- **SC-005**: Accidental item removal from the inventory table is eliminated (Remove action is only available on the detail page, behind a deliberate navigation step).

## Assumptions

- The existing inline quantity +/− controls remain on the inventory table; only Remove and expiration date move to the detail page.
- Editing item fields (name, category, expiration date) on the detail page is out of scope for this feature — the detail page is read-only except for the Remove action.
- The expiration checkmark indicator is distinct from (and in addition to) any existing Expired badge; its exact visual form (icon, color) is an implementation choice.
- Sort order is client-side (data already fetched); no backend sort parameter is required.
- The application already has client-side routing in place; adding a new detail route follows the existing pattern.
- Single-user household app — no concurrency or multi-user conflict concerns.
