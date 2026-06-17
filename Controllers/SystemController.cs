using BlueHarbor.API.Data;
using Microsoft.AspNetCore.Http;
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
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetDay()
    {
        var currentDay = await _db.Ships.MaxAsync(s => (int?)s.ArrivalDay) ?? 0;
        return Ok(new { currentDay });
    }

    [HttpPost("advance-day")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> AdvanceDay()
    {
        // Placeholder: implement business logic reale per avanzare il giorno virtuale
        return Ok(new { message = "Advance day endpoint is available." });
    }
}
