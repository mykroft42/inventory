# Quickstart: Remote Access Setup

**Feature**: 003-remote-api-url

## How Remote Access Works

After this feature is implemented, the frontend automatically contacts the backend using the same hostname the browser used to load the page. No configuration is needed on the client device.

- Access from the server machine → frontend calls `http://localhost:5007`
- Access from another device on the network → frontend calls `http://<server-ip>:5007`

---

## Setup Steps

### 1. Find the Server's IP Address

On the machine running the server (Windows):
```
ipconfig
```
Look for the IPv4 address under your active network adapter (e.g., `192.168.1.100`).

### 2. Start the Backend

```
cd backend
dotnet run
```

The backend now binds to all network interfaces (`0.0.0.0:5007`), so it is reachable from other devices on the network.

### 3. Start the Frontend

```
cd frontend
npm start
```

The frontend dev server binds to all interfaces by default (CRA behaviour).

### 4. Access from Another Device

On the remote device, open a browser and navigate to:
```
http://<server-ip>:3000
```
Replace `<server-ip>` with the address found in step 1.

The inventory list should load and all actions (add, update, delete) should work.

---

## Production / Served Build

If serving the built frontend (e.g., `npx serve -s build`), the same principle applies. The `window.location.hostname` in the browser resolves to whatever hostname was used to reach the page, so the API URL is always correct automatically.

To override the API URL explicitly (e.g., backend on a different machine):
```
REACT_APP_API_URL=http://192.168.1.50:5007 npm run build
```
Note: this approach requires a rebuild and is only needed for non-standard deployments.

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Frontend loads but no data | Backend not binding to 0.0.0.0 | Verify `launchSettings.json` uses `http://0.0.0.0:5007` |
| Connection refused on port 5007 | Firewall blocking the port | Allow port 5007 in Windows Firewall for private networks |
| Works locally but not remotely | Old frontend build with baked-in localhost URL | Ensure you are running the updated code |
