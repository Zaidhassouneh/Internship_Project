namespace API.DTO;

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime RefreshTokenExpiry { get; set; }
    public UserDto User { get; set; } = new();
    public DateTime ExpiresAt { get; set; }
}