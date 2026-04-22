# Feature Specification: Remove Landing Page — Two-Page Navigation

**Feature Branch**: `004-remove-landing-page`
**Created**: 2026-04-21
**Status**: Draft
**Input**: User description: "remove the landing page and change so that only the add page and the list page exist"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Direct Navigation to Inventory List (Priority: P1)

When a user opens the app or navigates to the root URL, they land directly on the inventory list — there is no intermediate landing/home page to click through.

**Why this priority**: The landing page adds a navigation step that serves no purpose when only two pages exist. Removing it immediately reduces friction for every user on every visit.

**Independent Test**: Open the app root URL (`/`) — the inventory list loads directly without any intermediate page.

**Acceptance Scenarios**:

1. **Given** the app is open, **When** the user visits `/`, **Then** the inventory list page is displayed immediately
2. **Given** the user is on any page, **When** they click the app brand/logo in the navigation bar, **Then** they are taken to the inventory list
3. **Given** the app is open, **When** the user navigates to an unknown route, **Then** they are redirected to the inventory list

---

### User Story 2 — Two-Page Navigation Bar (Priority: P1)

The navigation bar shows only two links — Inventory (list) and Add Item — with no link to a home/landing page.

**Why this priority**: The nav bar must reflect the simplified two-page structure immediately after the landing page is removed; an orphaned "Home" link would be confusing.

**Independent Test**: On any page, the top navigation bar shows exactly two destination links: Inventory and Add Item.

**Acceptance Scenarios**:

1. **Given** the user is on any page, **When** they look at the navigation bar, **Then** they see exactly two navigation links: "Inventory" and "Add Item"
2. **Given** the user is on the inventory list page, **When** they click "Add Item" in the nav bar, **Then** they are taken to the add item page
3. **Given** the user is on the add item page, **When** they click "Inventory" in the nav bar, **Then** they are taken to the inventory list

---

### Edge Cases

- What happens when a user navigates to `/` (previously the landing page)? → Redirects to the inventory list.
- What happens when a user bookmarked the landing page? → The bookmark now opens the inventory list.
- What happens when a user navigates to an unrecognised route? → Redirects to the inventory list.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST remove the landing/home page component entirely
- **FR-002**: The root route (`/`) MUST redirect to or render the inventory list page
- **FR-003**: The navigation bar MUST contain exactly two unique destination hrefs: `/inventory` (inventory list) and `/add-item` (add item page). A brand/logo link to `/inventory` is permitted in addition to the topbar link — it shares the same destination and does not count as a third unique destination.
- **FR-004**: The navigation bar brand/logo link MUST navigate to the inventory list (not a home page)
- **FR-005**: Unknown or unmatched routes MUST redirect to the inventory list
- **FR-006**: The add item page and inventory list page MUST remain fully functional after the change

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Visiting the app root URL loads the inventory list in one step — no intermediate page
- **SC-002**: The navigation bar contains exactly 2 unique destination hrefs (`/inventory` and `/add-item`) on every page
- **SC-003**: All existing inventory, add, update, and delete actions continue to work without regression
- **SC-004**: All automated tests pass after the change (zero regressions)

## Assumptions

- The landing page (`Home` component in `App.tsx`) exists solely for navigation and has no unique content that needs to be preserved
- The two remaining pages (inventory list and add item) are already complete and functional
- No external links or bookmarks targeting the landing page need to be redirected to a custom URL — `/` mapping to inventory list is sufficient
- Mobile and desktop layouts for the two remaining pages are unaffected by this change
