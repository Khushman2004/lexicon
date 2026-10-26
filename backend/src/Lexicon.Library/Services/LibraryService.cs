using Lexicon.Common.DTOs;
using Lexicon.Common.Models;
using Lexicon.Library.Data;
using Lexicon.Library.Entities;

namespace Lexicon.Library.Services;

public class LibraryService : ILibraryService
{
    private readonly ILibraryRepository _repository;
    private readonly ILogger<LibraryService> _logger;

    public LibraryService(ILibraryRepository repository, ILogger<LibraryService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    #region Words

    public async Task<ApiResponse<PagedResult<WordDto>>> GetWordsAsync(
        Guid? targetUserId,
        Guid? currentUserId,
        string? search,
        string? startingLetter,
        DateTimeOffset? fromDate,
        DateTimeOffset? toDate,
        string? sortOrder,
        int page,
        int pageSize)
    {
        // If viewing someone else's library, only return public words
        var isSelf = targetUserId.HasValue && currentUserId.HasValue && targetUserId.Value == currentUserId.Value;
        var publicOnly = !isSelf;

        var result = await _repository.GetWordsAsync(
            targetUserId ?? currentUserId,
            search,
            startingLetter,
            fromDate,
            toDate,
            sortOrder,
            page,
            pageSize,
            publicOnly);

        var dtos = result.Items.Select(MapWordToDto).ToList();
        return ApiResponse<PagedResult<WordDto>>.Ok(new PagedResult<WordDto>(dtos, result.TotalCount, result.Page, result.PageSize));
    }

    public async Task<ApiResponse<WordDto>> GetWordByIdAsync(Guid id, Guid? currentUserId)
    {
        var word = await _repository.GetWordByIdAsync(id);
        if (word == null)
            return ApiResponse<WordDto>.Fail("Word not found.");

        if (!word.IsPublic && (!currentUserId.HasValue || word.UserId != currentUserId.Value))
            return ApiResponse<WordDto>.Fail("Word is private.");

        return ApiResponse<WordDto>.Ok(MapWordToDto(word));
    }

    public async Task<ApiResponse<WordDto>> CreateWordAsync(Guid currentUserId, CreateWordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Term))
            return ApiResponse<WordDto>.Fail("Word term is required.");

        if (string.IsNullOrWhiteSpace(request.Definition))
            return ApiResponse<WordDto>.Fail("Word definition is required.");

        var word = new Word
        {
            Id = Guid.NewGuid(),
            UserId = currentUserId,
            Term = request.Term.Trim(),
            Definition = request.Definition.Trim(),
            PartOfSpeech = request.PartOfSpeech?.Trim().ToLowerInvariant(),
            ExampleSentence = request.ExampleSentence?.Trim(),
            Tags = request.Tags?.Trim(),
            Notes = request.Notes?.Trim(),
            IsPublic = request.IsPublic,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await _repository.CreateWordAsync(word);
        return ApiResponse<WordDto>.Ok(MapWordToDto(word), "Word added successfully.");
    }

    public async Task<ApiResponse<WordDto>> UpdateWordAsync(Guid id, Guid currentUserId, UpdateWordRequest request)
    {
        var existing = await _repository.GetWordByIdAsync(id);
        if (existing == null)
            return ApiResponse<WordDto>.Fail("Word not found.");

        if (existing.UserId != currentUserId)
            return ApiResponse<WordDto>.Fail("You do not have permission to edit this word.");

        existing.Term = request.Term.Trim();
        existing.Definition = request.Definition.Trim();
        existing.PartOfSpeech = request.PartOfSpeech?.Trim().ToLowerInvariant();
        existing.ExampleSentence = request.ExampleSentence?.Trim();
        existing.Tags = request.Tags?.Trim();
        existing.Notes = request.Notes?.Trim();
        existing.IsPublic = request.IsPublic;
        existing.UpdatedAt = DateTimeOffset.UtcNow;

        var success = await _repository.UpdateWordAsync(existing);
        if (!success)
            return ApiResponse<WordDto>.Fail("Failed to update word.");

        return ApiResponse<WordDto>.Ok(MapWordToDto(existing), "Word updated successfully.");
    }

    public async Task<ApiResponse<bool>> DeleteWordAsync(Guid id, Guid currentUserId)
    {
        var existing = await _repository.GetWordByIdAsync(id);
        if (existing == null)
            return ApiResponse<bool>.Fail("Word not found.");

        if (existing.UserId != currentUserId)
            return ApiResponse<bool>.Fail("You do not have permission to delete this word.");

        var success = await _repository.DeleteWordAsync(id, currentUserId);
        return success
            ? ApiResponse<bool>.Ok(true, "Word deleted successfully.")
            : ApiResponse<bool>.Fail("Failed to delete word.");
    }

    #endregion

    #region Phrases

