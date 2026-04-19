# Data Model

## Entities

### InventoryItem

Represents a trackable consumable item in the household inventory.

**Fields**:
- `Id`: int (primary key, auto-generated)
- `Name`: string (required, max 100 chars, unique within category?)
- `Quantity`: int (required, >= 0)
- `Category`: string (required, enum: "Groceries", "Medications", "Consumables")
- `ExpirationDate`: DateTime? (optional, for perishable items)
- `CreatedAt`: DateTime (audit field)
- `UpdatedAt`: DateTime (audit field)

**Validation Rules**:
- Name cannot be empty or whitespace
- Quantity must be >= 0
- Category must be one of the predefined values
- If ExpirationDate is provided, it must be in the future (for new items)

**Relationships**: None (single entity system for initial implementation)

**Business Rules**:
- Items are soft-deleted (IsDeleted flag) to maintain audit trail
- Quantity updates are logged with before/after values
- Duplicate names allowed within different categories, but not within same category