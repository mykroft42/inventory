# Research: Remote-Accessible API URL Configuration

**Feature**: 003-remote-api-url | **Date**: 2026-04-21

---

## Finding 1: CORS Is Already Resolved

**Decision**: No CORS changes required.

**Rationale**: `Program.cs` already registers and applies an `AllowAll` CORS policy (`AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()`). Cross-origin requests from any local network browser are already permitted. FR-007 is satisfied by the existing code.

**Alternatives considered**: Scoping CORS to local network origins only — rejected because this is a single-user home app; the `AllowAll` policy is intentional and appropriate for this scale.

---

## Finding 2: Backend Binding Requires One Change

**Decision**: Change `launchSettings.json` `applicationUrl` from `http://localhost:5007` to `http://0.0.0.0:5007`.

**Rationale**: `localhost`/`127.0.0.1` binds only to the loopback interface; remote devices cannot reach it. `0.0.0.0` binds to all network interfaces, making the server reachable at any IP assigned to the machine. `AllowedHosts: "*"` in `appsettings.json` is already set, so no host-filtering issue.

For production (`dotnet run` outside dev profile), set `ASPNETCORE_URLS=http://0.0.0.0:5007` or add `"Urls": "http://0.0.0.0:5007"` to `appsettings.json`.

**Alternatives considered**:
- Binding to the specific LAN IP — rejected because the IP can change (DHCP); `0.0.0.0` is more robust.
- Keeping localhost and using a reverse proxy — rejected as unnecessary complexity for a home app.

---

## Finding 3: Frontend URL — Runtime Dynamic Hostname

**Decision**: Replace the hardcoded fallback `'http://localhost:5007'` with a runtime expression `\`http://${window.location.hostname}:5007\``.

**Rationale**: Create React App bakes `REACT_APP_*` variables at **build time**, not runtime. Changing `.env` requires a rebuild, which violates FR-005. The dynamic hostname approach evaluates `window.location.hostname` in the **browser at runtime**:
- Accessed from localhost → evaluates to `http://localhost:5007` (unchanged behaviour)
- Accessed from `192.168.1.100` → evaluates to `http://192.168.1.100:5007` (automatically correct)

This satisfies SC-001 (zero client-side configuration) and FR-005 (no rebuild) simultaneously, without any config file.

The existing `REACT_APP_API_URL` env-var override is retained as an explicit escape hatch for unusual deployments where frontend and backend run on different machines.

**Alternatives considered**:
- `public/config.json` fetched at startup — works but adds async initialisation complexity and an extra HTTP round-trip; the dynamic hostname approach is simpler and handles the 99% case with no operator action.
- Hardcoding the LAN IP in `.env` and rebuilding — explicitly ruled out by FR-005.
- Relative URLs + CRA proxy — proxy only works during `npm start`; the built static files don't use it.

---

## Finding 4: No Data Model or API Contract Changes

**Decision**: `data-model.md` and `contracts/` are not required for this feature.

**Rationale**: The change is entirely in deployment configuration and a single frontend fallback expression. No new entities, no schema migrations, no new or changed API endpoints.