    public async Task<ApiResponse<PagedResult<PhraseDto>>> GetPhrasesAsync(
        Guid? targetUserId,
        Guid? currentUserId,
        string? search,
        string? startingLetter,
        DateTimeOffset? fromDate,
        DateTimeOffset? toDate,
        string? sortOrder,
        int page,
        int pageSize)
    {
        var isSelf = targetUserId.HasValue && currentUserId.HasValue && targetUserId.Value == currentUserId.Value;
        var publicOnly = !isSelf;

        var result = await _repository.GetPhrasesAsync(
            targetUserId ?? currentUserId,
            search,
            startingLetter,
            fromDate,
            toDate,
            sortOrder,
            page,
            pageSize,
            publicOnly);

        var dtos = result.Items.Select(MapPhraseToDto).ToList();
        return ApiResponse<PagedResult<PhraseDto>>.Ok(new PagedResult<PhraseDto>(dtos, result.TotalCount, result.Page, result.PageSize));
    }

    public async Task<ApiResponse<PhraseDto>> GetPhraseByIdAsync(Guid id, Guid? currentUserId)
    {
        var phrase = await _repository.GetPhraseByIdAsync(id);
        if (phrase == null)
            return ApiResponse<PhraseDto>.Fail("Phrase not found.");

        if (!phrase.IsPublic && (!currentUserId.HasValue || phrase.UserId != currentUserId.Value))
            return ApiResponse<PhraseDto>.Fail("Phrase is private.");

        return ApiResponse<PhraseDto>.Ok(MapPhraseToDto(phrase));
    }

    public async Task<ApiResponse<PhraseDto>> CreatePhraseAsync(Guid currentUserId, CreatePhraseRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.PhraseText))
            return ApiResponse<PhraseDto>.Fail("Phrase text is required.");

        if (string.IsNullOrWhiteSpace(request.Meaning))
            return ApiResponse<PhraseDto>.Fail("Phrase meaning is required.");

        var phrase = new Phrase
        {
            Id = Guid.NewGuid(),
            UserId = currentUserId,
            PhraseText = request.PhraseText.Trim(),
            Meaning = request.Meaning.Trim(),
            Context = request.Context?.Trim(),
            Tags = request.Tags?.Trim(),
            Notes = request.Notes?.Trim(),
            IsPublic = request.IsPublic,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await _repository.CreatePhraseAsync(phrase);
        return ApiResponse<PhraseDto>.Ok(MapPhraseToDto(phrase), "Phrase added successfully.");
    }

    public async Task<ApiResponse<PhraseDto>> UpdatePhraseAsync(Guid id, Guid currentUserId, UpdatePhraseRequest request)
    {
        var existing = await _repository.GetPhraseByIdAsync(id);
        if (existing == null)
            return ApiResponse<PhraseDto>.Fail("Phrase not found.");

        if (existing.UserId != currentUserId)
            return ApiResponse<PhraseDto>.Fail("You do not have permission to edit this phrase.");

        existing.PhraseText = request.PhraseText.Trim();
        existing.Meaning = request.Meaning.Trim();
        existing.Context = request.Context?.Trim();
        existing.Tags = request.Tags?.Trim();
        existing.Notes = request.Notes?.Trim();
        existing.IsPublic = request.IsPublic;
        existing.UpdatedAt = DateTimeOffset.UtcNow;

        var success = await _repository.UpdatePhraseAsync(existing);
        if (!success)
            return ApiResponse<PhraseDto>.Fail("Failed to update phrase.");

        return ApiResponse<PhraseDto>.Ok(MapPhraseToDto(existing), "Phrase updated successfully.");
    }

    public async Task<ApiResponse<bool>> DeletePhraseAsync(Guid id, Guid currentUserId)
    {
        var existing = await _repository.GetPhraseByIdAsync(id);
        if (existing == null)
            return ApiResponse<bool>.Fail("Phrase not found.");

        if (existing.UserId != currentUserId)
            return ApiResponse<bool>.Fail("You do not have permission to delete this phrase.");

        var success = await _repository.DeletePhraseAsync(id, currentUserId);
        return success
            ? ApiResponse<bool>.Ok(true, "Phrase deleted successfully.")
            : ApiResponse<bool>.Fail("Failed to delete phrase.");
    }

    #endregion

    #region Summary

    public async Task<ApiResponse<LibrarySummaryDto>> GetSummaryAsync(Guid userId)
    {
        var summary = await _repository.GetSummaryAsync(userId);
        return ApiResponse<LibrarySummaryDto>.Ok(summary);
    }

    #endregion

    #region Helpers

    private static WordDto MapWordToDto(Word word) => new()
    {
        Id = word.Id,
        UserId = word.UserId,
        Term = word.Term,
        Definition = word.Definition,
        PartOfSpeech = word.PartOfSpeech,
        ExampleSentence = word.ExampleSentence,
        Tags = word.Tags,
        Notes = word.Notes,
        IsPublic = word.IsPublic,
        CreatedAt = word.CreatedAt,
        UpdatedAt = word.UpdatedAt
    };

    private static PhraseDto MapPhraseToDto(Phrase phrase) => new()
    {
        Id = phrase.Id,
        UserId = phrase.UserId,
        PhraseText = phrase.PhraseText,
        Meaning = phrase.Meaning,
        Context = phrase.Context,
        Tags = phrase.Tags,
        Notes = phrase.Notes,
        IsPublic = phrase.IsPublic,
        CreatedAt = phrase.CreatedAt,
        UpdatedAt = phrase.UpdatedAt
    };

    #endregion
}
