using BlueHarbor.API.Data;
using BlueHarbor.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BlueHarbor.API.Services;

public class AssignmentService : IAssignmentService
{
    private readonly AppDbContext _db;

    public AssignmentService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Assignment> AssignShipToBerthAsync(int shipId, int berthId)
    {
        // 1. Carica nave
        var ship = await _db.Ships.FindAsync(shipId);
        if (ship is null)
            throw new ArgumentException("Nave non trovata.");

        // 2. Carica banchina
        var berth = await _db.Berths.FindAsync(berthId);
        if (berth is null)
            throw new ArgumentException("Banchina non trovata.");

        // 3. Validazioni
        if (ship.Status != "Pending")
            throw new InvalidOperationException($"La nave è già in stato '{ship.Status}'.");

        if (ship.Size != berth.Size)
            throw new InvalidOperationException($"Dimensione incompatibile: nave {ship.Size}, banchina {berth.Size}.");

        // 4. Leggi giorno corrente
        var state = await _db.SystemStates.FirstAsync();
        int currentDay = state.CurrentDay;

        // 5. Transazione serializzabile
        await using var tx = await _db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);

        try
        {
            // 6. Calcola primo slot libero
            int lastEndDay = await _db.Assignments
                .Where(a => a.BerthId == berthId)
                .MaxAsync(a => (int?)a.EndDay) ?? (currentDay - 1);

            int firstFreeDay = Math.Max(currentDay, lastEndDay + 1);
            int startDay = Math.Max(ship.ArrivalDay, firstFreeDay);
            int endDay = startDay + ship.OccupationDuration - 1;

            // 7. Verifica overlap
            bool overlap = await _db.Assignments.AnyAsync(a =>
                a.BerthId == berthId &&
                startDay <= a.EndDay && endDay >= a.StartDay);

            if (overlap)
                throw new InvalidOperationException("La banchina è già occupata in quella finestra temporale.");

            // 8. Crea assignment
            var assignment = new Assignment
            {
                ShipId = ship.Id,
                BerthId = berth.Id,
                StartDay = startDay,
                EndDay = endDay
            };

            ship.Status = "Assigned";

            _db.Ships.Update(ship);
            _db.Assignments.Add(assignment);
            await _db.SaveChangesAsync();
            await tx.CommitAsync();

            return assignment;
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }
}