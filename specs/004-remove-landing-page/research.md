# Research: Remove Landing Page

**Feature**: `004-remove-landing-page` | **Date**: 2026-04-21

## Finding 1 — React Router v6 Redirect Approach

**Decision**: Use `<Navigate to="/inventory" replace />` for the root route redirect.

**Rationale**: The `replace` prop replaces the history entry rather than pushing a new one, so the browser back button doesn't loop the user through `/` → `/inventory`. Rendering `<InventoryPage />` directly at `/` would leave the URL as `/`, which could confuse users and break bookmarks.

**Alternatives considered**:
- Render `<InventoryPage />` at `/`: Works but URL stays `/`, which doesn't match the page identity.
- `<Navigate to="/inventory" />` (without `replace`): Pushes a history entry — back button loops.

## Finding 2 — Unknown Route Handling

**Decision**: Add a catch-all route `<Route path="*" element={<Navigate to="/inventory" replace />} />` as the last route.

**Rationale**: React Router v6 renders the first matching route; the `*` wildcard matches anything not matched above. This satisfies FR-005 (unknown routes redirect to inventory list) without any additional library or custom component.

**Alternatives considered**:
- 404 page: Overkill for a single-user home app; unnecessary complexity.
- No catch-all: Unknown routes render nothing, which is a worse user experience.

## Finding 3 — Nav Bar Update

**Decision**: Remove the `<Link to="/">` brand link and replace with `<Link to="/inventory">`. Remove any Home nav link. Keep "Inventory" and "Add Item" links.

**Rationale**: The brand/logo should navigate to the app's primary page (inventory list). After removing the landing page, `/` redirects to `/inventory` anyway, but using `/inventory` directly as the brand href is semantically correct and avoids an extra redirect.

## Finding 4 — Test Coverage

**Decision**: Update `App.test.tsx` to verify that rendering at path `/` results in the inventory list being displayed. No new test file needed — the existing test file covers `App` routing.

**Rationale**: The only behavioral change is routing — the existing inventory list and add item page tests are unaffected. One new assertion (root renders inventory list) is sufficient to satisfy Constitution Principle II.
