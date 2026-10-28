using System.Security.Claims;
using Lexicon.Ai.Services;
using Lexicon.Common.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lexicon.Ai.Controllers;

[Authorize]
[ApiController]
[Route("api/ai")]
public class AiController : ControllerBase
{
    private readonly IAiExerciseService _aiService;
    private readonly ILogger<AiController> _logger;

    public AiController(IAiExerciseService aiService, ILogger<AiController> logger)
    {
        _aiService = aiService;
        _logger = logger;
    }

    [AllowAnonymous]
    [HttpGet("health")]
    public IActionResult HealthCheck()
    {
        return Ok(new { service = "Lexicon.Ai", status = "Healthy", timestamp = DateTimeOffset.UtcNow });
    }

    [HttpPost("generate")]
    public async Task<IActionResult> GenerateExercise([FromBody] GenerateExerciseRequest request)
    {
        var userId = GetCurrentUserId();
        var result = await _aiService.GenerateExerciseAsync(userId, request);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpPost("saved")]
    public async Task<IActionResult> SaveExercise([FromBody] SaveExerciseRequest request)
    {
        var userId = GetCurrentUserId();
        var result = await _aiService.SaveExerciseAsync(userId, request);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetUserExercises()
    {
        var userId = GetCurrentUserId();
        var result = await _aiService.GetUserExercisesAsync(userId);
        return Ok(result);
    }

    [HttpGet("exercises/{id:guid}")]
    public async Task<IActionResult> GetExerciseById([FromRoute] Guid id)
    {
        var userId = GetCurrentUserId();
        var result = await _aiService.GetExerciseByIdAsync(id, userId);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    [HttpDelete("exercises/{id:guid}")]
    public async Task<IActionResult> DeleteExercise([FromRoute] Guid id)
    {
        var userId = GetCurrentUserId();
        var result = await _aiService.DeleteExerciseAsync(id, userId);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    private Guid GetCurrentUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(claim, out var userId))
        {
            return userId;
        }

        throw new UnauthorizedAccessException("Valid user ID claim missing from security token.");
    }
}
