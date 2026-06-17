using System.ComponentModel.DataAnnotations;

namespace BlueHarbor.API.Models;

public class Berth
{
    public int Id { get; set; }

    [Required]
    [StringLength(20, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [RegularExpression("^(XL|L|M|S)$", ErrorMessage = "Size must be one of XL, L, M, S.")]
    public string Size { get; set; } = string.Empty; // XL | L | M | S
}
