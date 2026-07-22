using BlueHarbor.API.Data;
using BlueHarbor.API.Models;

namespace BlueHarbor.API.Services;

public class PortLogService : IPortLogService
{
    private readonly AppDbContext _db;

    public PortLogService(AppDbContext db)
    {
        _db = db;
    }

    public async Task LogAsync(string action, string details, int arrivalDay = 0, int departureDay = 0, int duration = 0)
    {
        try
        {
            var log = new PortLog
            {
                Action = action,
                Details = details,
                Timestamp = DateTime.UtcNow,
                ArrivalDay = arrivalDay,
                DepartureDay = departureDay,
                Duration = duration
            };

            _db.PortLogs.Add(log);
            await _db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            // Il logging non deve mai far fallire l'operazione principale
            Console.WriteLine($"[PortLog Error] {ex.Message}");
        }
    }
}