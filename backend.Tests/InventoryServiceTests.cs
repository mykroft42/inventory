using backend.Services;
using backend.Models;
using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Tests;

public class InventoryServiceTests
{
    private static InventoryContext CreateInMemoryContext()
    {
        var options = new DbContextOptionsBuilder<InventoryContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new InventoryContext(options);
    }

    [Fact]
    public async Task GetAllItemsAsync_ReturnsOnlyActiveItems()
    {
        using var context = CreateInMemoryContext();
        context.InventoryItems.AddRange(
            new InventoryItem { Name = "Active", Quantity = 1 },
            new InventoryItem { Name = "Deleted", Quantity = 1, DeletedAt = DateTime.UtcNow }
        );
        await context.SaveChangesAsync();
        var service = new InventoryService(context);

        var result = await service.GetAllItemsAsync();

        Assert.Single(result);
        Assert.Equal("Active", result.First().Name);
    }

    [Fact]
    public async Task GetItemByIdAsync_ReturnsItem_WhenExists()
    {
        using var context = CreateInMemoryContext();
        context.InventoryItems.Add(new InventoryItem { Name = "Milk", Quantity = 2 });
        await context.SaveChangesAsync();
        var item = context.InventoryItems.First();
        var service = new InventoryService(context);

        var result = await service.GetItemByIdAsync(item.Id);

        Assert.NotNull(result);
        Assert.Equal("Milk", result.Name);
    }

    [Fact]
    public async Task GetItemByIdAsync_ReturnsNull_WhenNotExists()
    {
        using var context = CreateInMemoryContext();
        var service = new InventoryService(context);

        var result = await service.GetItemByIdAsync(99999);

        Assert.Null(result);
    }

    [Fact]
    public async Task UpdateItemAsync_UpdatesExistingItem()
    {
        using var context = CreateInMemoryContext();
        context.InventoryItems.Add(new InventoryItem { Name = "Milk", Quantity = 2 });
        await context.SaveChangesAsync();
        var item = context.InventoryItems.First();
        var service = new InventoryService(context);

        var updated = await service.UpdateItemAsync(item.Id, new InventoryItem { Name = "Milk", Quantity = 5 });

        Assert.NotNull(updated);
        Assert.Equal(5, updated.Quantity);
    }

    [Fact]
    public async Task UpdateItemAsync_ReturnsNull_WhenItemNotFound()
    {
        using var context = CreateInMemoryContext();
        var service = new InventoryService(context);

        var result = await service.UpdateItemAsync(99999, new InventoryItem { Name = "Milk", Quantity = 5 });

        Assert.Null(result);
    }

    // T002 - Soft delete sets DeletedAt and item stays in database
    [Fact]
    public async Task DeleteItemAsync_SetsDeletedAt_ItemRemainsInDatabase()
    {
        using var context = CreateInMemoryContext();
        context.InventoryItems.Add(new InventoryItem { Name = "Milk", Quantity = 2 });
        await context.SaveChangesAsync();
        var item = context.InventoryItems.First();
        var service = new InventoryService(context);

        var result = await service.DeleteItemAsync(item.Id);

        Assert.True(result);
        var dbItem = await context.InventoryItems.FindAsync(item.Id);
        Assert.NotNull(dbItem);
        Assert.NotNull(dbItem.DeletedAt);
    }

    [Fact]
    public async Task DeleteItemAsync_DeletedItemExcludedFromGetAll()
    {
        using var context = CreateInMemoryContext();
        context.InventoryItems.Add(new InventoryItem { Name = "Milk", Quantity = 2 });
        await context.SaveChangesAsync();
        var item = context.InventoryItems.First();
        var service = new InventoryService(context);

        await service.DeleteItemAsync(item.Id);
        var all = await service.GetAllItemsAsync();

        Assert.Empty(all);
    }

    // T003 - Restore clears DeletedAt
    [Fact]
    public async Task RestoreItemAsync_ClearsDeletedAt()
    {
        using var context = CreateInMemoryContext();
        context.InventoryItems.Add(new InventoryItem { Name = "Milk", Quantity = 2, DeletedAt = DateTime.UtcNow });
        await context.SaveChangesAsync();
        var item = context.InventoryItems.First();
        var service = new InventoryService(context);

        var result = await service.RestoreItemAsync(item.Id);

        Assert.NotNull(result);
        Assert.Null(result.DeletedAt);
    }

    [Fact]
    public async Task RestoreItemAsync_ReturnsNull_WhenItemNotFound()
    {
        using var context = CreateInMemoryContext();
        var service = new InventoryService(context);

        var result = await service.RestoreItemAsync(99999);

        Assert.Null(result);
    }

    // T004 - Case-insensitive name uniqueness
    [Fact]
    public async Task AddItemAsync_ThrowsException_WhenNameMatchesCaseInsensitively()
    {
        using var context = CreateInMemoryContext();
        var service = new InventoryService(context);
        await service.AddItemAsync(new InventoryItem { Name = "Milk", Quantity = 2 });

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => service.AddItemAsync(new InventoryItem { Name = "milk", Quantity = 1 }));
    }

    [Fact]
    public async Task AddItemAsync_AllowsSameName_WhenExistingItemIsDeleted()
    {
        using var context = CreateInMemoryContext();
        var service = new InventoryService(context);
        await service.AddItemAsync(new InventoryItem { Name = "Milk", Quantity = 2 });
        var item = context.InventoryItems.First();
        await service.DeleteItemAsync(item.Id);

        var result = await service.AddItemAsync(new InventoryItem { Name = "Milk", Quantity = 3 });

        Assert.NotNull(result);
        Assert.Equal("Milk", result.Name);
    }
}
