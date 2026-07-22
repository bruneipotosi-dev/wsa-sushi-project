using BlueHarbor.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlueHarbor.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ShipProfilesController : ControllerBase
{
    private readonly AppDbContext _db;

    public ShipProfilesController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        return Ok(await _db.ShipProfiles.ToListAsync());
    }
}