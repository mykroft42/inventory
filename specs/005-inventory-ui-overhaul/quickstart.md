# Quickstart: Inventory UI Overhaul

**Branch**: `005-inventory-ui-overhaul`

## Prerequisites

- Node.js 18+
- .NET 8 SDK (backend — unchanged)

## Development Setup

### 1. Install new frontend dependencies

```bash
cd frontend
npm install
```

After the Vite migration is complete, the dev server starts with:

```bash
npm run dev        # Vite dev server (replaces npm start)
```

The backend still starts as before:

```bash
cd backend
dotnet run
```

Or both together (from `frontend/`):

```bash
npm run dev:full   # concurrently runs Vite + dotnet
```

### 2. Adding shadcn/ui components (for contributors)

After setup is complete, new shadcn components can be added with:

```bash
cd frontend
npx shadcn@latest add <component-name>
```

Components are copied into `frontend/src/components/ui/`.

### 3. Running tests

```bash
# Frontend unit tests (Jest)
cd frontend && npm test

# Frontend e2e (Cypress)
cd frontend && npm run cypress:run

# Backend tests (xUnit)
cd backend.Tests && dotnet test
```

### 4. Key file locations after migration

| What | Where |
|------|-------|
| Vite config | `frontend/vite.config.ts` |
| Tailwind config | `frontend/tailwind.config.js` |
| shadcn component config | `frontend/components.json` |
| shadcn UI primitives | `frontend/src/components/ui/` |
| App CSS (Tailwind base) | `frontend/src/index.css` |
| Inventory table | `frontend/src/components/InventoryTable.tsx` |
| Quantity cell | `frontend/src/components/QuantityCell.tsx` |

### 5. Environment variables

No new environment variables. The existing `REACT_APP_API_URL` variable is renamed to `VITE_API_URL` after the CRA→Vite migration. Update `.env` accordingly:

```
VITE_API_URL=http://localhost:5000
```

In code, references change from `process.env.REACT_APP_API_URL` to `import.meta.env.VITE_API_URL`.
