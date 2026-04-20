# Household Inventory

This repository contains a household inventory application with a .NET 8 backend API and a React TypeScript frontend.

## Project Structure

- `backend/` - ASP.NET Core Web API with Entity Framework Core and SQLite
- `frontend/` - React app created with Create React App and TypeScript
- `build.sh` - Production build script for packaging frontend and backend
- `specs/001-household-inventory-framework/` - feature spec, plan, and task definitions

## Local Development

### Backend

From the repository root:

```bash
cd backend
dotnet run
```

The API should be available at `https://localhost:5001` or `http://localhost:5000` depending on environment.

### Frontend

From the repository root:

```bash
cd frontend
npm install
npm start
```

The React app should open at `http://localhost:3000`.

## Production Build

A production build script is available at the repository root.

```bash
./build.sh
```

This script:
- publishes the backend to `dist/backend`
- builds the frontend production bundle
- copies the frontend output to `dist/frontend`
- creates a tarball deployment package

## Testing

### Frontend

From `frontend/`:

```bash
npm test
npm run test:ci
npm run test:e2e
```

### Backend

From `backend/`:

```bash
dotnet test
```

## Notes

- The frontend proxies API requests to `https://localhost:5001` by default.
- Backend validation and sanitization are enforced in `backend/Services/InventoryService.cs` and `backend/Controllers/InventoryController.cs`.
- Error handling middleware is implemented in `backend/Middleware/ErrorHandlingMiddleware.cs`.
- Responsive, accessible UI components are available in `frontend/src/components/`.
