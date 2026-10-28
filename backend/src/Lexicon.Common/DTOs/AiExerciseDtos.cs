namespace Lexicon.Common.DTOs;

public class TargetVocabularyItem
{
    public string TermOrPhrase { get; set; } = string.Empty;
    public string Type { get; set; } = "word"; // "word" or "phrase"
    public string Definition { get; set; } = string.Empty;
    public string? PartOfSpeech { get; set; }
    public string? ExampleSentence { get; set; }
}

public class GenerateExerciseRequest
{
    public List<TargetVocabularyItem> Items { get; set; } = new();
    public string ExerciseType { get; set; } = "story"; // "story", "dialogue", "quiz"
    public string Tone { get; set; } = "literary"; // "literary", "conversational", "humorous", "philosophical"
    public string Difficulty { get; set; } = "intermediate"; // "beginner", "intermediate", "advanced"
}

public class ClozeQuestion
{
    public int QuestionNumber { get; set; }
    public string SentenceWithBlank { get; set; } = string.Empty; // e.g. "Looking out the window, he was struck by a moment of ___."
    public string CorrectAnswer { get; set; } = string.Empty;
    public List<string> Options { get; set; } = new();
    public string ContextHint { get; set; } = string.Empty;
    public string Explanation { get; set; } = string.Empty;
}

public class DialogueTurn
{
    public string Speaker { get; set; } = string.Empty;
    public string Speech { get; set; } = string.Empty;
    public List<string> HighlightedWords { get; set; } = new();
}

public class AiExerciseDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ExerciseType { get; set; } = "story"; // "story", "dialogue", "quiz"
    public string? Tone { get; set; }
    public string Content { get; set; } = string.Empty;
    public List<string> HighlightedVocabulary { get; set; } = new();
    public List<TargetVocabularyItem> TargetItems { get; set; } = new();
    public List<ClozeQuestion>? QuizQuestions { get; set; }
    public List<DialogueTurn>? DialogueTurns { get; set; }
    public string TipsForRetention { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public class SaveExerciseRequest
{
    public string Title { get; set; } = string.Empty;
    public string ExerciseType { get; set; } = "story";
    public string? Tone { get; set; }
    public string Content { get; set; } = string.Empty;
    public List<TargetVocabularyItem> TargetItems { get; set; } = new();
    public List<ClozeQuestion>? QuizQuestions { get; set; }
    public string? TipsForRetention { get; set; }
}
