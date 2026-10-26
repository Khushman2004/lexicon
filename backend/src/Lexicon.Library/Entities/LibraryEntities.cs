namespace Lexicon.Library.Entities;

public class Word
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Term { get; set; } = string.Empty;
    public string Definition { get; set; } = string.Empty;
    public string? PartOfSpeech { get; set; }
    public string? ExampleSentence { get; set; }
    public string? Tags { get; set; }
    public string? Notes { get; set; }
    public bool IsPublic { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public class Phrase
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string PhraseText { get; set; } = string.Empty;
    public string Meaning { get; set; } = string.Empty;
    public string? Context { get; set; }
    public string? Tags { get; set; }
    public string? Notes { get; set; }
    public bool IsPublic { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
}
