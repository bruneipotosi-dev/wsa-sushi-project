namespace BlueHarbor.API.Models;

public class Assignment
{
    public int Id { get; set; }
    public int ShipId { get; set; }
    public Ship Ship { get; set; } = null!;
    public int BerthId { get; set; }
    public Berth Berth { get; set; } = null!;
    public int StartDay { get; set; }
    public int EndDay { get; set; }
}