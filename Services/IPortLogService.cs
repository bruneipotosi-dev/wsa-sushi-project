using BlueHarbor.API.Models;

namespace BlueHarbor.API.Services;

public interface IPortLogService
{
    Task LogAsync(string action, string details, int arrivalDay = 0, int departureDay = 0, int duration = 0);
}