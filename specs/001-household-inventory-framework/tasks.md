# Tasks: Household Inventory Framework

**Input**: Design documents from `/specs/001-household-inventory-framework/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included per constitution requirement for TDD approach.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/` for .NET API, `frontend/` for React app
- Backend: Controllers/, Models/, Services/, Data/
- Frontend: src/components/, src/pages/, src/services/

## Dependencies

User stories must be completed in priority order:
- US1 (View Inventory) → US2 (Add Item) → US3 (Update Quantity)

Each user story can be implemented and tested independently once foundational tasks are complete.

## Parallel Execution Opportunities

- Model creation tasks can run in parallel
- Frontend component tasks can run in parallel with backend API tasks
- Test tasks within a story can run in parallel

## Implementation Strategy

- MVP Scope: User Story 1 (View Inventory) - provides immediate value
- Incremental Delivery: Each user story builds on the previous, maintaining independent testability
- TDD Approach: Tests written before implementation per constitution requirements

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create ASP.NET Core Web API project in backend/ directory
- [x] T002 Create React TypeScript project in frontend/ directory
- [x] T003 Configure SQLite database with Entity Framework Core migrations
- [x] T004 Setup CORS and JSON configuration for API
- [x] T005 Configure npm scripts for concurrent backend/frontend development

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create InventoryItem entity model in backend/Models/InventoryItem.cs
- [x] T007 Create InventoryContext with EF Core in backend/Data/InventoryContext.cs
- [x] T008 Setup dependency injection for services and database context
- [x] T009 Create base API controller structure in backend/Controllers/InventoryController.cs
- [x] T010 Setup React routing and basic app structure in frontend/src/App.tsx
- [x] T011 Create inventory API service in frontend/src/services/inventoryApi.ts
- [x] T012 Configure error handling middleware for API

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View Household Inventory (Priority: P1) 🎯 MVP

**Goal**: Display list of all inventory items with their details

**Independent Test**: Can access inventory view and see item list without any add/update functionality

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T013 [P] [US1] Unit test for inventory service GetAllItems in backend/Tests/InventoryServiceTests.cs
- [x] T014 [P] [US1] Integration test for GET /api/inventory endpoint in backend/Tests/InventoryControllerTests.cs
- [x] T015 [P] [US1] React component test for InventoryList in frontend/src/components/InventoryList.test.tsx

### Implementation for User Story 1

- [x] T016 [US1] Implement InventoryService.GetAllItems method in backend/Services/InventoryService.cs
- [x] T017 [US1] Implement GET /api/inventory endpoint in backend/Controllers/InventoryController.cs
- [x] T018 [US1] Create InventoryList React component in frontend/src/components/InventoryList.tsx
- [x] T019 [US1] Create InventoryPage component in frontend/src/pages/InventoryPage.tsx
- [x] T020 [US1] Add inventory route to React router in frontend/src/App.tsx
- [x] T021 [US1] Connect frontend to API using inventoryApi service

**Checkpoint**: User Story 1 fully functional - users can view their inventory list

---

## Phase 4: User Story 2 - Add Inventory Item (Priority: P2)

**Goal**: Allow users to add new items to their inventory

**Independent Test**: Can add items to inventory and see them appear in the list

### Tests for User Story 2 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T022 [P] [US2] Unit test for inventory service AddItem in backend/Tests/InventoryServiceTests.cs
- [x] T023 [P] [US2] Integration test for POST /api/inventory endpoint in backend/Tests/InventoryControllerTests.cs
- [x] T024 [P] [US2] React component test for AddItemForm in frontend/src/components/AddItemForm.test.tsx

### Implementation for User Story 2

- [x] T025 [US2] Implement InventoryService.AddItem method in backend/Services/InventoryService.cs
- [x] T026 [US2] Implement POST /api/inventory endpoint in backend/Controllers/InventoryController.cs
- [x] T027 [US2] Add validation for item creation in backend/Models/InventoryItem.cs
- [x] T028 [US2] Create AddItemForm React component in frontend/src/components/AddItemForm.tsx
- [x] T029 [US2] Create AddItemPage component in frontend/src/pages/AddItemPage.tsx
- [x] T030 [US2] Add add item route and navigation to React app
- [x] T031 [US2] Update InventoryList to refresh after adding items

**Checkpoint**: User Story 2 complete - users can add and view items

---

## Phase 5: User Story 3 - Update Item Quantity (Priority: P3)

**Goal**: Allow users to update quantities of existing inventory items

**Independent Test**: Can update item quantities and see changes reflected

### Tests for User Story 3 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T032 [P] [US3] Unit test for inventory service UpdateItemQuantity in backend/Tests/InventoryServiceTests.cs
- [x] T033 [P] [US3] Integration test for PUT /api/inventory/{id} endpoint in backend/Tests/InventoryControllerTests.cs
- [x] T034 [P] [US3] React component test for quantity update functionality

### Implementation for User Story 3

- [x] T035 [US3] Implement InventoryService.UpdateItemQuantity method in backend/Services/InventoryService.cs
- [x] T036 [US3] Implement PUT /api/inventory/{id} endpoint in backend/Controllers/InventoryController.cs
- [x] T037 [US3] Add quantity update UI to InventoryList component
- [x] T038 [US3] Add validation for quantity updates
- [x] T039 [US3] Implement audit logging for quantity changes

**Checkpoint**: User Story 3 complete - full CRUD functionality available

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Quality improvements and cross-cutting concerns applied across all user stories

- [ ] T040 Add comprehensive error handling and user-friendly error messages
- [ ] T041 Implement data validation and sanitization across all endpoints
- [ ] T042 Add loading states and empty states to frontend components
- [ ] T043 Implement responsive design optimizations for mobile devices
- [ ] T044 Add accessibility improvements (WCAG 2.1 AA compliance)
- [ ] T045 Configure production build and deployment scripts
- [ ] T046 Add end-to-end tests for complete user journeys
- [ ] T047 Performance optimization and code cleanup
- [ ] T048 Documentation updates and README completion

**Final Checkpoint**: Feature complete and production-ready