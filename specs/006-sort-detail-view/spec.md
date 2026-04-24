# Feature Specification: Inventory Sort Order & Item Detail View

**Feature Branch**: `006-sort-detail-view`
**Created**: 2026-04-23
**Status**: Draft
**Input**: User description: "make the default sort be alphabetical with 0 quantity items forced to the bottom. additionally move the remove button and the date columns to a detail page available by clicking a linked backed into the name of the item. add a checkmark next to items that are expired if that field is filled in and out of date"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Smart Sort Order (Priority: P1)

When a user views the inventory, items are sorted into three tiers, each sorted alphabetically by name: expired items with quantity > 0 appear first (most urgent), followed by non-expired stocked items, followed by items with quantity = 0 at the bottom.

**Why this priority**: The sorted view is the first thing every user sees on every visit. Surfacing available stock before empty items directly reduces scanning effort and is a self-contained improvement with no dependencies.

**Independent Test**: Can be fully tested by loading the inventory page and verifying the item order — no navigation required.

**Acceptance Scenarios**:

1. **Given** the inventory contains items with different names and positive quantities, none expired, **When** the page loads, **Then** items are displayed in ascending alphabetical order by name.
2. **Given** the inventory contains expired items (qty > 0), non-expired stocked items (qty > 0), and zero-quantity items, **When** the page loads, **Then** expired items appear first, non-expired stocked items appear second, and zero-quantity items appear last; each tier is sorted alphabetically.
3. **Given** two items both have quantity 0, **When** the page loads, **Then** they are sorted alphabetically within the zero-quantity tier.
4. **Given** a user increments an item's quantity from 0 to 1, **When** the update completes, **Then** the item moves up to its correct alphabetical position in either the expired or non-expired stocked tier depending on its expiration date.
5. **Given** an inventory with expired and non-expired stocked items, **When** the page loads, **Then** all expired stocked items appear above all non-expired stocked items.

---

### User Story 2 — Item Detail Page (Priority: P2)

A user can click the item name in the inventory table, which acts as a navigation link, and be taken to a dedicated detail page for that item. The detail page shows all item fields including the expiration date and contains the Remove button. The main inventory table is decluttered by removing the Remove button and the expiration date column.

**Why this priority**: Decluttering the main table improves scannability for users with large inventories. Moving destructive actions (Remove) behind a deliberate click to a detail page reduces accidental deletions.

**Independent Test**: Can be fully tested by clicking one item's name link, verifying the detail page shows all fields and the Remove button, then confirming the main table no longer has those elements.

**Acceptance Scenarios**:

1. **Given** the user is on the inventory page, **When** they view any table row, **Then** the item name is rendered as a clickable link.
2. **Given** the user clicks an item name link, **When** the detail page loads, **Then** it displays the item's name, quantity, category, and expiration date.
3. **Given** the user is on the item detail page, **When** they click Remove, **Then** a confirmation dialog is shown before any deletion occurs.
4. **Given** the confirmation dialog is shown, **When** the user confirms, **Then** the item is deleted and they are returned to the inventory list.
5. **Given** the confirmation dialog is shown, **When** the user cancels, **Then** no action is taken and they remain on the detail page.
6. **Given** the user is on the item detail page, **When** they click a Back/Cancel control, **Then** they are returned to the inventory list with no changes.
5. **Given** the inventory table is rendered, **When** the user views it, **Then** neither a Remove button nor an expiration date column appears in the table rows.

---

### User Story 3 — Expiry Status Indicator (Priority: P3)

When an item has an expiration date that has passed, a warning indicator is shown next to the item name in the inventory table (in addition to any existing Expired badge on the detail page), making it immediately obvious which items need attention.

**Why this priority**: Expiry visibility is a useful at-a-glance signal, but it is an enhancement to existing expired-badge behavior and delivers less value than sort order or the detail page.

**Independent Test**: Can be tested by adding an item with a past expiration date and verifying the warning indicator appears next to its name in the table.

**Acceptance Scenarios**:

1. **Given** an item has an expiration date that is today or earlier, **When** the user views the inventory table, **Then** a warning indicator appears adjacent to the item name.
2. **Given** an item has an expiration date in the future, **When** the user views the inventory table, **Then** no warning indicator appears next to its name.
3. **Given** an item has no expiration date set, **When** the user views the inventory table, **Then** no warning indicator appears next to its name.

