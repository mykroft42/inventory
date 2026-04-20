# Feature Specification: Streamlined Inventory Add/Remove

**Feature Branch**: `002-streamlined-add-remove`
**Created**: 2026-04-20
**Status**: Draft
**Input**: User description: "when adding an item into the inventory i would like there to be a very streamlined interface. ideally the only required fields would be item name and quantity being added. further the item name should be a dropdown text box so that as i type it filters down to the existing option until either it's the item i want or it's a new item that needs to be added. adding items and removing items from the inventory needs to be the simplest fewest click solutions possible"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add Item with Autocomplete (Priority: P1)

A user wants to add an item to the inventory as fast as possible. They type a name into a combo-box input that filters down existing item names as they type. If the item already exists they select it from the list; if it's new they continue typing and submit it as a new item. Only the item name and quantity to add are required — all other fields are optional and can be filled in later. Submitting the form adds the quantity to the inventory in one action.

**Why this priority**: This is the core daily-use workflow. Every other capability depends on items being in the inventory. A frictionless add experience directly reduces the chance users abandon the app.

**Independent Test**: Open the add interface, type a partial name, see filtered suggestions, select one or type a new name, enter a quantity, submit — the item appears in the inventory list with the correct quantity.

**Acceptance Scenarios**:

1. **Given** the add interface is open, **When** the user types 3 characters of an existing item name, **Then** a dropdown shows all matching existing items filtered to those characters.
2. **Given** matching suggestions are shown, **When** the user selects one and enters a quantity of 3, **Then** submitting increments that item's inventory quantity by 3.
3. **Given** the user types a name that matches no existing item and enters a quantity, **When** they submit, **Then** a new inventory item is created with the entered name and quantity.
4. **Given** the add interface is open, **When** the user submits without entering a name or quantity, **Then** the form highlights the missing required fields without navigating away.
5. **Given** the user has submitted successfully, **When** the form resets, **Then** the name field is cleared and focused so the user can immediately add another item.

---

### User Story 2 - Remove Item in Fewest Clicks (Priority: P2)

A user wants to remove an item from the inventory list without navigating to a separate page or confirming through multiple dialogs. A single clearly-labeled action on each inventory row removes the item immediately, with a brief undo opportunity in case of accidental deletion.

**Why this priority**: Removal is the second most frequent mutation. Every extra click or modal confirmation adds friction and reduces trust in the tool.

**Independent Test**: On the inventory list, click the remove action on a row — the item disappears from the list. An undo notification appears briefly.

**Acceptance Scenarios**:

1. **Given** the inventory list is visible, **When** the user activates the remove action on an item row, **Then** the item is removed from the list immediately without a confirmation dialog.
2. **Given** an item was just removed, **When** the undo notification is visible (within 5 seconds), **Then** clicking undo restores the item to its previous state.
3. **Given** the undo window has expired, **When** the user checks the inventory, **Then** the removed item is permanently gone.
4. **Given** a keyboard user navigates to an item row, **When** they activate the remove action via keyboard, **Then** the item is removed and focus moves to the next item in the list.

---

### User Story 3 - Inline Quantity Adjustment (Priority: P3)

A user wants to quickly increase or decrease the quantity of an existing item directly on the inventory list without opening a separate form. The current + / − controls on each row remain, but quantity can also be directly edited by tapping/clicking the quantity value and typing a new number.

**Why this priority**: Directly editing quantity on the list avoids opening the add form for simple restock or consumption events. This complements Story 1 rather than replacing it.

**Independent Test**: On the inventory list, click a quantity value, type a new number, confirm — the inventory updates immediately.

**Acceptance Scenarios**:

1. **Given** an item row is visible, **When** the user clicks the displayed quantity, **Then** it becomes an editable input pre-filled with the current value.
2. **Given** the quantity input is active, **When** the user types a valid non-negative number and confirms (Enter or blur), **Then** the item's quantity updates immediately.
3. **Given** the quantity input is active, **When** the user types an invalid value (negative, non-numeric), **Then** the input shows an inline error and does not save.

---

### Edge Cases

