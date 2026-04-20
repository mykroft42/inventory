using backend.Models;

namespace backend.Services;

public interface IInventoryService
{
    Task<IEnumerable<InventoryItem>> GetAllItemsAsync();
    Task<InventoryItem?> GetItemByIdAsync(int id);
    Task<InventoryItem> AddItemAsync(InventoryItem item);
    Task<InventoryItem?> UpdateItemAsync(int id, InventoryItem item);
    Task<bool> DeleteItemAsync(int id);
}