using API.Data;
using API.DTO;
using API.Entites;
using API.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

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

        // Create new user
        var user = new AppUser
        {
            DisplayName = registerDto.DisplayName,
            Email = registerDto.Email.ToLower(),
            PasswordHash = passwordHash,
            PasswordSalt = passwordSalt
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Generate both tokens
        var accessToken = _tokenService.CreateAccessToken(user);
        var refreshToken = _tokenService.CreateRefreshToken(user);

        var response = new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            User = new UserDto
            {
                Id = user.Id,
                DisplayName = user.DisplayName,
                Email = user.Email,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt
            },
            AccessTokenExpiresAt = DateTime.UtcNow.AddMinutes(15),
            RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(7)
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
        await _context.SaveChangesAsync();

        // Generate both tokens
        var accessToken = _tokenService.CreateAccessToken(user);
        var refreshToken = _tokenService.CreateRefreshToken(user);

        var response = new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            User = new UserDto
            {
                Id = user.Id,
                DisplayName = user.DisplayName,
                Email = user.Email,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt
            },
            AccessTokenExpiresAt = DateTime.UtcNow.AddMinutes(15),
            RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(7)
        };

        return Ok(response);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponseDto>> Refresh(RefreshTokenDto refreshTokenDto)
    {
        // Validate refresh token
        var principal = _tokenService.ValidateToken(refreshTokenDto.RefreshToken);
        if (principal == null)
        {
            return Unauthorized("Invalid refresh token");
        }

        // Check if it's a refresh token
        var tokenType = principal.FindFirst("tokenType")?.Value;
        if (tokenType != "refresh")
        {
            return Unauthorized("Invalid token type");
        }

        // Get user ID from token
        var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized("Invalid token");
        }

        // Find user in database
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
        {
            return Unauthorized("User not found");
        }

        // Generate new tokens
        var accessToken = _tokenService.CreateAccessToken(user);
        var refreshToken = _tokenService.CreateRefreshToken(user);

        var response = new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            User = new UserDto
            {
                Id = user.Id,
                DisplayName = user.DisplayName,
                Email = user.Email,
                CreatedAt = user.CreatedAt,
                LastLoginAt = user.LastLoginAt
            },
            AccessTokenExpiresAt = DateTime.UtcNow.AddMinutes(15),
            RefreshTokenExpiresAt = DateTime.UtcNow.AddDays(7)
        };

        return Ok(response);
    }
}