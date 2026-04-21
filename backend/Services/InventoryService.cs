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
        return await _context.InventoryItems
            .Where(i => i.DeletedAt == null)
            .ToListAsync();
    }

    public async Task<InventoryItem?> GetItemByIdAsync(int id)
    {
        return await _context.InventoryItems
            .FirstOrDefaultAsync(i => i.Id == id && i.DeletedAt == null);
    }

    public async Task<InventoryItem> AddItemAsync(InventoryItem item)
    {
        item.Name = SanitizeName(item.Name);

        if (string.IsNullOrWhiteSpace(item.Name))
            throw new ArgumentException("Name is required");

        if (item.Quantity < 0)
            throw new ArgumentException("Quantity must be non-negative");

        await EnsureUniqueNameAsync(item.Name);

        item.CreatedAt = DateTime.UtcNow;
        item.UpdatedAt = DateTime.UtcNow;
        _context.InventoryItems.Add(item);
        await _context.SaveChangesAsync();

        Console.WriteLine($"Audit: Created item {item.Id} ('{item.Name}') quantity={item.Quantity} at {item.CreatedAt:O}");

        return item;
    }

    public async Task<InventoryItem?> UpdateItemAsync(int id, InventoryItem item)
    {
        var existingItem = await _context.InventoryItems
            .FirstOrDefaultAsync(i => i.Id == id && i.DeletedAt == null);
        if (existingItem == null)
            return null;

        item.Name = SanitizeName(item.Name);

        if (string.IsNullOrWhiteSpace(item.Name))
            throw new ArgumentException("Name is required");

        if (item.Quantity < 0)
            throw new ArgumentException("Quantity must be non-negative");

        await EnsureUniqueNameAsync(item.Name, id);

        var oldQuantity = existingItem.Quantity;
        existingItem.Name = item.Name;
        existingItem.Quantity = item.Quantity;
        existingItem.Category = item.Category;
        existingItem.ExpirationDate = item.ExpirationDate?.Date;
        existingItem.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        Console.WriteLine($"Audit: Updated item {id} ({existingItem.Name}) quantity from {oldQuantity} to {existingItem.Quantity}");

        return existingItem;
    }

    public async Task<bool> DeleteItemAsync(int id)
    {
        var item = await _context.InventoryItems
            .FirstOrDefaultAsync(i => i.Id == id && i.DeletedAt == null);
        if (item == null)
            return false;

        item.DeletedAt = DateTime.UtcNow;
        item.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        Console.WriteLine($"Audit: Soft-deleted item {id} ('{item.Name}') at {item.DeletedAt:O}");

        return true;
    }

    public async Task<InventoryItem?> RestoreItemAsync(int id)
    {
        var item = await _context.InventoryItems.FindAsync(id);
        if (item == null)
            return null;

        item.DeletedAt = null;
        item.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        Console.WriteLine($"Audit: Restored item {id} ('{item.Name}') at {item.UpdatedAt:O}");

        return item;
    }

    private static string SanitizeName(string? name)
    {
        return (name ?? string.Empty).Trim();
    }

    private async Task EnsureUniqueNameAsync(string name, int? excludeId = null)
    {
        var duplicate = await _context.InventoryItems.AnyAsync(i =>
            i.DeletedAt == null &&
            i.Name.ToLower() == name.ToLower() &&
            (!excludeId.HasValue || i.Id != excludeId.Value));

        if (duplicate)
            throw new InvalidOperationException($"An item named '{name}' already exists.");
    }
}
