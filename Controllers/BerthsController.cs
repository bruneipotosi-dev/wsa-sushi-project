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

    [HttpGet]
    public async Task<IActionResult> GetBerths()
    {
        var berths = await _db.Berths.ToListAsync();

        var assignments = await _db.Assignments
            .Include(a => a.Ship)
            .ToListAsync();

        var result = berths.Select(b => new
        {
            b.Id,
            b.Name,
            b.Size,
            currentAssignment = assignments
                .Where(a => a.BerthId == b.Id)
                .OrderByDescending(a => a.StartDay)
                .Select(a => new
                {
                    a.Id,
                    a.StartDay,
                    a.EndDay,
                    shipName   = a.Ship!.Name,
                    shipSize   = a.Ship.Size,
                    shipStatus = a.Ship.Status
                })
                .FirstOrDefault()
        });

        return Ok(result);
    }
}