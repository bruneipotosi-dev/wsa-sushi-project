using System.ComponentModel.DataAnnotations;

namespace BlueHarbor.API.Models;

public class ShipProfile
{
    public int Id { get; set; }

    [Required, StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, StringLength(500)]
    public string Notes { get; set; } = string.Empty;
}