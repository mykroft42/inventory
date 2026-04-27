using System.ComponentModel.DataAnnotations;

namespace backend.Models;

public enum Category
{
    Groceries,
    Medications,
    Consumables
}

public class InventoryItem
{
    public int Id { get; set; }
    
    [Required(ErrorMessage = "Name is required")]
    [MaxLength(100, ErrorMessage = "Name cannot exceed 100 characters")]
    [MinLength(1, ErrorMessage = "Name cannot be empty")]
    [RegularExpression(@"^[a-zA-Z0-9\s\-_]+$", ErrorMessage = "Name can only contain letters, numbers, spaces, hyphens, and underscores")]
    public string Name { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Quantity is required")]
    [Range(0, 10000, ErrorMessage = "Quantity must be between 0 and 10,000")]
    public int Quantity { get; set; }
    
    public Category? Category { get; set; }

    public DateTime? ExpirationDate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? DeletedAt { get; set; }
}