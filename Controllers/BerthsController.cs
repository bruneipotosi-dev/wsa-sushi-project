using BlueHarbor.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlueHarbor.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BerthsController : ControllerBase
{
    private readonly AppDbContext _db;

    public BerthsController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/berths
    [HttpGet]
    public async Task<IActionResult> GetBerths()
    {
        // 1. Recuperiamo prima di tutto il giorno corrente virtuale del porto
        var systemState = await _db.SystemStates.FirstOrDefaultAsync();
        int currentDay = systemState?.CurrentDay ?? 1;

<<<<<<< Updated upstream
        var assignments = await _db.Assignments
            .Include(a => a.Ship)
            .ToListAsync();

        // Calcola il giorno corrente
        var state = await _db.SystemStates.FirstOrDefaultAsync();
        int currentDay = state?.CurrentDay ?? 1;

        var result = berths.Select(b =>
        {
            var currentAssignment = assignments
                .Where(a => a.BerthId == b.Id)
                .OrderByDescending(a => a.StartDay)
                .FirstOrDefault(a => a.StartDay <= currentDay && a.EndDay >= currentDay);

            return new
            {
                b.Id,
                b.Name,
                Size = b.Size.ToString(),
                currentAssignment = currentAssignment == null ? null : new
                {
                    currentAssignment.Id,
                    currentAssignment.StartDay,
                    currentAssignment.EndDay,
                    shipName = currentAssignment.Ship?.Name,
                    shipSize = currentAssignment.Ship?.Size.ToString(),
                    shipStatus = currentAssignment.Ship?.Status.ToString()
                }
            };
        });
=======
        // 2. Costruiamo un'unica query SQL efficiente tramite LINQ-to-SQL.
        var result = await _db.Berths
            .Select(b => new
            {
                b.Id,
                b.Name,
                b.Size,
                // Cerchiamo l'assegnazione attiva oggi per questa specifica banchina
                currentAssignment = _db.Assignments
                    .Where(a => a.BerthId == b.Id && a.StartDay <= currentDay && currentDay <= a.EndDay)
                    .Select(a => new
                    {
                        a.Id,
                        a.StartDay,
                        a.EndDay,
                        shipName   = a.Ship!.Name,
                        shipSize   = a.Ship.Size,
                        shipStatus = a.Ship.Status
                    })
                    .FirstOrDefault() // Prende l'unica attiva oggi, altrimenti null
            })
            .ToListAsync(); // Esegue una sola query SQL sul database!
>>>>>>> Stashed changes

        return Ok(result);
    }
}