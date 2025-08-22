using API.Data;
using API.DTO;
using API.Entites;
using API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly TokenService _tokenService;
    private readonly PasswordService _passwordService;
    private readonly AppDbContext _context;

    public AuthController(TokenService tokenService, PasswordService passwordService, AppDbContext context)
    {
        _tokenService = tokenService;
        _passwordService = passwordService;
        _context = context;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto registerDto)
    {
        // Check if user already exists
        if (await _context.Users.AnyAsync(u => u.Email.ToLower() == registerDto.Email.ToLower()))
        {
            return BadRequest("User with this email already exists");
        }

        // Create password hash
        var (passwordHash, passwordSalt) = _passwordService.CreatePasswordHash(registerDto.Password);

        // Generate refresh token
        var refreshToken = _tokenService.GenerateRefreshToken();
        var refreshTokenExpiry = DateTime.UtcNow.AddDays(7);

        // Create new user
        var user = new AppUser
        {
            DisplayName = registerDto.DisplayName,
            Email = registerDto.Email.ToLower(),
            PasswordHash = passwordHash,
            PasswordSalt = passwordSalt,
            RefreshToken = refreshToken,
            RefreshTokenExpiryTime = refreshTokenExpiry
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Generate token
        var token = _tokenService.CreateToken(user);

        var response = new AuthResponseDto
        {
            Token = token,
            RefreshToken = refreshToken,
            RefreshTokenExpiry = refreshTokenExpiry,
            User = new UserDto
            {
                Id = user.Id,
                DisplayName = user.DisplayName,
                Email = user.Email,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt
            },
            ExpiresAt = DateTime.UtcNow.AddMinutes(15)
        };

        return Ok(response);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(LoginDto loginDto)
    {
        // Find user by email
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == loginDto.Email.ToLower());

        if (user == null)
        {
            return Unauthorized("Invalid email or password");
        }

        // Verify password
        if (!_passwordService.VerifyPasswordHash(loginDto.Password, user.PasswordHash, user.PasswordSalt))
        {
            return Unauthorized("Invalid email or password");
        }

        // Update last login
        user.LastLoginAt = DateTime.UtcNow;

        // Generate new refresh token
        user.RefreshToken = _tokenService.GenerateRefreshToken();
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _context.SaveChangesAsync();

        // Generate token
        var token = _tokenService.CreateToken(user);

        var response = new AuthResponseDto
        {
            Token = token,
            RefreshToken = user.RefreshToken,
            RefreshTokenExpiry = user.RefreshTokenExpiryTime ?? DateTime.UtcNow.AddDays(7),
            User = new UserDto
            {
                Id = user.Id,
                DisplayName = user.DisplayName,
                Email = user.Email,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt
            },
            ExpiresAt = DateTime.UtcNow.AddMinutes(15)
        };

        return Ok(response);
    }

    [HttpPost("logout")]
public async Task<IActionResult> Logout([FromBody] string refreshToken)
{
    if (string.IsNullOrEmpty(refreshToken))
    {
        return BadRequest("Refresh token is required");
    }

    var user = await _context.Users
        .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);

    if (user == null)
    {
        return NotFound("User not found or already logged out");
    }

    // Invalidate the refresh token
    user.RefreshToken = null;
    user.RefreshTokenExpiryTime = null;

    await _context.SaveChangesAsync();

    return Ok(new { message = "Logged out successfully" });
}

}