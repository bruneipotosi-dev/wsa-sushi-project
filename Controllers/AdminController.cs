using BlueHarbor.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BlueHarbor.API.Controllers;

[ApiController]
[Route("api")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminController(AppDbContext db)
    {
        _db = db;
    }

    // POST /api/reset
    [HttpPost("reset")]
    public async Task<IActionResult> Reset()
    {
        using var transaction = await _db.Database.BeginTransactionAsync();
        try
        {
            // 1. Cancella prima le assegnazioni (referenziano le navi)
            _db.Assignments.RemoveRange(_db.Assignments);
            await _db.SaveChangesAsync();

            // 2. Cancella le navi
            _db.Ships.RemoveRange(_db.Ships);
            await _db.SaveChangesAsync();

            // 3. Riporta il giorno corrente a 1
            var state = await _db.SystemStates.FirstAsync();
            state.CurrentDay = 1;
            await _db.SaveChangesAsync();

            await transaction.CommitAsync();

            return Ok(new { message = "Sistema resettato." });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { error = ex.Message });
        }
    }
}