---

### Edge Cases

- What happens when two items share the same name (case-insensitive)? Alphabetical tie-breaking falls back to insertion order.
- What happens if a user navigates directly to an item detail URL for an item that has been deleted or does not exist? A not-found message is shown with a link back to the inventory.
- What happens when an item's quantity is decremented to zero via the inline +/− control on the inventory table? The row moves to the bottom of the list immediately after the update.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The inventory table MUST always display items in three tiers sorted alphabetically within each tier; no user sort override is provided. Tier order: (1) expired items with qty > 0, (2) non-expired items with qty > 0, (3) items with qty = 0.
- **FR-002**: Each tier MUST be independently sorted in ascending alphabetical order by item name. An item is considered expired when its expiration date is on or before the current date.
- **FR-003**: When a quantity update causes an item to transition between tiers, the sort order MUST update without requiring a full page reload.
- **FR-004**: Each item name in the inventory table MUST be rendered as a navigation link that opens the item's detail page.
- **FR-005**: The item detail page MUST display all item fields: name, quantity, category, and expiration date (shown as "—" when not set).
- **FR-006**: The item detail page MUST contain the Remove action for that item.
- **FR-006a**: Clicking Remove MUST present a confirmation dialog before any deletion occurs; the item is only deleted if the user explicitly confirms.
- **FR-007**: After a confirmed removal, the user MUST be returned to the inventory list.
- **FR-008**: The item detail page MUST provide a way to return to the inventory list without making changes.
- **FR-009**: The inventory table MUST NOT display a Remove button column.
- **FR-010**: The inventory table MUST NOT display an expiration date column.
- **FR-011**: When an item has an expiration date that is on or before the current date, a warning indicator MUST appear adjacent to the item name in the inventory table.
- **FR-012**: The warning indicator MUST NOT appear for items whose expiration date is in the future or whose expiration date is not set.

### Key Entities

- **InventoryItem**: Existing entity — name, quantity, category (optional), expiration date (optional). No schema changes required.
- **Item Detail Page**: New route/view displaying a single item and its Remove action.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Expired stocked items requiring attention are immediately visible at the top of the list; non-expired stocked items follow; zero-quantity items are never interspersed.
- **SC-002**: The inventory table row height and column count are reduced by removing the Remove button and expiration date column, increasing the number of items visible in a standard viewport without scrolling.
- **SC-003**: Users can reach an item's detail page and return to the inventory list in two clicks or fewer.
- **SC-004**: 100% of items with a past or present expiration date display the warning indicator; 0% of items without a past expiration date display it.
- **SC-005**: Accidental item removal is prevented by two gates: navigation to the detail page and a confirmation dialog. No undo is provided.

## Assumptions

- The existing inline quantity +/− controls remain on the inventory table; only Remove and expiration date move to the detail page.
- Editing item fields (name, category, expiration date) on the detail page is out of scope for this feature — the detail page is read-only except for the Remove action.
- The expiration warning indicator is distinct from (and in addition to) any existing Expired badge; its exact visual form is an implementation choice (e.g., ⚠️ or similar warning-style icon).
- Sort order is client-side (data already fetched); no backend sort parameter is required.
- The application already has client-side routing in place; adding a new detail route follows the existing pattern.
- Single-user household app — no concurrency or multi-user conflict concerns.

## Clarifications

### Session 2026-04-23

- Q: Is undo after item removal already implemented, or should it be built, or removed from scope? → A: Out of scope — undo requirement removed from spec.
- Q: Should the expiry indicator be a literal checkmark (✓) or a warning/alert icon? → A: Warning/alert icon — more semantically appropriate for expired items.
- Q: Should Remove on the detail page require a confirmation step (given undo is removed)? → A: Yes — show a confirmation dialog before deletion.
- Q: Is alphabetical sort a fixed behavior or a user-overridable default? → A: Fixed — no column header sort override; always alphabetical with zero-qty at bottom.
- Q: Should expired items sort separately or just be visually flagged in place? → A: Three-tier sort — expired qty > 0 first, non-expired qty > 0 second, qty = 0 last; each tier alphabetical.
