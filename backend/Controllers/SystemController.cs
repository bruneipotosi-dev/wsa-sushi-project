using BlueHarbor.API.Data;
using BlueHarbor.API.Models;
using BlueHarbor.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlueHarbor.API.Controllers;

[ApiController]
[Route("api")]
public class SystemController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IPortLogService _logService;

    public SystemController(AppDbContext db, IPortLogService logService)
    {
        _db = db;
        _logService = logService;
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

        var overduePendingCount = await _db.Ships
            .CountAsync(s => s.Status == ShipStatus.Pending && s.ArrivalDay < state.CurrentDay);

        var assignmentsEnded = await _db.Assignments
            .Include(a => a.Ship)
            .Where(a => a.EndDay < state.CurrentDay
                     && a.Ship!.Status == ShipStatus.Assigned)
            .ToListAsync();

        foreach (var assignment in assignmentsEnded)
        {
            assignment.Ship!.Status = ShipStatus.Departed;

            var duration = assignment.EndDay - assignment.StartDay + 1;
            await _logService.LogAsync(
                "Departed",
                $"{assignment.Ship!.Name} (ID: {assignment.ShipId}) partita da banchina {assignment.BerthId}",
                arrivalDay: assignment.Ship.ArrivalDay,
                departureDay: assignment.EndDay,
                duration: duration
            );
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
            }),
            warning = overduePendingCount > 0
                ? $"{overduePendingCount} navi in attesa con arrivo già passato."
                : null
        });
    }
}