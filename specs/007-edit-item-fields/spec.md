# Feature Specification: Edit Item Fields on Detail Page

**Feature Branch**: `007-edit-item-fields`
**Created**: 2026-04-25
**Status**: Draft
**Input**: User description: "add the ability to edit the category and expiration date of the item on the item detail page"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Edit Item Category (Priority: P1)

A user viewing an item's detail page can change the item's category using an always-visible dropdown and save the change without leaving the page.

**Why this priority**: Category is the primary organizational dimension for inventory items. Enabling quick correction or reassignment on the detail page reduces friction for users who categorize items incorrectly at creation time.

**Independent Test**: Can be fully tested by opening any item detail page, selecting a different category in the dropdown, clicking Save, and verifying the new category persists after page reload.

**Acceptance Scenarios**:

1. **Given** an item detail page is open, **When** the user views the category row, **Then** a dropdown is always visible showing the current category (or a blank/unset state) with options: Groceries, Medications, Consumables, and an unset option.
2. **Given** the user selects a new category and clicks Save, **When** the save completes successfully, **Then** the detail page displays the updated category immediately without a full page reload.
3. **Given** the user attempts to save and the operation fails, **When** the error is received, **Then** an error message is displayed and the dropdown reverts to its previous value.
4. **Given** an item has an existing category, **When** the user selects the unset option and clicks Save, **Then** the category is cleared and the dropdown shows the unset state.

---

### User Story 2 — Edit Expiration Date (Priority: P2)

A user viewing an item's detail page can set, change, or clear the item's expiration date using an always-visible date picker and save the change without leaving the page.

**Why this priority**: Expiration dates directly drive the sort order and expiry indicator on the inventory table. Enabling correction on the detail page is the natural companion to the read-only display added in the previous feature.

**Independent Test**: Can be fully tested by opening an item detail page, changing the date picker value, clicking Save, and verifying the updated date persists and the item's sort position on the inventory page updates accordingly.

**Acceptance Scenarios**:

1. **Given** an item detail page is open, **When** the user views the expiration date row, **Then** a date picker is always visible showing the current date (or empty if unset).
2. **Given** the user picks a new date and clicks Save, **When** the save completes successfully, **Then** the detail page displays the updated expiration date immediately.
3. **Given** the user clears the date picker and clicks Save, **When** the save completes successfully, **Then** the expiration date is displayed as unset.
4. **Given** the user saves an updated expiration date that is now in the past, **When** they return to the inventory list, **Then** the item appears in the expired tier with its warning indicator.
5. **Given** the user attempts to save and the operation fails, **When** the error is received, **Then** an error message is displayed and the date picker reverts to its previous value.

---

### Edge Cases

- What happens if the user makes no changes and clicks Save? The save proceeds (idempotent); no error is shown.
- What happens if the save fails mid-flight (network error)? Both fields revert to their last-saved values and an error message is shown; the user can retry.
- What happens if the user navigates away without saving? Changes are discarded with no warning — the always-visible controls reset to last-saved values on next page load.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The item detail page MUST display a category selector as a persistent, always-visible control (not hidden behind a toggle or edit mode).
- **FR-002**: Category choices MUST be limited to the fixed set: Groceries, Medications, Consumables, or unset (no category). No free-text entry is permitted.
- **FR-003**: The item detail page MUST display an expiration date picker as a persistent, always-visible control.
- **FR-004**: The date picker MUST allow the user to clear an existing expiration date, resulting in the item having no expiration date.
- **FR-005**: A Save button MUST be present and MUST persist all editable field changes to the server when clicked.
- **FR-006**: After a successful save, the detail page MUST reflect the updated values without requiring a full page reload or navigation away.
- **FR-007**: If a save operation fails, the user MUST see an actionable error message and both fields MUST revert to their last successfully saved values.
- **FR-008**: Item name and quantity MUST remain read-only on the detail page; only category and expiration date are editable via this feature.

### Key Entities

- **InventoryItem**: Existing entity. `category` (optional enum: Groceries, Medications, Consumables) and `expirationDate` (optional date string) become user-editable fields on the detail page.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can update an item's category in 3 or fewer interactions from the detail page (select dropdown value → click Save).
- **SC-002**: A user can update or clear an item's expiration date in 3 or fewer interactions from the detail page (pick/clear date → click Save).
- **SC-003**: Saved changes are visible on the detail page immediately after clicking Save, without navigating away and back.
- **SC-004**: A failed save always produces a visible error message and always leaves both field values in their last-saved state — no partial or silent data loss.
- **SC-005**: After saving an expiration date change, the item's position in the inventory sort order reflects the new date on the next inventory page load.

## Assumptions

- Only category and expiration date are editable on this page; name and quantity remain read-only.
- Category is a fixed enumeration (Groceries, Medications, Consumables); no new categories can be created via this feature.
- No confirmation step is required before saving edits (edits are non-destructive; only Remove requires confirmation).
- No navigation guard is needed for unsaved changes — the always-visible controls reset to last-saved state on next page load.
- The existing `update` API endpoint supports category and expiration date updates; the API client already wraps it as a full-object PUT.
- Single-user household app — no concurrency concerns for simultaneous edits.

## Clarifications

### Session 2026-04-25

- Q: What is the edit UX pattern for category and expiration date? → A: Always-visible controls — category dropdown and date picker are always rendered on the detail page; save happens via a persistent Save button.
