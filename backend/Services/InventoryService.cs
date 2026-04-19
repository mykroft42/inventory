using backend.Data;
using backend.Models;

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
        item.CreatedAt = DateTime.UtcNow;
        item.UpdatedAt = DateTime.UtcNow;
        _context.InventoryItems.Add(item);
        await _context.SaveChangesAsync();
        return item;
    }

    public async Task<InventoryItem?> UpdateItemAsync(int id, InventoryItem item)
    {
        var existingItem = await _context.InventoryItems.FindAsync(id);
        if (existingItem == null)
        {
            return null;
        }

        existingItem.Name = item.Name;
        existingItem.Quantity = item.Quantity;
        existingItem.Category = item.Category;
        existingItem.ExpirationDate = item.ExpirationDate;
        existingItem.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
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
}