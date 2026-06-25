using BlueHarbor.API.Data;
using BlueHarbor.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlueHarbor.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AssignmentsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AssignmentsController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/assignments
    [HttpGet]
    public async Task<IActionResult> GetAssignments()
    {
        var assignments = await _db.Assignments
            .Include(a => a.Ship)
            .Include(a => a.Berth)
            .ToListAsync();

        return Ok(assignments);
    }

    // GET /api/assignments/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetAssignmentById(int id)
    {
        var assignment = await _db.Assignments
            .Include(a => a.Ship)
            .Include(a => a.Berth)
            .FirstOrDefaultAsync(a => a.Id == id);

        return assignment is null
            ? NotFound(new { error = "Assignment non trovato." })
            : Ok(assignment);
    }

    // POST /api/assignments
    [HttpPost]
    public async Task<IActionResult> CreateAssignment([FromBody] AssignmentRequest request)
    {
        // STEP 1 — Carica la nave
        var ship = await _db.Ships.FindAsync(request.ShipId);
        if (ship is null)
            return BadRequest(new { error = "Nave non trovata." });

        // STEP 2 — Carica la banchina
        var berth = await _db.Berths.FindAsync(request.BerthId);
        if (berth is null)
            return BadRequest(new { error = "Banchina non trovata." });

        // STEP 3 — Verifica che la nave sia ancora Pending
        if (ship.Status != "Pending")
            return BadRequest(new { error = $"La nave è già in stato '{ship.Status}'." });

        // STEP 4 — Verifica compatibilità dimensione
        if (ship.Size != berth.Size)
            return BadRequest(new
            {
                error = $"Dimensione incompatibile: nave {ship.Size}, banchina {berth.Size}."
            });

        // STEP 5 — Leggi il giorno corrente
     int currentDay = 1;

        // STEP 6 — FindFirstFreeSlot
        int lastEndDay = await _db.Assignments
            .Where(a => a.BerthId == request.BerthId)
            .MaxAsync(a => (int?)a.EndDay) ?? (currentDay - 1);

        int firstFreeDay = Math.Max(currentDay, lastEndDay + 1);
        int startDay     = Math.Max(ship.ArrivalDay, firstFreeDay);
        int endDay       = startDay + ship.OccupationDuration - 1;

        // STEP 7 — Salva assignment e aggiorna stato nave
        var assignment = new Assignment
        {
            ShipId   = ship.Id,
            BerthId  = berth.Id,
            StartDay = startDay,
            EndDay   = endDay
        };

        ship.Status = "Assigned";

        _db.Ships.Update(ship);
        _db.Assignments.Add(assignment);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAssignmentById), new { id = assignment.Id }, new
        {
            assignment.Id,
            assignment.ShipId,
            assignment.BerthId,
            assignment.StartDay,
            assignment.EndDay,
            shipName  = ship.Name,
            shipSize  = ship.Size,
            berthName = berth.Name
        });
    }
}

// DTO per la richiesta
public record AssignmentRequest(int ShipId, int BerthId);
