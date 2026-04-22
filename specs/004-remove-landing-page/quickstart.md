# Quickstart: Remove Landing Page Validation

**Feature**: `004-remove-landing-page` | **Date**: 2026-04-21

## Manual Validation Steps

### Step 1 — Start the App

```bash
cd frontend
npm start
```

Open `http://localhost:3000` in a browser.

### Step 2 — Verify Root Redirect (SC-001)

**Expected**: Browser URL changes to `http://localhost:3000/inventory` and the inventory list is displayed immediately — no landing page.

### Step 3 — Verify Navigation Bar (SC-002)

**Expected**: The top navigation bar shows exactly **2 destination links**: "Inventory" and "Add Item". No "Home" or other link is present.

### Step 4 — Verify Brand Link

Click the brand/logo ("Inventory") in the top-left.

**Expected**: Navigates to the inventory list (stays on or returns to `/inventory`).

### Step 5 — Verify Unknown Route Redirect

Navigate to `http://localhost:3000/nonexistent`.

**Expected**: Redirected to the inventory list; no blank page or error.

### Step 6 — Verify Existing Features (SC-003)

- [ ] Inventory list loads and displays items
- [ ] Add Item page accessible via nav link
- [ ] Add Item page accessible via "Add Item" button on inventory list
- [ ] Adding an item works
- [ ] Deleting an item works
- [ ] Undo toast appears after deletion
- [ ] Edit/update an item works

### Pass Criteria

| Check | Expected |
|-------|----------|
| Root URL | Redirects to `/inventory` |
| Nav link count | Exactly 2 |
| Brand link target | Inventory list |
| Unknown route | Redirects to inventory list |
| All CRUD actions | Work without regression |
