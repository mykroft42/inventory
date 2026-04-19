<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.1.0
Bump rationale: MINOR — new principle added (VI. Mobile-First Web Frontend), existing
  principles materially expanded with concrete tech stack and testing standards,
  TODO(TECH_STACK) resolved.

Modified principles:
  - II. Test-Driven Development → II. Test-Driven Development & Coverage
    (expanded: coverage thresholds, tool mandates for xUnit/.NET and Jest/React)
  - IV. Simplicity & YAGNI → IV. Clean Code & Maintainability
    (expanded: SOLID principles, naming conventions, PR review gate added)
Added principles:
  - VI. Mobile-First Web Frontend (new)
Removed principles: none
Added sections: none
Removed sections: none

Templates requiring updates:
  - .specify/templates/plan-template.md ✅ Constitution Check section references principles I–VI
  - .specify/templates/spec-template.md ✅ No structural changes required
  - .specify/templates/tasks-template.md ✅ Task phases align with all six principles

Follow-up TODOs:
  - None — TODO(TECH_STACK) resolved by this amendment.
-->

# Inventory Constitution

## Core Principles

### I. Specification-First Development

Every feature MUST begin with a written specification in `/specs/[###-feature-name]/spec.md`
before any implementation work starts. Specifications MUST include user stories with
acceptance scenarios, functional requirements (FR-XXX), and measurable success criteria.

Rationale: Specifications force clarity on *what* before *how*, reduce rework, and create
a shared contract between design and implementation that survives personnel changes.

### II. Test-Driven Development & Coverage

Tests MUST be written before implementation code. Tests MUST fail before the first
implementation commit. The Red-Green-Refactor cycle MUST be followed.

