using Lexicon.Common.DTOs;
using Lexicon.Common.Models;

namespace Lexicon.Library.Services;

public interface ILibraryService
{
    // Words
    Task<ApiResponse<PagedResult<WordDto>>> GetWordsAsync(
        Guid? targetUserId,
        Guid? currentUserId,
        string? search,
        string? startingLetter,
        DateTimeOffset? fromDate,
        DateTimeOffset? toDate,
        string? sortOrder,
        int page,
        int pageSize);

    Task<ApiResponse<WordDto>> GetWordByIdAsync(Guid id, Guid? currentUserId);
    Task<ApiResponse<WordDto>> CreateWordAsync(Guid currentUserId, CreateWordRequest request);
    Task<ApiResponse<WordDto>> UpdateWordAsync(Guid id, Guid currentUserId, UpdateWordRequest request);
    Task<ApiResponse<bool>> DeleteWordAsync(Guid id, Guid currentUserId);

    // Phrases
    Task<ApiResponse<PagedResult<PhraseDto>>> GetPhrasesAsync(
        Guid? targetUserId,
        Guid? currentUserId,
        string? search,
        string? startingLetter,
        DateTimeOffset? fromDate,
        DateTimeOffset? toDate,
        string? sortOrder,
        int page,
        int pageSize);

    Task<ApiResponse<PhraseDto>> GetPhraseByIdAsync(Guid id, Guid? currentUserId);
    Task<ApiResponse<PhraseDto>> CreatePhraseAsync(Guid currentUserId, CreatePhraseRequest request);
    Task<ApiResponse<PhraseDto>> UpdatePhraseAsync(Guid id, Guid currentUserId, UpdatePhraseRequest request);
    Task<ApiResponse<bool>> DeletePhraseAsync(Guid id, Guid currentUserId);

    // Summary
    Task<ApiResponse<LibrarySummaryDto>> GetSummaryAsync(Guid userId);
}
