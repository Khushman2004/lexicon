using System.Security.Claims;
using Lexicon.Common.DTOs;
using Lexicon.Library.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lexicon.Library.Controllers;

[ApiController]
[Route("api/library")]
public class LibraryController : ControllerBase
{
    private readonly ILibraryService _libraryService;

    public LibraryController(ILibraryService libraryService)
    {
        _libraryService = libraryService;
    }

    [HttpGet("health")]
    public IActionResult HealthCheck()
    {
        return Ok(new { service = "Lexicon.Library", status = "Healthy", timestamp = DateTimeOffset.UtcNow });
    }

    #region Words Endpoints

    [HttpGet("words")]
    public async Task<IActionResult> GetWords(
        [FromQuery] Guid? userId,
        [FromQuery] string? search,
        [FromQuery] string? startingLetter,
        [FromQuery] DateTimeOffset? fromDate,
        [FromQuery] DateTimeOffset? toDate,
        [FromQuery] string? sortOrder,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12)
    {
        var currentUserId = GetCurrentUserId();
        var targetUser = userId ?? currentUserId;

        var result = await _libraryService.GetWordsAsync(
            targetUser,
            currentUserId,
            search,
            startingLetter,
            fromDate,
            toDate,
            sortOrder,
            page,
            pageSize);

        return Ok(result);
    }

    [HttpGet("words/{id:guid}")]
    public async Task<IActionResult> GetWordById([FromRoute] Guid id)
    {
        var currentUserId = GetCurrentUserId();
        var result = await _libraryService.GetWordByIdAsync(id, currentUserId);
        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    [Authorize]
    [HttpPost("words")]
    public async Task<IActionResult> CreateWord([FromBody] CreateWordRequest request)
    {
        var currentUserId = GetCurrentUserId();
        if (!currentUserId.HasValue)
            return Unauthorized();

        var result = await _libraryService.CreateWordAsync(currentUserId.Value, request);
        if (!result.Success)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetWordById), new { id = result.Data!.Id }, result);
    }

    [Authorize]
    [HttpPut("words/{id:guid}")]
    public async Task<IActionResult> UpdateWord([FromRoute] Guid id, [FromBody] UpdateWordRequest request)
    {
        var currentUserId = GetCurrentUserId();
        if (!currentUserId.HasValue)
            return Unauthorized();

        var result = await _libraryService.UpdateWordAsync(id, currentUserId.Value, request);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [Authorize]
    [HttpDelete("words/{id:guid}")]
    public async Task<IActionResult> DeleteWord([FromRoute] Guid id)
    {
        var currentUserId = GetCurrentUserId();
        if (!currentUserId.HasValue)
            return Unauthorized();

        var result = await _libraryService.DeleteWordAsync(id, currentUserId.Value);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    #endregion

    #region Phrases Endpoints

    [HttpGet("phrases")]
    public async Task<IActionResult> GetPhrases(
        [FromQuery] Guid? userId,
        [FromQuery] string? search,
        [FromQuery] string? startingLetter,
        [FromQuery] DateTimeOffset? fromDate,
        [FromQuery] DateTimeOffset? toDate,
        [FromQuery] string? sortOrder,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 12)
    {
        var currentUserId = GetCurrentUserId();
        var targetUser = userId ?? currentUserId;

        var result = await _libraryService.GetPhrasesAsync(
            targetUser,
            currentUserId,
            search,
            startingLetter,
            fromDate,
            toDate,
            sortOrder,
            page,
            pageSize);

        return Ok(result);
    }

    [HttpGet("phrases/{id:guid}")]
    public async Task<IActionResult> GetPhraseById([FromRoute] Guid id)
    {
        var currentUserId = GetCurrentUserId();
        var result = await _libraryService.GetPhraseByIdAsync(id, currentUserId);
        if (!result.Success)
            return NotFound(result);

        return Ok(result);
    }

    [Authorize]
    [HttpPost("phrases")]
    public async Task<IActionResult> CreatePhrase([FromBody] CreatePhraseRequest request)
    {
        var currentUserId = GetCurrentUserId();
        if (!currentUserId.HasValue)
            return Unauthorized();

        var result = await _libraryService.CreatePhraseAsync(currentUserId.Value, request);
        if (!result.Success)
            return BadRequest(result);

        return CreatedAtAction(nameof(GetPhraseById), new { id = result.Data!.Id }, result);
    }

    [Authorize]
    [HttpPut("phrases/{id:guid}")]
    public async Task<IActionResult> UpdatePhrase([FromRoute] Guid id, [FromBody] UpdatePhraseRequest request)
    {
        var currentUserId = GetCurrentUserId();
        if (!currentUserId.HasValue)
            return Unauthorized();

        var result = await _libraryService.UpdatePhraseAsync(id, currentUserId.Value, request);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    [Authorize]
    [HttpDelete("phrases/{id:guid}")]
    public async Task<IActionResult> DeletePhrase([FromRoute] Guid id)
    {
        var currentUserId = GetCurrentUserId();
        if (!currentUserId.HasValue)
            return Unauthorized();

        var result = await _libraryService.DeletePhraseAsync(id, currentUserId.Value);
        if (!result.Success)
            return BadRequest(result);

        return Ok(result);
    }

    #endregion

    #region Summary Endpoints

    [Authorize]
    [HttpGet("summary")]
    public async Task<IActionResult> GetMySummary()
    {
        var currentUserId = GetCurrentUserId();
        if (!currentUserId.HasValue)
            return Unauthorized();

        var result = await _libraryService.GetSummaryAsync(currentUserId.Value);
        return Ok(result);
    }

    [HttpGet("summary/{userId:guid}")]
    public async Task<IActionResult> GetUserSummary([FromRoute] Guid userId)
    {
        var result = await _libraryService.GetSummaryAsync(userId);
        return Ok(result);
    }

    #endregion

    private Guid? GetCurrentUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (Guid.TryParse(claim, out var userId))
        {
            return userId;
        }
        return null;
    }
}
