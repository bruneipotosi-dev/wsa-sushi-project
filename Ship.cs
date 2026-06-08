namespace BlueHarbor.API.Models;

public class Ship
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty; // XL | L | M | S
    public int ArrivalDay { get; set; }
    public int OccupationDuration { get; set; }      // 3–15 giorni
    public string Status { get; set; } = "Pending";  // Pending | Assigned | Departed
    public string? Notes { get; set; }
}