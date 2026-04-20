# Research & Decisions

## Storage Solution

**Decision**: SQLite with Entity Framework Core  
**Rationale**: For a single-user household inventory application, SQLite provides sufficient performance (up to 500 items), requires no separate database server, and simplifies deployment. Entity Framework Core provides ORM capabilities with migration support.  
**Alternatives Considered**: 
- SQL Server: Too heavy for single-user scenario, requires server setup
- PostgreSQL: Overkill for this scale, adds complexity
- File-based JSON: Lacks query capabilities and ACID transactions

## Mobile-First React Patterns

**Decision**: Use CSS Grid and Flexbox with mobile-first breakpoints, shadcn/ui component library  
**Rationale**: Ensures touch-friendly interfaces, follows progressive enhancement. shadcn/ui provides accessible, customizable components that meet WCAG standards.  
**Alternatives Considered**: 
- Material-UI: Good but heavier bundle
- Custom components: Time-consuming, potential accessibility issues

## API Design

**Decision**: RESTful API with JSON responses, standard HTTP status codes  
**Rationale**: Follows ASP.NET Core conventions, easy to consume from React frontend, supports future mobile app clients.  
**Alternatives Considered**: 
- GraphQL: Overkill for simple CRUD operations
- gRPC: Not web-friendly for frontend consumption

## Testing Strategy

**Decision**: xUnit for backend integration tests, Jest for frontend component tests  
**Rationale**: Meets constitution requirements for coverage and TDD. xUnit integrates well with .NET, Jest is standard for React.  
**Alternatives Considered**: NUnit (similar to xUnit), Cypress for E2E (will add later if needed)