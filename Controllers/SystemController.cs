using BlueHarbor.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BlueHarbor.API.Models;

namespace BlueHarbor.API.Controllers;

[ApiController]
[Route("api")]
public class SystemController : ControllerBase
{
    private readonly AppDbContext _db;

    public SystemController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("day")]
    public async Task<IActionResult> GetDay()
    {
        var state = await _db.SystemStates.FirstAsync();
        return Ok(new { currentDay = state.CurrentDay });
    }

    [HttpPost("advance-day")]
    public async Task<IActionResult> AdvanceDay()
    {
        var state = await _db.SystemStates.FirstAsync();
        state.CurrentDay++;

        var assignmentsEnded = await _db.Assignments
            .Include(a => a.Ship)
            .Where(a => a.EndDay < state.CurrentDay
                && a.Ship!.Status == "Assigned")
            .ToListAsync();

        foreach (var assignment in assignmentsEnded)
        {
            assignment.Ship!.Status = "Departed";
        }

        await _db.SaveChangesAsync();

        return Ok(new
        {
            newDay = state.CurrentDay,
            departedCount = assignmentsEnded.Count,
            departedShips = assignmentsEnded.Select(a => new
            {
                shipId = a.ShipId,
                shipName = a.Ship!.Name
            })
        });
    }

    [HttpPost("reset")]
    public async Task<IActionResult> Reset()
    {
        _db.Assignments.RemoveRange(_db.Assignments);
        _db.Ships.RemoveRange(_db.Ships);
        var state = await _db.SystemStates.FirstAsync();
        state.CurrentDay = 1;
        await _db.SaveChangesAsync();
        return Ok(new { message = "Sistema resettato." });
    }

    [HttpPost("history")]
    public async Task<IActionResult> SavePortLog([FromBody] PortLog log)
    {
        // Sicurezza: la partenza non può essere prima dell'arrivo
        if (log.DepartureDay < log.ArrivalDay)
        {
            return BadRequest("Il giorno di partenza non può essere precedente al giorno di arrivo.");
        }

        // Salviamo nel database
        _db.PortLogs.Add(log);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Registro di sosta salvato con successo nello storico!",
            durataCalcolata = log.Duration
        });
    }
}