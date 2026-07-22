using BlueHarbor.API.Data;
using BlueHarbor.API.Models;
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

    [HttpGet]
    public async Task<IActionResult> GetBerths()
    {
        var state = await _db.SystemStates.FirstOrDefaultAsync();
        int currentDay = state?.CurrentDay ?? 1;

        var berths = await _db.Berths
            .Select(b => new
            {
                b.Id,
                b.Name,
                b.Size,
                currentAssignment = _db.Assignments
                    .Where(a => a.BerthId == b.Id
                                && a.StartDay <= currentDay
                                && a.EndDay >= currentDay)
                    .OrderByDescending(a => a.StartDay)
                    .Select(a => new
                    {
                        a.Id,
                        a.StartDay,
                        a.EndDay,
                        shipName = a.Ship != null ? a.Ship.Name : null,
                        shipSize = a.Ship != null ? a.Ship.Size.ToString() : null,
                        shipStatus = a.Ship != null ? a.Ship.Status.ToString() : null
                    })
                    .FirstOrDefault()
            })
            .ToListAsync();

        return Ok(berths);
    }
}