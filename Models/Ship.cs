using System.ComponentModel.DataAnnotations;

namespace BlueHarbor.API.Models;

public class Ship
{
    public int Id { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [RegularExpression("^(XL|L|M|S)$", ErrorMessage = "Size must be one of XL, L, M, S.")]
    public string Size { get; set; } = string.Empty; // XL | L | M | S

    [Range(0, 30, ErrorMessage = "ArrivalDay must be between 0 and 30.")]
    public int ArrivalDay { get; set; }

    [Range(3, 15, ErrorMessage = "OccupationDuration must be between 3 and 15 days.")]
    public int OccupationDuration { get; set; }

    [Required]
    [RegularExpression("^(Pending|Assigned|Departed)$", ErrorMessage = "Status must be Pending, Assigned, or Departed.")]
    public string Status { get; set; } = "Pending";

    [StringLength(500)]
    public string? Notes { get; set; }
}
