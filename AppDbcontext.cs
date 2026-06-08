using BlueHarbor.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BlueHarbor.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Ship> Ships => Set<Ship>();
    public DbSet<Berth> Berths => Set<Berth>();
    public DbSet<Assignment> Assignments => Set<Assignment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Seed delle banchine fisse di BlueHarbor
        modelBuilder.Entity<Berth>().HasData(
            new Berth { Id = 1, Name = "XL-1", Size = "XL" },
            new Berth { Id = 2, Name = "L-1",  Size = "L"  },
            new Berth { Id = 3, Name = "M-1",  Size = "M"  },
            new Berth { Id = 4, Name = "M-2",  Size = "M"  },
            new Berth { Id = 5, Name = "S-1",  Size = "S"  },
            new Berth { Id = 6, Name = "S-2",  Size = "S"  },
            new Berth { Id = 7, Name = "S-3",  Size = "S"  },
            new Berth { Id = 8, Name = "S-4",  Size = "S"  }
        );
    }
}