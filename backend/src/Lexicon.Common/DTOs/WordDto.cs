namespace Lexicon.Common.DTOs;

public class WordDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Term { get; set; } = string.Empty;
    public string Definition { get; set; } = string.Empty;
    public string? PartOfSpeech { get; set; }
    public string? ExampleSentence { get; set; }
    public string? Tags { get; set; }
    public string? Notes { get; set; }
    public bool IsPublic { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public class CreateWordRequest
{
    public string Term { get; set; } = string.Empty;
    public string Definition { get; set; } = string.Empty;
    public string? PartOfSpeech { get; set; }
    public string? ExampleSentence { get; set; }
    public string? Tags { get; set; }
    public string? Notes { get; set; }
    public bool IsPublic { get; set; } = true;
}

public class UpdateWordRequest
{
    public string Term { get; set; } = string.Empty;
    public string Definition { get; set; } = string.Empty;
    public string? PartOfSpeech { get; set; }
    public string? ExampleSentence { get; set; }
    public string? Tags { get; set; }
    public string? Notes { get; set; }
    public bool IsPublic { get; set; } = true;
}
