using System.Security.Claims;
using Lexicon.Auth.Services;
using Lexicon.Common.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lexicon.Auth.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpGet("health")]
    public IActionResult HealthCheck()
    {
        return Ok(new { service = "Lexicon.Auth", status = "Healthy", timestamp = DateTimeOffset.UtcNow });
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var result = await _authService.RegisterAsync(request);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var result = await _authService.LoginAsync(request);
        if (!result.Success)
        {
            return Unauthorized(result);
        }

        return Ok(result);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var result = await _authService.GetCurrentUserAsync(userId);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    [HttpGet("users")]
    public async Task<IActionResult> SearchUsers([FromQuery] string? query, [FromQuery] int page = 1, [FromQuery] int pageSize = 12)
    {
        var result = await _authService.SearchUsersAsync(query, page, pageSize);
        return Ok(result);
    }

    [HttpGet("users/{id:guid}")]
    public async Task<IActionResult> GetUserProfile([FromRoute] Guid id)
    {
        var result = await _authService.GetUserProfileAsync(id);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }
}
