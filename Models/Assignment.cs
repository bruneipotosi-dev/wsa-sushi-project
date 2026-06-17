using System.ComponentModel.DataAnnotations;

namespace BlueHarbor.API.Models;

public class Assignment
{
    public int Id { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "ShipId must be a positive integer.")]
    public int ShipId { get; set; }

    public Ship? Ship { get; set; }

    [Range(1, int.MaxValue, ErrorMessage = "BerthId must be a positive integer.")]
    public int BerthId { get; set; }

    public Berth? Berth { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "StartDay must be a non-negative integer.")]
    public int StartDay { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "EndDay must be a non-negative integer.")]
    public int EndDay { get; set; }
}
