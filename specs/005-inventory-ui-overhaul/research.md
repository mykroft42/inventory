# Research: Inventory UI Overhaul

**Branch**: `005-inventory-ui-overhaul` | **Date**: 2026-04-21

## Decision 1: Build Tool — CRA vs Vite

**Decision**: Migrate from Create React App (react-scripts) to Vite.

**Rationale**: `react-scripts` is in maintenance-only mode and is not supported by the official shadcn/ui initializer. Vite is the recommended build tool for new React + TypeScript projects and is required for `npx shadcn@latest init` to function correctly. The project is small (< 10 source files), making migration low-risk and high-reward — Vite delivers dramatically faster HMR and cold-start times.

**Alternatives considered**:
- **CRACO (Create React App Configuration Override)**: Allows Tailwind on top of CRA without ejecting, but is itself abandoned and produces fragile PostCSS wiring. shadcn/ui's init script still fails on it.
- **Ejecting CRA**: Exposes all webpack config, gives full control, but produces a large unmaintainable configuration file and is irreversible.
- **Staying on CRA + manual component copies**: Technically possible by hand-copying shadcn/ui source, but bypasses the CLI toolchain and creates a maintenance burden every time components need updating.

---

## Decision 2: Tailwind CSS Version

**Decision**: Tailwind CSS v3 (3.4.x).

**Rationale**: shadcn/ui's stable component registry is built and tested against Tailwind v3. Tailwind v4 introduced a new CSS-first config format that breaks shadcn/ui's `components.json` assumptions in the current stable shadcn release. Using v3 ensures all `shadcn add <component>` commands work without patching.

**Alternatives considered**:
- **Tailwind v4**: Available but shadcn/ui's compatibility is partial; several components rely on v3 plugin APIs (`tailwind-merge`, `tailwindcss-animate`) that require workarounds under v4.

---

## Decision 3: shadcn/ui Components Required

**Decision**: Use the following shadcn/ui components:

| Component | Purpose |
|-----------|---------|
| `Table` | Compact tabular inventory display (Table, TableHeader, TableBody, TableRow, TableHead, TableCell) |
| `Button` | All interactive buttons — quantity controls, remove, form submit, nav |
| `Input` | Inline quantity editor and all form text inputs |
| `Badge` | Expired and out-of-stock status indicators per row |
| `Select` | Category dropdown in AddItemForm (replaces native `<select>`) |
| `Sonner` | Toast notification for undo-remove (replaces custom UndoToast) |
| `Label` | Form field labels in AddItemForm |

**Rationale**: These cover every interactive surface currently in the application. Using shadcn/ui primitives across all components (not just the table) is what delivers the visual consistency goal.

**Alternatives considered**:
- Keeping custom `UndoToast` alongside shadcn/ui: Creates a hybrid that partially defeats the consistency goal; Sonner (shadcn's toast recommendation) is a drop-in.

---

## Decision 4: CRA-to-Vite Migration Approach

**Decision**: Replace `react-scripts` with `vite` + `@vitejs/plugin-react`, update `package.json` scripts, swap `index.html` to project root, update `tsconfig.json` with path aliases for `@/`.

**Migration steps resolved**:
1. Remove `react-scripts`, add `vite`, `@vitejs/plugin-react`, `vite-tsconfig-paths`
2. Move `public/index.html` to project root; add `<script type="module" src="/src/index.tsx">` entry point
3. Replace `react-app-env.d.ts` with standard `vite/client` reference types
4. Add `vite.config.ts` with React plugin and `@/` alias pointing to `src/`
5. Update `tsconfig.json` `paths` and `baseUrl` for `@/`
6. Update `package.json` scripts: `start` → `vite`, `build` → `vite build`, `test` remains Jest

**Rationale**: Minimal invasive change — component logic is entirely unchanged; only build tooling and entry-point wiring changes.

---

## Decision 5: Responsive Table Strategy (Mobile-First per Constitution VI)

**Decision**: Compact table on tablet/desktop (≥640px); on mobile (<640px) collapse to a single-column stacked card layout using CSS-only responsive classes (no JS).

**Rationale**: Constitution Principle VI mandates mobile-first design. A 6-column table on a 375px phone is unusable. The stacked card approach on mobile provides large tap targets and readable item details. The spec's primary target is tablet/desktop, so the full table experience is preserved there. The switch happens at Tailwind's `sm` breakpoint (640px), using `hidden sm:table-cell` on non-critical columns.

**Alternatives considered**:
- **Horizontal scroll on mobile**: Keeps full table but forces awkward side-scrolling — poor UX for touch users.
- **Virtual scrolling**: Unnecessary for ≤100 items; adds complexity with no performance benefit at that scale.

---

## Decision 6: Quantity Controls in Compact Rows

**Decision**: Inline `−` button | clickable quantity badge (inline `<Input>` on focus) | `+` button, all in a single `TableCell`. Buttons use shadcn/ui `Button` with `variant="outline"` and `size="icon"` (28px × 28px) to fit within a 32–36px row height.

**Rationale**: The primary usability requirement is that +/− remain one-click accessible without navigating away. Icon-size buttons fit comfortably in a compact row while maintaining ≥24px touch target on mobile via the stacked card layout.

---

## Decision 7: Status Indicators

**Decision**:
- **Expired**: `Badge` with `variant="destructive"` shown in the Expiration column cell.
- **Out-of-stock (qty = 0)**: Row receives `text-muted-foreground` class for full-row dimming — no badge needed as the `0` quantity is already visible.

**Rationale**: Badges for expiry draw immediate attention. Row dimming for zero-stock is a lighter signal that avoids visual noise when many items hit zero.
