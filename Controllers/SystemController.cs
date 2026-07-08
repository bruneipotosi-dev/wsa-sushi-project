using BlueHarbor.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
}