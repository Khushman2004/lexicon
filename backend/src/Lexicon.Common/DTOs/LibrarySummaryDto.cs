namespace Lexicon.Common.DTOs;

public class LibrarySummaryDto
{
    public int TotalWords { get; set; }
    public int TotalPhrases { get; set; }
    public int WordsAddedThisWeek { get; set; }
    public int PhrasesAddedThisWeek { get; set; }
    public List<string> TopTags { get; set; } = [];
    public DateTimeOffset? LastActivity { get; set; }
}
