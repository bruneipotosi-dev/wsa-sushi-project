using BlueHarbor.API.Data;
using BlueHarbor.API.Models;
using Microsoft.AspNetCore.Http;
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

    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAssignments()
    {
        var assignments = await _db.Assignments
            .Include(a => a.Ship)
            .Include(a => a.Berth)
            .ToListAsync();

        return Ok(assignments);
    }

    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAssignmentById(int id)
    {
        var assignment = await _db.Assignments
            .Include(a => a.Ship)
            .Include(a => a.Berth)
            .FirstOrDefaultAsync(a => a.Id == id);

        return assignment is null ? NotFound(new { error = "Assignment not found." }) : Ok(assignment);
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateAssignment([FromBody] Assignment assignment)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        if (assignment.EndDay < assignment.StartDay)
        {
            return BadRequest(new { error = "EndDay must be greater than or equal to StartDay." });
        }

        var shipExists = await _db.Ships.AnyAsync(s => s.Id == assignment.ShipId);
        if (!shipExists)
        {
            return BadRequest(new { error = "ShipId does not refer to an existing ship." });
        }

        var berthExists = await _db.Berths.AnyAsync(b => b.Id == assignment.BerthId);
        if (!berthExists)
        {
            return BadRequest(new { error = "BerthId does not refer to an existing berth." });
        }

        assignment.Ship = null;
        assignment.Berth = null;

        _db.Assignments.Add(assignment);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAssignmentById), new { id = assignment.Id }, assignment);
    }
}
