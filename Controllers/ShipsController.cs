using BlueHarbor.API.Data;
using BlueHarbor.API.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlueHarbor.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ShipsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ShipsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetShips([FromQuery] string? status = null)
    {
        var query = _db.Ships.AsQueryable();

        if (!string.IsNullOrEmpty(status))
            query = query.Where(s => s.Status == status);

        var ships = await query.ToListAsync();
        return Ok(ships);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetShipById(int id)
    {
        var ship = await _db.Ships.FindAsync(id);
        return ship is null ? NotFound(new { error = "Ship not found." }) : Ok(ship);
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateShip([FromBody] Ship ship)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        _db.Ships.Add(ship);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetShipById), new { id = ship.Id }, ship);
    }
}