**Backend (.NET Core / C#)**:
- Testing framework: xUnit (preferred) or NUnit.
- All business logic and service layer MUST have unit tests.
- All API endpoints MUST have integration tests using `WebApplicationFactory`.
- Code coverage for the backend MUST meet or exceed **80%** on business logic layers.

**Frontend (React)**:
- Testing framework: Jest + React Testing Library.
- All non-trivial components MUST have rendering and interaction tests.
- Critical user journeys MUST have end-to-end tests (Playwright or Cypress).
- Code coverage for frontend business logic MUST meet or exceed **80%**.

Contract and integration tests are REQUIRED for all inter-layer boundaries and
external-facing API surfaces.

Rationale: Inventory data is business-critical. Defects in stock counts, cost tracking,
or transaction history can cause financial and operational harm — test gates prevent
regressions from reaching production.

### III. Data Integrity & Auditability

Every mutation to inventory state (quantity changes, price updates, item creation/deletion)
MUST be logged with a timestamp, actor identity, and before/after values. The system MUST
enforce referential integrity at the persistence layer. Soft-delete MUST be used over
hard-delete for any entity with historical significance.

Rationale: Inventory records serve as the source of truth for purchasing, accounting, and
compliance. An irrecoverable delete or silent data corruption is unacceptable.

### IV. Clean Code & Maintainability

Code MUST be clean, readable, and maintainable. The following rules are non-negotiable:

- **SOLID principles** MUST be applied in the backend C# codebase.
- **Naming**: Classes, methods, variables, and components MUST have clear, descriptive names
  that communicate intent without requiring comments.
- **Method length**: Methods and functions MUST NOT exceed ~30 lines; extract when needed.
- **No dead code**: Commented-out code, unused imports, and unreachable branches MUST be
  removed before merging.
- **PR review gate**: Every pull request MUST be reviewed for code quality before merge;
  self-merge without review is prohibited except for automated tooling commits.
- **Comments**: Write comments only to explain *why*, never to restate *what* the code does.
- The simplest solution that satisfies the current specification MUST be preferred.
  Complexity MUST be justified in the plan's Complexity Tracking table before introduction.

Rationale: An inventory system is a long-lived, frequently extended product. Technical debt
accrued from unclear naming or entangled responsibilities compounds quickly and slows
delivery of every subsequent feature.

### V. Incremental & Independent Delivery

Each user story MUST be independently implementable, testable, and deployable. Phase 1 (P1)
stories MUST deliver a working MVP without dependency on lower-priority stories. Features
MUST NOT be merged to main unless all tests pass and the user story's acceptance scenarios
are verified.

Rationale: Incremental delivery reduces integration risk, enables early feedback from
stakeholders, and ensures a deployable artifact exists at each checkpoint.

### VI. Mobile-First Web Frontend

The web frontend MUST be designed and implemented mobile-first. Layout, navigation, touch
targets, and typography MUST be optimized for small screens before scaling up to tablet
and desktop breakpoints.

- **Framework**: React with TypeScript. A meta-framework such as Next.js MAY be adopted
  if server-side rendering or routing needs justify it.
- **Responsive design**: CSS MUST use a mobile-first breakpoint strategy (min-width queries).
  No fixed-width layouts.
- **Accessibility**: Interactive elements MUST meet WCAG 2.1 AA contrast and keyboard
  navigation requirements.
- **User experience**: UI MUST be intuitive and task-oriented. Workflows common to inventory
  users (scanning, counting, searching) MUST be completable with minimal taps/clicks.
- **Component library**: A well-maintained UI component library (e.g., shadcn/ui, MUI, or
  Chakra UI) SHOULD be used to avoid reinventing standard interaction patterns.

Rationale: Warehouse and field users typically operate on mobile devices. A desktop-first
design that is retrofitted for mobile consistently produces poor UX; mobile-first ensures
the most constrained context is the primary design target.

## Technology & Architecture Standards

**Backend**:
- Language: C# with the latest stable .NET (ASP.NET Core).
- Architecture: REST API following RESTful conventions (resource-oriented URLs, standard
  HTTP verbs and status codes, JSON request/response bodies).
- Dependency injection MUST be used via the built-in .NET DI container; no service locator
  pattern.
- Configuration MUST use `appsettings.json` + environment variable overrides; no hardcoded
  connection strings or secrets in source.

**Frontend**:
- Language: TypeScript (strict mode enabled).
- Framework: React (see Principle VI for details).
- State management: prefer React built-ins (Context, hooks) unless complexity demands a
  dedicated library; justify any additional state management dependency.

**Data layer**:
- The storage layer MUST support transactional writes for inventory mutations.
- ORM: Entity Framework Core (preferred for .NET backend).
- Specific database engine to be confirmed in the first `plan.md` Technical Context section.

**Cross-cutting**:
- All third-party libraries MUST be evaluated for active maintenance and license
  compatibility before adoption.
- Secrets MUST be managed via environment variables or a secrets manager; never committed
  to source control.

## Development Workflow

1. **Specify** (`/speckit-specify`): Author or update the feature spec. MUST precede planning.
2. **Clarify** (`/speckit-clarify`): Resolve ambiguities before planning begins.
3. **Plan** (`/speckit-plan`): Produce `plan.md`, `research.md`, `data-model.md`, and contracts.
   Constitution Check gate MUST be passed before Phase 0 research proceeds.
4. **Tasks** (`/speckit-tasks`): Generate `tasks.md` from design artifacts.
5. **Implement** (`/speckit-implement`): Execute tasks in dependency order.
   Tests MUST be written and failing before implementation tasks begin (Principle II).
6. **Analyze** (`/speckit-analyze`): Cross-artifact consistency check before merging.

Branch naming convention: `###-feature-name` (sequential numeric prefix).
All feature work MUST occur on a feature branch; direct commits to `main` are prohibited
except for constitution and tooling updates.

## Governance

This constitution supersedes all other development practices and informal conventions.
Amendments require:

1. A written rationale explaining which principle is changing and why.
2. A version increment following semantic versioning:
   - **MAJOR**: Removal or redefinition of an existing principle.
   - **MINOR**: Addition of a new principle or material expansion of guidance.
   - **PATCH**: Wording clarifications, typo fixes, non-semantic refinements.
3. An update to `LAST_AMENDED_DATE` on the day the amendment is merged.
4. Propagation checks across all templates in `.specify/templates/` (see Sync Impact Report
   format above).

All pull requests MUST include a Constitution Check confirming no principles are violated.
Complexity violations MUST be documented in the plan's Complexity Tracking table before
the PR is opened.

Use `.specify/memory/constitution.md` as the authoritative governance reference during
all `/speckit-*` command execution.

**Version**: 1.1.0 | **Ratified**: 2026-04-19 | **Last Amended**: 2026-04-19
