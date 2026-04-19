using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoryController : ControllerBase
{
    private readonly IInventoryService _inventoryService;

    public InventoryController(IInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var items = await _inventoryService.GetAllItemsAsync();
            return Ok(items);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Failed to retrieve inventory items", details = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var item = await _inventoryService.GetItemByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { error = $"Inventory item with ID {id} not found" });
            }
            return Ok(item);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Failed to retrieve inventory item", details = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] InventoryItem item)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(new { error = "Validation failed", details = errors });
        }

        try
        {
            var createdItem = await _inventoryService.AddItemAsync(item);
            return CreatedAtAction(nameof(GetById), new { id = createdItem.Id }, createdItem);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = "Item already exists", details = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Failed to create inventory item", details = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] InventoryItem item)
    {
        if (id != item.Id)
        {
            return BadRequest(new { error = "ID mismatch", details = "The ID in the URL does not match the ID in the request body" });
        }

        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(new { error = "Validation failed", details = errors });
        }

        try
        {
            var updatedItem = await _inventoryService.UpdateItemAsync(id, item);
            if (updatedItem == null)
            {
                return NotFound(new { error = $"Inventory item with ID {id} not found" });
            }
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Failed to update inventory item", details = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var result = await _inventoryService.DeleteItemAsync(id);
            if (!result)
            {
                return NotFound(new { error = $"Inventory item with ID {id} not found" });
            }
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Failed to delete inventory item", details = ex.Message });
        }
    }
}