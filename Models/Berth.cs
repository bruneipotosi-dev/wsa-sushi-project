using System.ComponentModel.DataAnnotations;

namespace BlueHarbor.API.Models;

public class Berth
{
    public int Id { get; set; }

    [Required]
    [StringLength(20, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EnumDataType(typeof(ShipSize), ErrorMessage = "Size must be one of XL, L, M, S.")]
    public ShipSize Size { get; set; }
}
