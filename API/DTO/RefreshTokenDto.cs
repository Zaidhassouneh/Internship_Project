using System.ComponentModel.DataAnnotations;

namespace API.DTO;

public class RefreshTokenDto
{
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}
