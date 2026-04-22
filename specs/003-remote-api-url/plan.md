# Implementation Plan: Remote-Accessible API URL Configuration

**Branch**: `003-remote-api-url` | **Date**: 2026-04-21 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/003-remote-api-url/spec.md`

## Summary

Make the inventory app accessible from any device on the local network by (1) changing the frontend API URL fallback to use `window.location.hostname` at runtime instead of a hardcoded `localhost`, and (2) updating the backend to bind to all network interfaces (`0.0.0.0`) instead of loopback only. CORS is already `AllowAll` and requires no changes.

## Technical Context

**Language/Version**: C# / .NET 10 (backend); TypeScript / React 19 (frontend)
**Primary Dependencies**: ASP.NET Core, Create React App (react-scripts 5)
**Storage**: SQLite — no changes
**Testing**: xUnit + WebApplicationFactory (.NET); Jest + React Testing Library (React)
**Target Platform**: Local web app (localhost + LAN); desktop + mobile browsers
**Project Type**: Web application (React SPA + ASP.NET Core REST API)
**Performance Goals**: No change from baseline
**Constraints**: Single-user home network; no auth; no external internet access required
**Scale/Scope**: One server machine; ~500 items; multiple client devices on LAN

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Specification-First | ✅ Pass | spec.md + clarifications complete |
| II. TDD & Coverage | ✅ Pass | One unit test for URL fallback logic; no new service/controller code to test |
| III. Data Integrity & Auditability | ✅ Pass | No data mutations |
| IV. Clean Code | ✅ Pass | Two config changes + one one-line expression change |
| V. Incremental Delivery | ✅ Pass | Single atomic story; trivially deployable |
| VI. Mobile-First Frontend | ✅ Pass | No UI changes |

## Project Structure

### Documentation (this feature)

```text
specs/003-remote-api-url/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

Note: `data-model.md` and `contracts/` are not generated — this feature has no data model or API contract changes.

### Source Code Changes

```text
backend/
└── Properties/
    └── launchSettings.json   # Change applicationUrl to http://0.0.0.0:5007

frontend/src/
└── services/
    └── inventoryApi.ts       # Change fallback URL to window.location.hostname-based expression
```

**Total files changed**: 2  
**Structure Decision**: Web application (existing Option 2 layout). Changes are minimal and contained to configuration and a single service file.

## Detailed Change Specifications

### Change 1 — Backend: Bind to All Network Interfaces

**File**: `backend/Properties/launchSettings.json`

Change the `http` profile's `applicationUrl` from:
```
"applicationUrl": "http://localhost:5007"
```
to:
```
"applicationUrl": "http://0.0.0.0:5007"
```

Also update the `https` profile for consistency:
```
"applicationUrl": "https://0.0.0.0:7262;http://0.0.0.0:5007"
```

`AllowedHosts: "*"` in `appsettings.json` is already set — no change required there.

### Change 2 — Frontend: Runtime Hostname Resolution

**File**: `frontend/src/services/inventoryApi.ts`

Change:
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5007';
```
to:
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL ||
  `http://${window.location.hostname}:5007`;
```

**Why this works**: `window.location.hostname` is evaluated by the browser at runtime, not at build time. When a user accesses the app from `http://192.168.1.100:3000`, `window.location.hostname` returns `192.168.1.100`, so the frontend automatically constructs `http://192.168.1.100:5007`. From localhost, it returns `localhost`, preserving existing behaviour.

The `REACT_APP_API_URL` override is retained for edge cases (e.g., backend on a different machine than the frontend server).
