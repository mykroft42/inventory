# Implementation Plan: Remove Landing Page

**Branch**: `004-remove-landing-page` | **Date**: 2026-04-21 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/004-remove-landing-page/spec.md`

## Summary

Remove the `Home` landing/splash component and simplify routing so the app has exactly two pages: the inventory list (default at `/`) and the add item page. The root route redirects to `/inventory`; unknown routes also redirect to `/inventory`. The navigation bar is trimmed to two links.

## Technical Context

**Language/Version**: TypeScript / React 19 (frontend only — no backend changes)
**Primary Dependencies**: react-router-dom v6 (already installed)
**Storage**: N/A — no data model changes
**Testing**: Jest + React Testing Library
**Target Platform**: Local web app; desktop + mobile browsers
**Project Type**: Web application (React SPA — existing Option 2 layout)
**Performance Goals**: No change from baseline
**Constraints**: Zero test regressions; no backend changes required
**Scale/Scope**: One source file changed (`App.tsx`), one test file updated (`App.test.tsx`)

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Specification-First | ✅ Pass | spec.md complete before any implementation |
| II. TDD & Coverage | ✅ Pass (waiver) | Jest + RTL unit tests cover all routing assertions via `MemoryRouter`. **E2e waiver**: Playwright/Cypress e2e tests are omitted — this feature is a pure routing change with no backend interaction, no external HTTP calls, and no browser API surface that `MemoryRouter` cannot faithfully simulate. The incremental blast radius is 2 files; all acceptance scenarios are verifiable at the unit level. An e2e suite would add toolchain overhead disproportionate to the risk. This waiver is scoped to this feature only. |
| III. Data Integrity & Auditability | ✅ Pass | No data mutations |
| IV. Clean Code | ✅ Pass | Removing dead `Home` component reduces complexity |
| V. Incremental Delivery | ✅ Pass | Single atomic story; trivially deployable |
| VI. Mobile-First Frontend | ✅ Pass | Nav bar already mobile-first; no layout changes |

## Project Structure

### Documentation (this feature)

```text
specs/004-remove-landing-page/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

Note: `data-model.md` and `contracts/` are not generated — this feature has no data model or API contract changes.

### Source Code Changes

```text
frontend/src/
└── App.tsx              # Remove Home component; update Routes and nav bar
└── App.test.tsx         # Update routing tests; add root redirect test
```

**Total files changed**: 2
**Structure Decision**: Web application (existing Option 2 layout). Changes are minimal and entirely contained within the frontend routing layer.

## Detailed Change Specifications

### Change 1 — Remove `Home` Component

**File**: `frontend/src/App.tsx`

Delete the entire `Home` function component (lines 7–20 in current file):

```typescript
// DELETE THIS ENTIRE BLOCK:
function Home() {
  return (
    <main className="container">
      <section className="page-header">
        <h1>Household Inventory</h1>
        <p>Manage your groceries, medications, and consumables in one place.</p>
        <nav className="page-nav" aria-label="Primary actions">
          <Link to="/inventory" className="btn">View Inventory</Link>
          <Link to="/add-item" className="btn btn-secondary">Add Item</Link>
        </nav>
      </section>
    </main>
  );
}
```

### Change 2 — Update Routes

**File**: `frontend/src/App.tsx`

Add `Navigate` to the react-router-dom import. Replace the `<Routes>` block:

```typescript
// BEFORE:
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
// ...
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/inventory" element={<InventoryPage />} />
  <Route path="/add-item" element={<AddItemPage />} />
</Routes>

// AFTER:
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
// ...
<Routes>
  <Route path="/" element={<Navigate to="/inventory" replace />} />
  <Route path="/inventory" element={<InventoryPage />} />
  <Route path="/add-item" element={<AddItemPage />} />
  <Route path="*" element={<Navigate to="/inventory" replace />} />
</Routes>
```

**Why `replace`**: Prevents the browser back button from looping through the redirect. History entry is replaced rather than pushed.

### Change 3 — Update Navigation Bar

**File**: `frontend/src/App.tsx`

Remove the brand `<Link to="/">` and replace with `<Link to="/inventory">`. The nav should contain exactly two destination links:

```typescript
// BEFORE:
<nav className="topbar-nav">
  <Link to="/" className="brand">Inventory</Link>
  <Link to="/inventory" className="topbar-link">Inventory</Link>
  <Link to="/add-item" className="topbar-link">Add Item</Link>
</nav>

// AFTER:
<nav className="topbar-nav">
  <Link to="/inventory" className="brand">Inventory</Link>
  <Link to="/inventory" className="topbar-link">Inventory</Link>
  <Link to="/add-item" className="topbar-link">Add Item</Link>
</nav>
```

### Change 4 — Update Tests

**File**: `frontend/src/App.test.tsx`

Update or add a test that verifies navigating to `/` renders the inventory list (not the old `Home` page). The test should use `MemoryRouter` with `initialEntries={['/']}` and verify the inventory list is rendered after the redirect.
