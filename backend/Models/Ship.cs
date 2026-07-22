using System.ComponentModel.DataAnnotations;

namespace BlueHarbor.API.Models;

public class Ship
{
    public int Id { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EnumDataType(typeof(ShipSize), ErrorMessage = "Size must be one of XL, L, M, S.")]
    public ShipSize Size { get; set; }

    [Range(0, 100000, ErrorMessage = "ArrivalDay must be a positive number.")]
    public int ArrivalDay { get; set; }

    [Range(3, 15, ErrorMessage = "OccupationDuration must be between 3 and 15 days.")]
    public int OccupationDuration { get; set; }

    [Required]
    [EnumDataType(typeof(ShipStatus), ErrorMessage = "Status must be Pending, Assigned, or Departed.")]
    public ShipStatus Status { get; set; }

    [StringLength(500)]
    public string? Notes { get; set; }
}
