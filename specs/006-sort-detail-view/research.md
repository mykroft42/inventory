# Research: Inventory Sort Order & Item Detail View

**Branch**: `006-sort-detail-view` | **Date**: 2026-04-23

No unknowns requiring external research — the tech stack is fully understood and all tools are already in use in this project. This document records the key design decisions and the alternatives evaluated.

---

## Decision 1: Three-Tier Sort Mechanism

**Decision**: Client-side JavaScript `Array.sort` with a tier key function applied to the `items` state array in `InventoryTable.tsx` before rendering.

**Rationale**:
- Spec explicitly states sort order is client-side (items already fetched).
- A pure function `sortInventoryItems(items: InventoryItem[]): InventoryItem[]` is testable in isolation and fits in < 30 lines (Principle IV).
- "Expired" is determined by comparing `item.expirationDate` against `new Date()` at sort time, consistent with the existing `isExpired` calculation already in `InventoryTable.tsx`.

**Tier key** (lower = higher in list):
- Tier 0: `expirationDate != null && expirationDate <= today && quantity > 0`
- Tier 1: `quantity > 0` (not expired)
- Tier 2: `quantity === 0`

Within each tier: ascending alphabetical by `item.name` (locale-insensitive `localeCompare`).

**Alternatives considered**:
- Backend `ORDER BY` clause — rejected; spec says client-side, and adding a sort parameter to the API adds backend scope with no benefit.
- `useMemo` for sort — acceptable but adds complexity; since the sort is cheap (small dataset), a derived sort inline in the render loop is simpler and equally correct. Tasks will determine the exact approach.

---

## Decision 2: Item Detail Navigation

**Decision**: Add route `/inventory/:id` in `App.tsx`. Item name in `InventoryTable` rendered as `<Link to={/inventory/${item.id}}>` from React Router DOM v7.

**Rationale**:
- React Router DOM v7 is already the routing library; adding a parametric route follows the identical pattern to the existing `/add-item` route.
- Using `<Link>` (not `<button onClick>`) gives correct semantics (navigable, right-click-open-in-tab, keyboard Tab focus), satisfies WCAG 2.1 AA, and is the minimum-change approach.

**Alternatives considered**:
- Programmatic navigation on row click — rejected; clicking anywhere in the row would conflict with the inline +/− quantity controls still on the row. Name-link only is precise and avoids accidental navigation.

---

## Decision 3: Confirmation Dialog

**Decision**: Install `@radix-ui/react-alert-dialog` and create `frontend/src/components/ui/alert-dialog.tsx` following the project's existing shadcn/ui component pattern.

**Rationale**:
- Project already uses Radix UI primitives (`@radix-ui/react-label`, `@radix-ui/react-select`, `@radix-ui/react-slot`) and the shadcn/ui component pattern (button.tsx, badge.tsx, etc.).
- Radix UI AlertDialog is accessible by default: focus trap, keyboard dismissal (Escape), ARIA `role="alertdialog"`, meets WCAG 2.1 AA.
- Consistent look-and-feel with the rest of the UI.

**Alternatives considered**:
- `window.confirm()` — rejected; non-stylable, poor mobile UX (can be suppressed by browser on repeat invocations), inconsistent with the component library approach.
- Build a custom modal — rejected; YAGNI — Radix UI provides all needed primitives.

---

## Decision 4: Warning Indicator

**Decision**: Use the `TriangleAlert` icon from Lucide React (already a project dependency) rendered as a small inline `<span>` with `text-destructive` coloring adjacent to the item name in the table row.

**Rationale**:
- Lucide React is already installed; zero new dependencies.
- `TriangleAlert` is the semantic "warning" icon, distinct from a checkmark (spec clarification: use warning/alert icon, not checkmark).
- `text-destructive` aligns with the existing `Badge variant="destructive"` used for the Expired badge, providing visual consistency.

**Alternatives considered**:
- Emoji `⚠️` — rejected; inconsistent sizing, no colour control, accessibility depends on screen reader emoji support.
- A separate colored badge (like the existing Expired badge) — rejected; the spec says the indicator is in the *inventory table* (not the detail page), and a badge would add clutter the table is trying to reduce.

---

## Decision 5: Not-Found State on Detail Page

**Decision**: `ItemDetailPage` calls `GET /api/inventory/:id`. If the API returns 404 (item deleted/not found), render a not-found message with a `<Link>` back to `/inventory`.

**Rationale**:
- Spec edge case: "A not-found message is shown with a link back to the inventory."
- The existing `inventoryApi.getById(id)` endpoint already exists; the frontend just needs to handle the 404 response.

**Alternatives considered**:
- Redirect to `/inventory` silently — rejected; user deserves feedback when a URL they followed no longer resolves.
