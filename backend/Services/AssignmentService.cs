using BlueHarbor.API.Data;
using BlueHarbor.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BlueHarbor.API.Services;

public class AssignmentService : IAssignmentService
{
    private readonly AppDbContext _db;
    private readonly IPortLogService _logService;

    public AssignmentService(AppDbContext db, IPortLogService logService)
    {
        _db = db;
        _logService = logService;
    }

    public async Task<Assignment> AssignShipToBerthAsync(int shipId, int berthId)
    {
        var ship = await _db.Ships.FindAsync(shipId);
        if (ship is null)
            throw new ArgumentException("Nave non trovata.");

        var berth = await _db.Berths.FindAsync(berthId);
        if (berth is null)
            throw new ArgumentException("Banchina non trovata.");

        if (ship.Status != ShipStatus.Pending)
            throw new InvalidOperationException($"La nave è già in stato '{ship.Status}'.");

        if (ship.Size != berth.Size)
            throw new InvalidOperationException($"Dimensione incompatibile: nave {ship.Size}, banchina {berth.Size}.");

        var state = await _db.SystemStates.FirstAsync();
        int currentDay = state.CurrentDay;

        await using var tx = await _db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);

        try
        {
            int lastEndDay = await _db.Assignments
                .Where(a => a.BerthId == berthId)
                .MaxAsync(a => (int?)a.EndDay) ?? (currentDay - 1);

            int firstFreeDay = Math.Max(currentDay, lastEndDay + 1);
            int startDay = Math.Max(ship.ArrivalDay, firstFreeDay);
            int endDay = startDay + ship.OccupationDuration - 1;

            bool overlap = await _db.Assignments.AnyAsync(a =>
                a.BerthId == berthId &&
                startDay <= a.EndDay && endDay >= a.StartDay);

            if (overlap)
                throw new InvalidOperationException("La banchina è già occupata in quella finestra temporale.");

            var assignment = new Assignment
            {
                ShipId = ship.Id,
                BerthId = berth.Id,
                StartDay = startDay,
                EndDay = endDay
            };

            ship.Status = ShipStatus.Assigned;

            _db.Ships.Update(ship);
            _db.Assignments.Add(assignment);
            await _db.SaveChangesAsync();
            await tx.CommitAsync();

            // ─── LOGGING ──────────────────────────────────────────────
            await _logService.LogAsync(
                "Assigned",
                $"{ship.Name} (ID: {ship.Id}) assegnata a {berth.Name} (ID: {berth.Id})",
                arrivalDay: ship.ArrivalDay,
                departureDay: endDay,
                duration: ship.OccupationDuration
            );

            return assignment;
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }
}