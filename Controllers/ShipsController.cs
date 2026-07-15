using BlueHarbor.API.Data;
using BlueHarbor.API.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace BlueHarbor.API.Controllers;

/// <summary>DTO per aggiornare nome e note di una nave.</summary>
public class UpdateShipDto
{
    [Required, StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [StringLength(500)]
    public string? Notes { get; set; }
}

[ApiController]
[Route("api/[controller]")]
public class ShipsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ShipsController(AppDbContext db)
    {
        _db = db;
    }

    // ─── GET ALL ──────────────────────────────────────────────────────────────

    /// <summary>Recupera tutte le navi, opzionalmente filtrate per stato.</summary>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetShips([FromQuery] ShipStatus? status = null)
    {
        var query = _db.Ships.AsQueryable();

        if (status.HasValue)
            query = query.Where(s => s.Status == status.Value);

        var ships = await query.ToListAsync();
        return Ok(ships);
    }

    // ─── GET BY ID ────────────────────────────────────────────────────────────

    /// <summary>Recupera una nave per ID.</summary>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetShipById(int id)
    {
        var ship = await _db.Ships.FindAsync(id);
        return ship is null
            ? NotFound(new { error = "Nave non trovata." })
            : Ok(ship);
    }

    // ─── CREATE ──────────────────────────────────────────────────────────────

    /// <summary>Crea una nuova nave (stato iniziale Pending).</summary>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateShip([FromBody] Ship ship)
    {
        if (!ModelState.IsValid)
            return ValidationProblem(ModelState);

        // Forza lo stato a Pending (sicurezza)
        ship.Status = ShipStatus.Pending;

        _db.Ships.Add(ship);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetShipById), new { id = ship.Id }, ship);
    }

    // ─── UPDATE ──────────────────────────────────────────────────────────────

    /// <summary>Aggiorna nome e note di una nave (solo se in stato Pending).</summary>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateShip(int id, [FromBody] UpdateShipDto dto)
    {
        // 1. Validazione del DTO
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();
            return BadRequest(new { errors });
        }

        // 2. Cerca la nave
        var ship = await _db.Ships.FindAsync(id);
        if (ship is null)
            return NotFound(new { error = "Nave non trovata." });

        // 3. Controllo di stato (solo Pending può essere modificata)
        if (ship.Status != ShipStatus.Pending)
            return BadRequest(new { error = $"Impossibile modificare una nave in stato '{ship.Status}'." });

        // 4. Aggiorna i campi consentiti
        ship.Name = dto.Name;
        ship.Notes = dto.Notes;

        await _db.SaveChangesAsync();

        return Ok(ship);
    }

    // ─── DELETE ──────────────────────────────────────────────────────────────

    /// <summary>Elimina una nave (solo se in stato Pending).</summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> DeleteShip(int id)
    {
        var ship = await _db.Ships.FindAsync(id);
        if (ship is null)
            return NotFound(new { error = "Nave non trovata." });

        if (ship.Status != ShipStatus.Pending)
            return Conflict(new { error = "Si può cancellare solo una nave ancora in attesa." });

        _db.Ships.Remove(ship);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}