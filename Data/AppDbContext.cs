using BlueHarbor.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BlueHarbor.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Ship> Ships => Set<Ship>();
    public DbSet<Berth> Berths => Set<Berth>();
    public DbSet<Assignment> Assignments => Set<Assignment>();
    public DbSet<SystemState> SystemStates => Set<SystemState>();
    
    public DbSet<PortLog> PortLogs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Ship>()
            .Property(s => s.Size)
            .HasConversion<string>();

        modelBuilder.Entity<Ship>()
            .Property(s => s.Status)
            .HasConversion<string>();

        modelBuilder.Entity<Berth>()
            .Property(b => b.Size)
            .HasConversion<string>();

        modelBuilder.Entity<Berth>().HasData(
            new Berth { Id = 1, Name = "XL-1", Size = ShipSize.XL },
            new Berth { Id = 2, Name = "L-1",  Size = ShipSize.L  },
            new Berth { Id = 3, Name = "M-1",  Size = ShipSize.M  },
            new Berth { Id = 4, Name = "M-2",  Size = ShipSize.M  },
            new Berth { Id = 5, Name = "S-1",  Size = ShipSize.S  },
            new Berth { Id = 6, Name = "S-2",  Size = ShipSize.S  },
            new Berth { Id = 7, Name = "S-3",  Size = ShipSize.S  },
            new Berth { Id = 8, Name = "S-4",  Size = ShipSize.S  }
        );

<<<<<<< Updated upstream
        modelBuilder.Entity<SystemState>().HasData(
            new SystemState { Id = 1, CurrentDay = 1 }
        );

        modelBuilder.Entity<Assignment>()
            .HasIndex(a => new { a.BerthId, a.StartDay, a.EndDay })
            .HasDatabaseName("IX_Assignments_BerthId_StartDay_EndDay");

        modelBuilder.Entity<Assignment>()
            .HasIndex(a => a.ShipId)
            .HasDatabaseName("IX_Assignments_ShipId");

        modelBuilder.Entity<Ship>()
            .HasIndex(s => s.Status)
            .HasDatabaseName("IX_Ships_Status");

        modelBuilder.Entity<Ship>()
            .HasIndex(s => s.ArrivalDay)
            .HasDatabaseName("IX_Ships_ArrivalDay");

=======

        // NOTA DI DESIGN: Questo indice UNIQUE garantisce l'unicità solo per duplicati ESATTI dello slot temporale
        // (stessa banchina, stesso giorno d'inizio e stessa fine). Non previene la sovrapposizione parziale 
        // o l'overlap temporale (es. giorno 5-10 e giorno 7-12 sulla stessa banchina). 
        // La reale prevenzione degli overlap temporali è delegata alla logica applicativa (a livello di codice) 
        // dentro 'AssignmentService.AssignShipToBerthAsync' tramite controlli transazionali con AnyAsync.
>>>>>>> Stashed changes
        modelBuilder.Entity<Assignment>()
            .HasIndex(a => new { a.BerthId, a.StartDay, a.EndDay })
            .IsUnique()
            .HasDatabaseName("UX_Assignments_BerthId_StartDay_EndDay");
    }
}
