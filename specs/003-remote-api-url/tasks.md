# Tasks: Remote-Accessible API URL Configuration

**Input**: Design documents from `specs/003-remote-api-url/`
**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Organization**: Single user story — all tasks map to US1.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1)
- Tests MUST be written and FAILING before their corresponding implementation tasks begin (Constitution II)

---

## Phase 1: Setup (Baseline Verification)

**Purpose**: Confirm existing test suite is green before introducing any changes

- [ ] T001 Verify all existing tests pass as baseline: run `CI=true npm test --watchAll=false` in `frontend/` and `dotnet test` in `backend.Tests/`; record pass counts for regression tracking

---

## Phase 2: User Story 1 — Remote Network Access (Priority: P1) 🎯 MVP

**Goal**: Any device on the local network can open the app and use all inventory features without any configuration changes on their device.

**Independent Test**: Start the backend and frontend on one machine, open `http://<machine-ip>:3000` on a second device — inventory list loads and all actions succeed.

### Tests (write first — must FAIL before implementation)

- [ ] T002 [US1] Write failing unit test for `API_BASE_URL` fallback: verify that when `REACT_APP_API_URL` is not set, the base URL is constructed using `window.location.hostname` and port 5007; verify that when `REACT_APP_API_URL` is set, it takes precedence — in `frontend/src/services/inventoryApi.test.ts` (new file)

### Implementation (after test is failing)

- [ ] T003 [P] [US1] Update `inventoryApi.ts` fallback URL: change `'http://localhost:5007'` to `` `http://${window.location.hostname}:5007` `` so the API host auto-resolves to whichever machine the browser loaded the page from — in `frontend/src/services/inventoryApi.ts`
- [ ] T004 [P] [US1] Update backend binding: change `applicationUrl` in the `http` profile from `http://localhost:5007` to `http://0.0.0.0:5007`, and in the `https` profile from `https://localhost:7262;http://localhost:5007` to `https://0.0.0.0:7262;http://0.0.0.0:5007` — in `backend/Properties/launchSettings.json`

**Checkpoint**: T002 must now PASS. `dotnet run` starts and accepts connections from LAN devices. Frontend served from any IP auto-targets the correct backend.

---

## Phase 3: Polish & Validation

- [ ] T005 Run full test suites: `CI=true npm test --watchAll=false` in `frontend/` (all tests including T002 must pass, no regressions); `dotnet test` in `backend.Tests/` (all 18 tests must pass)
- [ ] T006 Manual validation against quickstart.md: follow the setup steps to confirm a second device on the same network can load the inventory list and perform add/update/delete actions; confirm localhost access still works (SC-002 regression check)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (US1)**: Depends on Phase 1 baseline passing
- **Phase 3 (Polish)**: Depends on Phase 2 completion

### Within Phase 2

- T002 (test) MUST be written and FAILING before T003 or T004 begin
- T003 and T004 are parallel (different files, no shared dependencies)
- Both T003 and T004 must be complete before the Phase 2 checkpoint

### Parallel Opportunities

- T003 and T004 can run simultaneously (different files)

---

## Implementation Strategy

### MVP (Only One Story)

1. Complete Phase 1: Baseline verification
2. Write T002: Failing test
3. Complete T003 + T004 in parallel: Both implementation changes
4. **STOP and VALIDATE**: T002 passes, manual quickstart.md check succeeds
5. Complete Phase 3: Full regression + manual validation

---

## Notes

- [P] tasks = different files, no dependencies on each other within same phase
- T002 tests `inventoryApi.ts` module-level constant resolution — use `jest.isolateModules()` (or `jest.resetModules()` + `require()`) to force re-evaluation of the module after setting `process.env.REACT_APP_API_URL` and `Object.defineProperty(window, 'location', { value: { hostname: '...' } })`. Standard mocking alone will not work because module-level `const` values are captured at import time.
- The backend CORS policy (`AllowAll`) is already correct — no backend code changes required beyond `launchSettings.json`
- T004 does not affect test suite (launchSettings.json is not used by `dotnet test` in CI)
- After T006, if a Windows Firewall prompt appears, allow port 5007 for private networks
