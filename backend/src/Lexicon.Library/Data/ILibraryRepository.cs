using Lexicon.Common.DTOs;
using Lexicon.Common.Models;
using Lexicon.Library.Entities;

namespace Lexicon.Library.Data;

public interface ILibraryRepository
{
    // Words
    Task<PagedResult<Word>> GetWordsAsync(
        Guid? userId,
        string? search,
        string? startingLetter,
        DateTimeOffset? fromDate,
        DateTimeOffset? toDate,
        string? sortOrder,
        int page,
        int pageSize,
        bool publicOnly);

    Task<Word?> GetWordByIdAsync(Guid id);
    Task<Guid> CreateWordAsync(Word word);
    Task<bool> UpdateWordAsync(Word word);
    Task<bool> DeleteWordAsync(Guid id, Guid userId);

    // Phrases
    Task<PagedResult<Phrase>> GetPhrasesAsync(
        Guid? userId,
        string? search,
        string? startingLetter,
        DateTimeOffset? fromDate,
        DateTimeOffset? toDate,
        string? sortOrder,
        int page,
        int pageSize,
        bool publicOnly);

    Task<Phrase?> GetPhraseByIdAsync(Guid id);
    Task<Guid> CreatePhraseAsync(Phrase phrase);
    Task<bool> UpdatePhraseAsync(Phrase phrase);
    Task<bool> DeletePhraseAsync(Guid id, Guid userId);

    // Statistics
    Task<LibrarySummaryDto> GetSummaryAsync(Guid userId);
}
