using Xunit;
using Microsoft.AspNetCore.Mvc.Testing;
using System.Net.Http.Json;
using backend.Models;
using System.Net;

namespace backend.Tests;

public class InventoryControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public InventoryControllerTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task GetAll_ReturnsEmptyList_WhenNoItems()
    {
        // Act
        var response = await _client.GetAsync("/api/inventory");

        // Assert
        response.EnsureSuccessStatusCode();
        var items = await response.Content.ReadFromJsonAsync<List<InventoryItem>>();
        Assert.NotNull(items);
        Assert.Empty(items);
    }

    [Fact]
    public async Task Create_ReturnsCreatedItem()
    {
        // Arrange
        var newItem = new InventoryItem
        {
            Name = "Test Item",
            Quantity = 5,
            Category = Category.Groceries
        };

        // Act
        var response = await _client.PostAsJsonAsync("/api/inventory", newItem);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var createdItem = await response.Content.ReadFromJsonAsync<InventoryItem>();
        Assert.NotNull(createdItem);
        Assert.Equal("Test Item", createdItem.Name);
        Assert.True(createdItem.Id > 0);
    }

    [Fact]
    public async Task GetById_ReturnsItem_WhenExists()
    {
        // Arrange - Create an item first
        var newItem = new InventoryItem
        {
            Name = "Existing Item",
            Quantity = 3,
            Category = Category.Medications
        };
        var createResponse = await _client.PostAsJsonAsync("/api/inventory", newItem);
        var createdItem = await createResponse.Content.ReadFromJsonAsync<InventoryItem>();

        // Act
        var response = await _client.GetAsync($"/api/inventory/{createdItem.Id}");

        // Assert
        response.EnsureSuccessStatusCode();
        var item = await response.Content.ReadFromJsonAsync<InventoryItem>();
        Assert.NotNull(item);
        Assert.Equal("Existing Item", item.Name);
    }

    [Fact]
    public async Task GetById_ReturnsNotFound_WhenNotExists()
    {
        // Act
        var response = await _client.GetAsync("/api/inventory/999");

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}