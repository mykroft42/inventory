using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class InventoryService : IInventoryService
{
    private readonly InventoryContext _context;

    public InventoryService(InventoryContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<InventoryItem>> GetAllItemsAsync()
    {
        return await _context.InventoryItems.ToListAsync();
    }

    public async Task<InventoryItem?> GetItemByIdAsync(int id)
    {
        return await _context.InventoryItems.FindAsync(id);
    }

    public async Task<InventoryItem> AddItemAsync(InventoryItem item)
    {
        item.Name = SanitizeName(item.Name);

        if (string.IsNullOrWhiteSpace(item.Name))
        {
            throw new ArgumentException("Name is required");
        }

        if (item.Quantity < 0)
        {
            throw new ArgumentException("Quantity must be non-negative");
        }

        await EnsureUniqueNameAsync(item.Name, item.Category);

        item.CreatedAt = DateTime.UtcNow;
        item.UpdatedAt = DateTime.UtcNow;
        _context.InventoryItems.Add(item);
        await _context.SaveChangesAsync();

        Console.WriteLine($"Audit: Created item {item.Id} ('{item.Name}', {item.Category}) quantity={item.Quantity} at {item.CreatedAt:O}");

        return item;
    }

    public async Task<InventoryItem?> UpdateItemAsync(int id, InventoryItem item)
    {
        var existingItem = await _context.InventoryItems.FindAsync(id);
        if (existingItem == null)
        {
            return null;
        }

        item.Name = SanitizeName(item.Name);

        if (string.IsNullOrWhiteSpace(item.Name))
        {
            throw new ArgumentException("Name is required");
        }

        if (item.Quantity < 0)
        {
            throw new ArgumentException("Quantity must be non-negative");
        }

        await EnsureUniqueNameAsync(item.Name, item.Category, id);

        var oldQuantity = existingItem.Quantity;
        existingItem.Name = item.Name;
        existingItem.Quantity = item.Quantity;
        existingItem.Category = item.Category;
        existingItem.ExpirationDate = item.ExpirationDate?.Date;
        existingItem.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        // Audit logging
        Console.WriteLine($"Audit: Updated item {id} ({existingItem.Name}) quantity from {oldQuantity} to {existingItem.Quantity}");

        return existingItem;
    }

    public async Task<bool> DeleteItemAsync(int id)
    {
        var item = await _context.InventoryItems.FindAsync(id);
        if (item == null)
        {
            return false;
        }

        _context.InventoryItems.Remove(item);
        await _context.SaveChangesAsync();
        return true;
    }

    private static string SanitizeName(string? name)
    {
        return (name ?? string.Empty).Trim();
    }

    private async Task EnsureUniqueNameAsync(string name, Category category, int? existingId = null)
    {
        var duplicate = await _context.InventoryItems
            .AnyAsync(i => i.Name == name && i.Category == category && (!existingId.HasValue || i.Id != existingId.Value));
        if (duplicate)
        {
            throw new InvalidOperationException($"An item named '{name}' already exists in {category}.");
        }
    }
}
