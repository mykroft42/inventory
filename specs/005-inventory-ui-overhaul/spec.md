# Feature Specification: Inventory UI Overhaul

**Feature Branch**: `005-inventory-ui-overhaul`
**Created**: 2026-04-21
**Status**: Draft
**Input**: User description: "the inventory list feels very cluttered. each line item takes a lot of space and there could be 10s of items maybe as many as a hundred. i'd like to make this more organized and make the ui more consistent. i'd like to see a ui framework implemented and the inventory table organized in a way that continues to make increasing and decreasing the quantity of each item easy while displaying the items themselves in a more tabular format"

## Overview

The current inventory list presents each item as a large card, consuming significant vertical space and becoming difficult to navigate as the number of items grows. This feature replaces the card-based layout with a compact, table-style presentation and introduces a UI component framework to bring visual consistency across the entire application. Quantity adjustment controls remain inline and immediately accessible without navigating away from the list.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Scan and manage a long inventory list (Priority: P1)

A user with 50+ items opens their inventory and needs to quickly scan all items, spot which are low or expired, and adjust quantities without losing their place in the list.

**Why this priority**: This is the primary use case driving the request — the existing layout becomes unusable at scale.

**Independent Test**: Can be fully tested by populating the inventory with 50+ items and verifying that all items are visible without excessive scrolling, quantity controls are reachable per row, and the page remains responsive.

**Acceptance Scenarios**:

1. **Given** an inventory with 50 items, **When** the user opens the inventory page, **Then** all items are presented in a compact tabular format with each row occupying substantially less vertical space than the current card layout.
2. **Given** a tabular inventory, **When** the user clicks the increase (+) or decrease (−) button in a row, **Then** the quantity for that item updates immediately without leaving the page or losing scroll position.
3. **Given** a tabular inventory, **When** the user clicks the quantity value directly, **Then** an inline edit field appears allowing them to type a specific number and confirm with Enter or dismiss with Escape.

---

### User Story 2 - Visually consistent experience across pages (Priority: P2)

A user navigates between the inventory list and the add-item form and notices a unified look and feel — consistent typography, button styles, spacing, and interactive element behavior.

**Why this priority**: Framework adoption affects every surface; visual consistency is the second deliverable of this feature after density improvements.

**Independent Test**: Can be tested by visiting both the inventory page and the add-item page and verifying that typography, buttons, form inputs, and spacing follow the same visual system.

**Acceptance Scenarios**:

1. **Given** the UI framework is applied, **When** the user views any page, **Then** buttons, inputs, and typography use the same styles and spacing system across all pages.
2. **Given** the framework is applied, **When** the user interacts with buttons or form controls, **Then** hover, focus, and active states are consistent and visually clear on all interactive elements.

---

### User Story 3 - Identify item status at a glance (Priority: P3)

A user scanning a long inventory list wants to immediately see which items are expired or at zero quantity without reading each row carefully.

**Why this priority**: Compact layout reduces the visual footprint but must not hide important status signals already present in the current design.

**Independent Test**: Can be tested by adding items with past expiration dates and zero quantities and verifying that each is visually distinguishable within the table without opening a detail view.

**Acceptance Scenarios**:

1. **Given** an item with a past expiration date, **When** the user views the inventory table, **Then** the row or expiration cell is visually marked as expired (e.g., a badge, icon, or distinct color) that is distinguishable at a glance.
2. **Given** an item with quantity zero, **When** the user views the inventory table, **Then** the row is visually differentiated (e.g., muted or highlighted) to draw attention.

---

### Edge Cases

- What happens when the inventory is empty? The empty state message must still display correctly within the new layout.
- What happens when an item has no category or no expiration date? Columns for absent data must render gracefully (blank cell, not broken layout).
- What happens when a quantity update fails? The row must display an inline error and revert to the previous value without disrupting other rows.
- What happens when the item name is very long? The table must truncate or wrap text without breaking the row layout.
- What happens when a delete is triggered and then undone via toast? The restored item must re-appear in the table in a consistent position.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The inventory page MUST display items in a table layout where each item occupies a single row with columns for name, category, expiration date, quantity controls, and remove action.
- **FR-002**: Each row MUST include inline quantity controls (increase button, decrease button, and a directly editable quantity value) without requiring navigation to a separate page.
- **FR-003**: The decrease button MUST be disabled when the item quantity is already zero, preventing negative values.
- **FR-004**: The application MUST adopt a UI component framework applied consistently across all existing pages (inventory list, add-item form, navigation header).
- **FR-005**: Expired items MUST be visually indicated within the table row (e.g., a badge or color signal on the expiration date cell).
- **FR-006**: Items with zero quantity MUST be visually differentiated within the table (e.g., muted row styling).
- **FR-007**: The table MUST handle 100 or more items without layout degradation, horizontal scrolling on standard desktop and tablet viewports, or significant rendering slowdown.
- **FR-008**: All interactive controls (quantity buttons, remove button, inline quantity editor) MUST remain keyboard-accessible and carry appropriate accessible labels.
- **FR-009**: When a quantity update or delete operation fails, the row MUST display an inline error message and the item state MUST revert to its pre-action value.
- **FR-010**: The undo toast notification for removed items MUST remain functional and visually consistent with the new framework styles.
- **FR-011**: Column headers MUST be present in the table to label each data column.

### Key Entities

- **Inventory Item**: Represents a tracked household item with name, category (optional), expiration date (optional), and quantity (non-negative integer). Items are displayed as rows.
- **Quantity Control**: An inline control group per row consisting of a decrement button, an editable quantity display, and an increment button.
- **Row Status**: A visual state applied to a row or cell reflecting item condition — expired (expiration date in the past) or out-of-stock (quantity zero).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user with 50 items can scan the entire inventory in a single viewport on a standard 1080p desktop display without scrolling, or with minimal scrolling (no more than 2 screen heights for 100 items). Table rows target 32–36px height in the compact display mode.
- **SC-002**: Adjusting a quantity (increment, decrement, or direct edit) completes and is reflected in the UI within 1 second under normal network conditions.
- **SC-003**: All pages of the application share the same visual design language — no page should use styles or component patterns inconsistent with the applied framework.
- **SC-004**: Zero regressions in existing functionality: add-item, remove-item, undo-remove, inline quantity editing, and error states all continue to work correctly after the UI changes.
- **SC-005**: Expired and zero-quantity items are identifiable by visual inspection alone without reading numeric or date values.

## Clarifications

### Session 2026-04-21

- Q: Which UI component framework should be adopted? → A: shadcn/ui with Tailwind CSS — composable, accessible primitives with full control over component code.
- Q: What row density should the inventory table use? → A: Compact rows (32–36px height) — maximizes items visible per screen, standard for data tables.

## Assumptions

- The existing React + TypeScript frontend stack is retained; shadcn/ui and Tailwind CSS will be introduced as the UI framework and styling layer.
- shadcn/ui components are copied into the codebase directly (no runtime library lock-in); Tailwind CSS is the styling mechanism.
- The framework will be applied to all currently implemented pages (inventory list, add-item form, navigation header) but not to any future pages not yet in scope.
- The tabular layout targets desktop and tablet viewports (≥768px wide) as the primary experience; mobile layout behavior will follow naturally from the framework's responsive defaults.
- Sorting and filtering of inventory rows are out of scope for this feature; the table displays items in their current retrieval order.
- Pagination is out of scope; all items are rendered in a single table (virtual scrolling may be a future enhancement if performance dictates).
- The backend API contract is unchanged; only frontend presentation is affected.
- Accessibility standards target keyboard navigation and screen-reader compatibility consistent with the current implementation's existing ARIA labels.
