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
        // ─── SEED BANCHINE ────────────────────────────────────────────────
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

        // ─── SEED GIORNO VIRTUALE ──────────────────────────────────────────
        modelBuilder.Entity<SystemState>().HasData(
            new SystemState { Id = 1, CurrentDay = 1 }
        );

        // ─── INDICI E VINCOLI ──────────────────────────────────────────────

        // 1. Indice composto su Assignment per velocizzare la ricerca del primo slot libero
        modelBuilder.Entity<Assignment>()
            .HasIndex(a => new { a.BerthId, a.StartDay, a.EndDay })
            .HasDatabaseName("IX_Assignments_BerthId_StartDay_EndDay");

        // 2. Indice su ShipId per JOIN veloci
        modelBuilder.Entity<Assignment>()
            .HasIndex(a => a.ShipId)
            .HasDatabaseName("IX_Assignments_ShipId");

        // 3. Indice su Status per filtrare navi Pending/Assigned/Departed
        modelBuilder.Entity<Ship>()
            .HasIndex(s => s.Status)
            .HasDatabaseName("IX_Ships_Status");

        // 4. (Opzionale) Indice su ArrivalDay per eventuali query temporali
        modelBuilder.Entity<Ship>()
            .HasIndex(s => s.ArrivalDay)
            .HasDatabaseName("IX_Ships_ArrivalDay");

        // 5. (Opzionale) Vincolo UNIQUE su (BerthId, StartDay, EndDay) — 
        //    Previene duplicati esatti, ma non previene overlap parziale.
        //    La logica applicativa (transazione serializzabile) è il vero baluardo.
        modelBuilder.Entity<Assignment>()
            .HasIndex(a => new { a.BerthId, a.StartDay, a.EndDay })
            .IsUnique()
            .HasDatabaseName("UX_Assignments_BerthId_StartDay_EndDay");
    }
}
