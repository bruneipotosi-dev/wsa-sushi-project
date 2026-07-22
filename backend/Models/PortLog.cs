namespace BlueHarbor.API.Models;

public class PortLog
{
    public int Id { get; set; }
    public string Action { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    // Proprietà aggiunte per il controller
    public int DepartureDay { get; set; } = 0;
    public int ArrivalDay { get; set; } = 0;
    public int Duration { get; set; } = 0;
}