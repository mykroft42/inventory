using Xunit;
using Moq;
using backend.Services;
using backend.Models;
using backend.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Tests;

public class InventoryServiceTests
{
    private readonly Mock<InventoryContext> _mockContext;
    private readonly InventoryService _service;

    public InventoryServiceTests()
    {
        _mockContext = new Mock<InventoryContext>();
        _service = new InventoryService(_mockContext.Object);
    }

    [Fact]
    public async Task GetAllItemsAsync_ReturnsAllItems()
    {
        // Arrange
        var items = new List<InventoryItem>
        {
            new InventoryItem { Id = 1, Name = "Milk", Quantity = 2, Category = Category.Groceries },
            new InventoryItem { Id = 2, Name = "Bread", Quantity = 1, Category = Category.Groceries }
        };

        var mockDbSet = CreateMockDbSet(items);
        _mockContext.Setup(c => c.InventoryItems).Returns(mockDbSet.Object);

        // Act
        var result = await _service.GetAllItemsAsync();

        // Assert
        Assert.Equal(2, result.Count());
        Assert.Contains(result, i => i.Name == "Milk");
        Assert.Contains(result, i => i.Name == "Bread");
    }

    [Fact]
    public async Task GetItemByIdAsync_ReturnsItem_WhenExists()
    {
        // Arrange
        var item = new InventoryItem { Id = 1, Name = "Milk", Quantity = 2, Category = Category.Groceries };
        _mockContext.Setup(c => c.InventoryItems.FindAsync(1)).ReturnsAsync(item);

        // Act
        var result = await _service.GetItemByIdAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Milk", result.Name);
    }

    [Fact]
    public async Task GetItemByIdAsync_ReturnsNull_WhenNotExists()
    {
        // Arrange
        _mockContext.Setup(c => c.InventoryItems.FindAsync(1)).ReturnsAsync((InventoryItem?)null);

        // Act
        var result = await _service.GetItemByIdAsync(1);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task UpdateItemAsync_UpdatesExistingItem()
    {
        // Arrange
        var existingItem = new InventoryItem { Id = 1, Name = "Milk", Quantity = 2, Category = Category.Groceries };
        var updatedData = new InventoryItem { Id = 1, Name = "Milk", Quantity = 5, Category = Category.Groceries };

        var mockDbSet = new Mock<DbSet<InventoryItem>>();
        _mockContext.Setup(c => c.InventoryItems.FindAsync(1)).ReturnsAsync(existingItem);
        _mockContext.Setup(c => c.SaveChangesAsync(default)).ReturnsAsync(1);

        // Act
        var result = await _service.UpdateItemAsync(1, updatedData);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(5, result.Quantity);
        Assert.True(result.UpdatedAt > existingItem.UpdatedAt);
        _mockContext.Verify(c => c.SaveChangesAsync(default), Times.Once);
    }

    [Fact]
    public async Task UpdateItemAsync_ReturnsNull_WhenItemNotFound()
    {
        // Arrange
        var updatedData = new InventoryItem { Id = 1, Name = "Milk", Quantity = 5, Category = Category.Groceries };
        _mockContext.Setup(c => c.InventoryItems.FindAsync(1)).ReturnsAsync((InventoryItem?)null);

        // Act
        var result = await _service.UpdateItemAsync(1, updatedData);

        // Assert
        Assert.Null(result);
    }

    private Mock<DbSet<T>> CreateMockDbSet<T>(List<T> data) where T : class
    {
        var queryable = data.AsQueryable();
        var mockDbSet = new Mock<DbSet<T>>();
        mockDbSet.As<IQueryable<T>>().Setup(m => m.Provider).Returns(queryable.Provider);
        mockDbSet.As<IQueryable<T>>().Setup(m => m.Expression).Returns(queryable.Expression);
        mockDbSet.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(queryable.ElementType);
        mockDbSet.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(queryable.GetEnumerator());
        return mockDbSet;
    }
}