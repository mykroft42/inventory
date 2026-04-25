# Implementation Plan: Inventory Sort Order & Item Detail View

**Branch**: `006-sort-detail-view` | **Date**: 2026-04-23 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/006-sort-detail-view/spec.md`

## Summary

Add three-tier alphabetical sort (expired qty>0 first, non-expired qty>0 second, qty=0 last) to the inventory table, move the Remove button and expiration date to a new item detail page reached by clicking the item name as a link, and show a warning indicator next to expired item names. All changes are purely frontend; no backend schema or API changes are required.

## Technical Context

**Language/Version**: C# .NET 10.0 (backend) + TypeScript 4.9.5 with React 19.2.5 (frontend)
**Primary Dependencies**: ASP.NET Core 10, EF Core 10.0.6 (SQLite), React Router DOM v7, Vitest 4.1.5 + React Testing Library 16.3.2, Tailwind CSS 3.4.19, Radix UI, Lucide React 1.8.0, Sonner 2.0.7
**Storage**: SQLite via EF Core — no schema changes required (`InventoryItem` already has all needed fields)
**Testing**: xUnit + Moq (backend), Vitest + React Testing Library (frontend)
**Target Platform**: Mobile-first web — React SPA served by Vite; ASP.NET Core REST API on port 5007
**Project Type**: Full-stack web application (REST API + React SPA)
**Performance Goals**: Client-side sort only — items already fetched from API; no backend sort parameter needed
**Constraints**: Mobile-first layout (min-width breakpoints), WCAG 2.1 AA contrast + keyboard navigation, single-user household scale
**Scale/Scope**: Single-user household app; small dataset (dozens to hundreds of items)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Specification-First | ✅ PASS | `spec.md` complete with user stories, FR-XXX requirements, acceptance scenarios, clarifications |
| II. TDD & Coverage | ✅ PASS (gate) | Tests MUST be written and failing before implementation. New test files: `ItemDetailPage.test.tsx`; updated: `InventoryTable.test.tsx`. Coverage ≥ 80% required for new logic. |
| III. Data Integrity | ✅ PASS | No schema changes. Existing soft-delete mechanism used for Remove. Confirmation dialog required by FR-006a before deletion. |
| IV. Clean Code | ✅ PASS | Sort function ≤ 30 lines. Each component has single responsibility. Dead columns (Remove, Expires) removed from table. No new complexity. |
| V. Incremental Delivery | ✅ PASS | Three independently implementable stories (P1 sort, P2 detail page, P3 warning indicator), each with own acceptance scenarios and test coverage. |
| VI. Mobile-First Frontend | ✅ PASS | Detail page designed mobile-first. Item name links require min 44px touch target. Radix UI AlertDialog used for confirmation (WCAG compliant). |

**Result**: All gates pass. No complexity violations to document.

## Project Structure

### Documentation (this feature)

```text
specs/006-sort-detail-view/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (not created by /speckit-plan)
```

### Source Code (repository root)

```text
backend/                         # No changes for this feature
├── Controllers/InventoryController.cs
├── Models/InventoryItem.cs
├── Services/InventoryService.cs
└── Data/InventoryContext.cs

frontend/src/
├── App.tsx                      # MODIFIED: add /inventory/:id route
├── components/
│   ├── InventoryTable.tsx       # MODIFIED: sort, name links, warning indicator,
│   │                            #   remove Expires column and Actions column
│   └── ui/
│       └── alert-dialog.tsx     # NEW: Radix UI AlertDialog (shadcn/ui pattern)
└── pages/
    ├── InventoryPage.tsx        # No changes
    ├── AddItemPage.tsx          # No changes
    └── ItemDetailPage.tsx       # NEW: detail view with all fields + Remove

frontend/src/ (tests)
├── components/
│   └── InventoryTable.test.tsx  # MODIFIED: add sort, link, indicator tests
└── pages/
    └── ItemDetailPage.test.tsx  # NEW
```

**Structure Decision**: Web application layout (Option 2 from template). Backend untouched. All changes are in the frontend. New `ItemDetailPage` lives in `pages/` alongside existing page components.

## Complexity Tracking

> No violations — no entries required.
