using BlueHarbor.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlueHarbor.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PortLogsController : ControllerBase
{
    private readonly AppDbContext _db;

    public PortLogsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetLogs()
    {
        var logs = await _db.PortLogs
            .OrderByDescending(l => l.Timestamp)
            .ToListAsync();

        return Ok(logs);
    }
}