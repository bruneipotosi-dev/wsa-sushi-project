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
        var berths = await _db.Berths.ToListAsync();

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

        return Ok(result);
    }
}