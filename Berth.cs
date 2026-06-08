namespace BlueHarbor.API.Models;

public class Berth
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty; // XL | L | M | S
}