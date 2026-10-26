namespace Lexicon.Common.DTOs;

public class PhraseDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string PhraseText { get; set; } = string.Empty;
    public string Meaning { get; set; } = string.Empty;
    public string? Context { get; set; }
    public string? Tags { get; set; }
    public string? Notes { get; set; }
    public bool IsPublic { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public class CreatePhraseRequest
{
    public string PhraseText { get; set; } = string.Empty;
    public string Meaning { get; set; } = string.Empty;
    public string? Context { get; set; }
    public string? Tags { get; set; }
    public string? Notes { get; set; }
    public bool IsPublic { get; set; } = true;
}

public class UpdatePhraseRequest
{
    public string PhraseText { get; set; } = string.Empty;
    public string Meaning { get; set; } = string.Empty;
    public string? Context { get; set; }
    public string? Tags { get; set; }
    public string? Notes { get; set; }
    public bool IsPublic { get; set; } = true;
}
