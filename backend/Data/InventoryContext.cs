using Microsoft.EntityFrameworkCore;
using backend.Models;

namespace backend.Data;

public class InventoryContext : DbContext
{
    public InventoryContext(DbContextOptions<InventoryContext> options) : base(options) { }
    
    public DbSet<InventoryItem> InventoryItems { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure entity relationships and constraints if needed
        base.OnModelCreating(modelBuilder);
    }
}