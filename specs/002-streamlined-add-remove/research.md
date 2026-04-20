# Research: Streamlined Inventory Add/Remove

## Decision 1: Autocomplete Implementation Strategy

**Decision**: Client-side filtering of the already-loaded item list.

**Rationale**: The inventory list is already fetched on page load for display. Filtering in-memory by name substring costs nothing extra and delivers sub-millisecond response — well within the 300ms SC-003 target. A dedicated search endpoint would add latency, a round-trip, and implementation overhead for a dataset capped at ~500 items.

**Alternatives considered**:
- Server-side search endpoint (`GET /api/inventory/search?q=...`) — unnecessary complexity for dataset size.
- Debounced server requests — only beneficial at >1,000 items with slow backends.

---

## Decision 2: Upsert Pattern (Increment vs Create)

**Decision**: Frontend-driven upsert. The combo-box form resolves the target item ID from the in-memory list before submitting. If a match is found, calls `PUT /api/inventory/{id}` with `quantity = existingQuantity + delta`. If no match, calls `POST /api/inventory`.

**Rationale**: The frontend holds the full item list for autocomplete; it can resolve name→ID without a round-trip. This keeps the REST API resource-oriented with no new endpoints. A `POST /api/inventory/increment` endpoint would be cleaner for future multi-user concurrency but is premature for the single-user model.

**Alternatives considered**:
- New `POST /api/inventory/upsert` endpoint — introduces a non-RESTful verb; overkill for single-user.
- Backend-driven: POST always accepts name+delta and backend resolves — would require changing the existing contract significantly.

---

## Decision 3: Soft-Delete for Removal

**Decision**: Implement removal as soft-delete at the database layer (set `DeletedAt` timestamp). The undo action restores the record by clearing `DeletedAt`. The user experience presents this as permanent deletion after the 5-second undo window.

**Rationale**: Constitution Principle III mandates soft-delete for any entity with historical significance. Inventory items have audit history (creation, quantity changes). A hard-delete would orphan those audit records. The 5-second undo window maps cleanly onto the soft-delete grace period. A nightly cleanup job (future feature) may permanently purge old soft-deleted records.

**Alternatives considered**:
- Hard-delete with undo via client-side re-create — violates Constitution III; audit logs lost.
- Hard-delete entirely — acceptable for spec but non-compliant with constitution.

---

## Decision 4: Category Made Optional

**Decision**: Change `Category` from a required `[Required]` enum field to a nullable `Category?`. Add a sentinel value is not needed — null represents "uncategorised". The `More options` expander lets users set it when desired.

**Rationale**: FR-001 requires category to be optional. Making it nullable at the model and DB level is the minimal change. The existing three category values (Groceries, Medications, Consumables) are preserved; null is the new default.

**Alternatives considered**:
- Add `None = 0` sentinel value to the enum — pollutes the enum with a non-category; harder to query "items without category".
- Default to `Groceries` silently — misleading data; users expect blank to mean uncategorised.

---

## Decision 5: Name Uniqueness Scope Change

**Decision**: Change uniqueness constraint from (name + category) to name-only, case-insensitive. Two items with the same name but different categories will no longer be allowed.

**Rationale**: The autocomplete increment behavior requires a 1:1 mapping from name to item. If "Milk" exists in both Groceries and Medications, submitting "Milk" would be ambiguous. For a household inventory with ~3 categories, same-name-different-category items are practically nonexistent.

**Alternatives considered**:
- Keep name+category uniqueness and show a disambiguation step when autocomplete matches multiple categories — adds UX complexity; violates SC-001 (3 or fewer interactions).
- Allow duplicates and always create new — defeats the increment-by-name design.

**Migration note**: Existing data must be checked for name collisions before applying the new constraint. The migration will enforce uniqueness at the DB level; the service will enforce it case-insensitively.

---

## Decision 6: Combo-Box Component

**Decision**: Build a custom `ComboBox` component in React using a controlled `<input>` + absolutely-positioned dropdown list. No third-party component library adopted for this feature.

**Rationale**: The constitution notes a component library SHOULD be used but doesn't mandate it. The combo-box requirements are narrow (substring filter, keyboard nav, single selection) and the rest of the app uses no component library. Introducing a dependency (MUI, shadcn) for one component creates significant bundle size and integration overhead disproportionate to the benefit. If a library is adopted in a future feature it can absorb this component.

**Alternatives considered**:
- Native `<datalist>` — no support for substring (prefix-only) filtering; no custom styling.
- shadcn/ui Combobox — well-designed but requires Radix UI + Tailwind; no Tailwind in this project.
- react-select — large dependency; overkill for a single form field.

---

## Decision 7: Undo Toast Mechanism

**Decision**: Client-side only. The item is optimistically removed from the UI immediately. The DELETE API call fires immediately. If the API call fails, the item is restored with an error message (FR-008). If the user clicks Undo within 5 seconds, a `PATCH /api/inventory/{id}/restore` call is made to clear `DeletedAt`.

**Rationale**: Delaying the DELETE call until the undo window expires would leave a 5-second window where the item still exists in the DB and could be fetched by stale GET calls. Firing immediately and providing a restore endpoint is the more reliable pattern.

**Implementation note**: The undo toast timer runs in the frontend. The restore endpoint must be idempotent (calling restore on a non-deleted item returns 200 with no error).
