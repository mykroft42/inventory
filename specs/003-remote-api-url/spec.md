# Feature Specification: Remote-Accessible API URL Configuration

**Feature Branch**: `003-remote-api-url`
**Created**: 2026-04-21
**Status**: Draft
**Input**: User description: "Change the configuration of the frontend so that rather than looking at localhost specifically it looks at the ip address so that when people access the system from remote it still works. currently from a remote system it fails"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Access Inventory from Another Device on the Same Network (Priority: P1)

A household member opens the inventory app in a browser on their phone or another computer on the home network. Currently the page loads but no inventory data appears because the frontend is hard-coded to contact `localhost`, which resolves to the visitor's own device rather than the server. After this change, the frontend contacts the server by its network address and the app works correctly from any device on the network.

**Why this priority**: This is the sole stated problem. Without it, the app is only usable on the machine running the server.

**Independent Test**: Start the server on one machine. Open the app URL on a second device on the same network. The inventory list loads and all add/delete/update actions succeed.

**Acceptance Scenarios**:

1. **Given** the server is running on machine A, **When** a user on machine B navigates to the app URL, **Then** the inventory list loads without errors.
2. **Given** the server is running on machine A, **When** a user on machine B adds or removes an item, **Then** the change is saved and reflected correctly.
3. **Given** the server is running and the API address is configured, **When** a user on the same machine (localhost) uses the app, **Then** it still works correctly (no regression).

---

### Edge Cases

- What happens when the configured server address is unreachable (e.g., server is off)? The app should show a clear connection error message, consistent with existing error handling.
- What happens if someone accesses the app without configuring the address? The app should fall back gracefully and show a helpful error rather than silently failing.
- Does changing the address require restarting the server or rebuilding the frontend? The configuration mechanism should not require a full rebuild for a simple address change.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The frontend MUST allow the server's network address to be specified without modifying source code.
- **FR-002**: The configured address MUST be used for all API calls made by the frontend (inventory list, add, update, delete, restore).
- **FR-003**: When no address is explicitly configured, the system MUST fall back to a sensible default so local development continues to work without any setup.
- **FR-004**: The configuration mechanism MUST work for both the local machine and remote devices on the same network using the same frontend build.
- **FR-005**: Changing the configured address MUST NOT require recompiling or rebuilding the frontend application.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user on a second device on the same network can load the inventory list and perform all inventory actions with zero configuration changes on their device.
- **SC-002**: A developer running the app locally sees no change in behaviour — all existing functionality continues to work after this change is applied.
- **SC-003**: Updating the server address takes no more than one configuration file edit followed by a server restart (no rebuild required).

## Assumptions

- The server and client devices are on the same local network; no external internet access, VPN, or firewall traversal is required.
- The server host machine has a stable local IP address (or the operator knows it); dynamic address assignment is the operator's responsibility.
- Only the frontend-to-backend API address needs to change; the URL users type to reach the frontend itself is outside this feature's scope.
- The existing error-handling UI (connection error messages, retry button) is sufficient to handle unreachable-server scenarios and does not need to be redesigned.
