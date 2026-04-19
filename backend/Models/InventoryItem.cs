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
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    
    [Required]
    [Range(0, int.MaxValue)]
    public int Quantity { get; set; }
    
    [Required]
    public Category Category { get; set; }
    
    public DateTime? ExpirationDate { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}