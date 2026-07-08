using BlueHarbor.API.Data;
using BlueHarbor.API.Models;
using BlueHarbor.API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlueHarbor.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AssignmentsController : ControllerBase
{
    private readonly IAssignmentService _assignmentService;
    private readonly AppDbContext _db;

    public AssignmentsController(IAssignmentService assignmentService, AppDbContext db)
    {
        _assignmentService = assignmentService;
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAssignments()
    {
        var assignments = await _db.Assignments
            .Include(a => a.Ship)
            .Include(a => a.Berth)
            .ToListAsync();
        return Ok(assignments);
    }

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

    [HttpPost]
    public async Task<IActionResult> CreateAssignment([FromBody] AssignmentRequest request)
    {
        try
        {
            var assignment = await _assignmentService.AssignShipToBerthAsync(request.ShipId, request.BerthId);
            var fullAssignment = await _db.Assignments
                .Include(a => a.Ship)
                .Include(a => a.Berth)
                .FirstAsync(a => a.Id == assignment.Id);

            var shipName = fullAssignment.Ship?.Name ?? "Nave sconosciuta";
            var shipSize = fullAssignment.Ship?.Size ?? "?";
            var berthName = fullAssignment.Berth?.Name ?? "Banchina sconosciuta";

            return CreatedAtAction(nameof(GetAssignmentById), new { id = assignment.Id }, new
            {
                fullAssignment.Id,
                fullAssignment.ShipId,
                fullAssignment.BerthId,
                fullAssignment.StartDay,
                fullAssignment.EndDay,
                shipName,
                shipSize,
                berthName
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
        catch
        {
            return StatusCode(500, new { error = "Errore interno del server." });
        }
    }
}

public record AssignmentRequest(int ShipId, int BerthId);