- What happens when two users add the same item simultaneously (future multi-user scenario)? Assume last-write-wins for now; document as assumption.
- What if the user types a name that is a case-insensitive duplicate of an existing item (e.g., "milk" vs "Milk")? The autocomplete should match case-insensitively and suggest the existing item.
- What if the quantity to add would result in a very large number (overflow)? The system should cap at a reasonable maximum (e.g., 9,999) and show a friendly message.
- What if the inventory list is empty and the user tries to remove an item? Not possible — remove action only exists on existing items.
- What if the user clears the name field after selecting an autocomplete suggestion? The selection is cleared and typing resumes filtering mode.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The add-item interface MUST require only item name and quantity; all other fields (category, expiration date) MUST be optional and accessible via a collapsed "More options" expander on the same form — hidden by default, expandable on demand.
- **FR-002**: The item name input MUST be a combo-box (type-to-filter) that surfaces matching existing item names as the user types, starting from the first character. Suggestions MUST include all known items regardless of current quantity (including items at quantity 0).
- **FR-003**: Autocomplete matching MUST be case-insensitive and filter by substring (not prefix-only).
- **FR-004**: When the submitted item name matches an existing item name (case-insensitive, exact full-string match) — whether via explicit dropdown selection or by typing — the system MUST add the entered quantity to that item's existing quantity (increment, not replace).
- **FR-005**: When the submitted item name does not match any existing item name (case-insensitive), the system MUST create a new inventory item with the entered name and quantity.
- **FR-006**: After a successful add, the form MUST reset and return focus to the name input so the user can immediately add another item.
- **FR-007**: Each item row in the inventory list MUST expose a single-action remove control (e.g., a delete button) that removes the item without a confirmation dialog.
- **FR-008**: After a removal, the system MUST display a brief undo notification (minimum 5 seconds) that allows the user to reverse the deletion. If the server-side delete fails, the item MUST reappear in the list immediately with an inline error message; the undo notification is dismissed.
- **FR-009**: Quantity adjustment via the existing +/− controls MUST remain available on each inventory row.
- **FR-010**: The system MUST validate that quantity is a non-negative integer before submitting; it MUST display an inline error for invalid values without losing the user's other input.
- **FR-011**: The existing add item page MUST be replaced by the new streamlined form; no additional navigation entry points are introduced.

### Key Entities

- **Inventory Item**: Represents a tracked household item; has a name, quantity, category (optional), and expiration date (optional). Adding an existing item increments its quantity; adding a new item creates a new record.
- **Autocomplete Suggestion**: A transient view of existing item names filtered by the user's current input string; not persisted.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can add an item to the inventory (existing or new) in 3 or fewer interactions (type name, type quantity, submit).
- **SC-002**: A user can remove an item from the inventory list in 1 interaction (single click/tap on the remove control).
- **SC-003**: The autocomplete suggestion list appears within 300ms of the user typing the first character.
- **SC-004**: 90% of add-item attempts by returning users (who have existing items) result in an autocomplete match being selected rather than a full manual entry, reducing typing effort.

## Clarifications

### Session 2026-04-20

- Q: Should typing an exact name match (without selecting from dropdown) map to the existing item or create a new one? → A: Exact case-insensitive full-string match always maps to the existing item and increments its quantity, regardless of whether the dropdown suggestion was explicitly selected.
- Q: How should optional fields (category, expiration date) be accessible on the add form? → A: Collapsed "More options" expander on the same form — hidden by default, expandable on demand.
- Q: Where should the streamlined add form live? → A: Replace the existing add item page with the new streamlined form; no new navigation entry points.
- Q: Should autocomplete suggestions include only in-stock items or all items ever created? → A: All items, including those at quantity 0. Future feature will add ability to permanently prune/hide items from suggestions.
- Q: What should happen if the server-side delete fails after the item was optimistically removed from the UI? → A: Item reappears in the list immediately with an inline error message ("Failed to remove — please try again").

## Assumptions

- The single-user model from feature 001 is retained; no concurrent-edit conflict resolution is required beyond last-write-wins.
- "Removing" an item means permanently deleting it from the inventory (with undo grace period), not soft-deleting or archiving.
- The optional fields (category, expiration date) are preserved in the data model and still editable via a secondary "details" flow; this feature only removes them from the critical add path.
- Category defaults to the last-used category for that item name when auto-selected via autocomplete, or remains unset for new items.
- The undo window is 5 seconds; after that the deletion is permanent.
- Keyboard and screen-reader accessibility standards (WCAG 2.1 AA) apply to all new controls, consistent with the existing app.
- Pruning/hiding items from autocomplete suggestions is out of scope for this feature and will be addressed in a future specification.
