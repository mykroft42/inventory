using Xunit;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Json;
using backend.Data;
using backend.Models;
using System.Net;

namespace backend.Tests;

public class InventoryControllerTests : IClassFixture<CustomWebApplicationFactory>, IAsyncLifetime
{
    private readonly HttpClient _client;
    private readonly CustomWebApplicationFactory _factory;

    public InventoryControllerTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }

    public Task InitializeAsync() { _factory.ResetDatabase(); return Task.CompletedTask; }
    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task GetAll_ReturnsEmptyList_WhenNoItems()
    {
        var response = await _client.GetAsync("/api/inventory");
        response.EnsureSuccessStatusCode();
        var items = await response.Content.ReadFromJsonAsync<List<InventoryItem>>();
        Assert.NotNull(items);
        Assert.Empty(items);
    }

    [Fact]
    public async Task Create_ReturnsCreatedItem()
    {
        var newItem = new { Name = "Test Item Baseline", Quantity = 5, Category = 0 };
        var response = await _client.PostAsJsonAsync("/api/inventory", newItem);
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var createdItem = await response.Content.ReadFromJsonAsync<InventoryItem>();
        Assert.NotNull(createdItem);
        Assert.Equal("Test Item Baseline", createdItem.Name);
        Assert.True(createdItem.Id > 0);
    }

    [Fact]
    public async Task GetById_ReturnsItem_WhenExists()
    {
        var newItem = new { Name = "GetById Item", Quantity = 3, Category = 1 };
        var createResponse = await _client.PostAsJsonAsync("/api/inventory", newItem);
        var createdItem = await createResponse.Content.ReadFromJsonAsync<InventoryItem>();
        Assert.NotNull(createdItem);

        var response = await _client.GetAsync($"/api/inventory/{createdItem.Id}");
        response.EnsureSuccessStatusCode();
        var item = await response.Content.ReadFromJsonAsync<InventoryItem>();
        Assert.NotNull(item);
        Assert.Equal("GetById Item", item.Name);
    }

    [Fact]
    public async Task GetById_ReturnsNotFound_WhenNotExists()
    {
        var response = await _client.GetAsync("/api/inventory/99999");
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    // --- Soft-delete (T005) ---

    [Fact]
    public async Task Delete_SoftDeletesItem_ItemAbsentFromGetAll()
    {
        var newItem = new { Name = "Delete Test Item", Quantity = 1, Category = 0 };
        var createResp = await _client.PostAsJsonAsync("/api/inventory", newItem);
        var created = await createResp.Content.ReadFromJsonAsync<InventoryItem>();
        Assert.NotNull(created);

        var deleteResp = await _client.DeleteAsync($"/api/inventory/{created.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResp.StatusCode);

        var allResp = await _client.GetAsync("/api/inventory");
        var items = await allResp.Content.ReadFromJsonAsync<List<InventoryItem>>();
        Assert.NotNull(items);
        Assert.DoesNotContain(items, i => i.Id == created.Id);
    }

    // --- Restore (T006) ---

    [Fact]
    public async Task Restore_ReturnsRestoredItem_AndItemAppearsInGetAll()
    {
        var newItem = new { Name = "Restore Test Item", Quantity = 2, Category = 0 };
        var createResp = await _client.PostAsJsonAsync("/api/inventory", newItem);
        var created = await createResp.Content.ReadFromJsonAsync<InventoryItem>();
        Assert.NotNull(created);

        await _client.DeleteAsync($"/api/inventory/{created.Id}");

        var restoreResp = await _client.PatchAsync($"/api/inventory/{created.Id}/restore", null);
        Assert.Equal(HttpStatusCode.OK, restoreResp.StatusCode);
        var restored = await restoreResp.Content.ReadFromJsonAsync<InventoryItem>();
        Assert.NotNull(restored);
        Assert.Null(restored.DeletedAt);

        var allResp = await _client.GetAsync("/api/inventory");
        var items = await allResp.Content.ReadFromJsonAsync<List<InventoryItem>>();
        Assert.NotNull(items);
        Assert.Contains(items, i => i.Id == created.Id);
    }

    [Fact]
    public async Task Restore_IsIdempotent_OnActiveItem()
    {
        var newItem = new { Name = "Idempotent Restore Item", Quantity = 1, Category = 0 };
        var createResp = await _client.PostAsJsonAsync("/api/inventory", newItem);
        var created = await createResp.Content.ReadFromJsonAsync<InventoryItem>();
        Assert.NotNull(created);

        var restoreResp = await _client.PatchAsync($"/api/inventory/{created.Id}/restore", null);
        Assert.Equal(HttpStatusCode.OK, restoreResp.StatusCode);
    }
}
