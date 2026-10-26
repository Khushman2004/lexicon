using System.Data;
using Dapper;
using Lexicon.Common.DTOs;
using Lexicon.Common.Models;
using Lexicon.Library.Entities;
using Microsoft.Data.SqlClient;

namespace Lexicon.Library.Data;

public class LibraryRepository : ILibraryRepository
{
    private readonly string _connectionString;

    public LibraryRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not configured.");
    }

    private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

    #region Words

    public async Task<PagedResult<Word>> GetWordsAsync(
        Guid? userId,
        string? search,
        string? startingLetter,
        DateTimeOffset? fromDate,
        DateTimeOffset? toDate,
        string? sortOrder,
        int page,
        int pageSize,
        bool publicOnly)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 12;
        if (pageSize > 100) pageSize = 100;
        var offset = (page - 1) * pageSize;

        var conditions = new List<string>();
        var parameters = new DynamicParameters();
        parameters.Add("@Offset", offset);
        parameters.Add("@PageSize", pageSize);

        if (userId.HasValue)
        {
            conditions.Add("UserId = @UserId");
            parameters.Add("@UserId", userId.Value);
        }

        if (publicOnly)
        {
            conditions.Add("IsPublic = 1");
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            conditions.Add("(Term LIKE @Search OR Definition LIKE @Search OR Tags LIKE @Search OR ExampleSentence LIKE @Search)");
            parameters.Add("@Search", $"%{search.Trim()}%");
        }

        if (!string.IsNullOrWhiteSpace(startingLetter) && startingLetter.Length == 1 && char.IsLetter(startingLetter[0]))
        {
            conditions.Add("Term LIKE @StartingLetter");
            parameters.Add("@StartingLetter", $"{startingLetter.Trim()}%");
        }

        if (fromDate.HasValue)
        {
            conditions.Add("CreatedAt >= @FromDate");
            parameters.Add("@FromDate", fromDate.Value);
        }

        if (toDate.HasValue)
        {
            conditions.Add("CreatedAt <= @ToDate");
            parameters.Add("@ToDate", toDate.Value);
        }

        var whereClause = conditions.Count > 0 ? "WHERE " + string.Join(" AND ", conditions) : string.Empty;

        // Sorting: Automatic alphabetical sorting by default!
        var orderByClause = sortOrder?.ToLowerInvariant() switch
        {
            "alpha-desc" => "ORDER BY Term COLLATE Latin1_General_CI_AS DESC",
            "date-desc" => "ORDER BY CreatedAt DESC",
            "date-asc" => "ORDER BY CreatedAt ASC",
            _ => "ORDER BY Term COLLATE Latin1_General_CI_AS ASC" // Default: Alphabetical A-Z
        };

        var countSql = $"SELECT COUNT(1) FROM Words {whereClause};";
        var itemsSql = $@"
            SELECT Id, UserId, Term, Definition, PartOfSpeech, ExampleSentence, Tags, Notes, IsPublic, CreatedAt, UpdatedAt
            FROM Words
            {whereClause}
            {orderByClause}
            OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;";

        using var connection = CreateConnection();
        var total = await connection.ExecuteScalarAsync<int>(countSql, parameters);
        var items = (await connection.QueryAsync<Word>(itemsSql, parameters)).ToList();

        return new PagedResult<Word>(items, total, page, pageSize);
    }

    public async Task<Word?> GetWordByIdAsync(Guid id)
    {
        const string sql = @"
            SELECT Id, UserId, Term, Definition, PartOfSpeech, ExampleSentence, Tags, Notes, IsPublic, CreatedAt, UpdatedAt
            FROM Words
            WHERE Id = @Id;";

        using var connection = CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<Word>(sql, new { Id = id });
    }

    public async Task<Guid> CreateWordAsync(Word word)
    {
        if (word.Id == Guid.Empty)
        {
            word.Id = Guid.NewGuid();
        }

        const string sql = @"
            INSERT INTO Words (Id, UserId, Term, Definition, PartOfSpeech, ExampleSentence, Tags, Notes, IsPublic, CreatedAt, UpdatedAt)
            VALUES (@Id, @UserId, @Term, @Definition, @PartOfSpeech, @ExampleSentence, @Tags, @Notes, @IsPublic, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());";

        using var connection = CreateConnection();
        await connection.ExecuteAsync(sql, word);
        return word.Id;
    }

    public async Task<bool> UpdateWordAsync(Word word)
    {
        const string sql = @"
            UPDATE Words
            SET Term = @Term,
                Definition = @Definition,
                PartOfSpeech = @PartOfSpeech,
                ExampleSentence = @ExampleSentence,
                Tags = @Tags,
                Notes = @Notes,
                IsPublic = @IsPublic,
                UpdatedAt = SYSDATETIMEOFFSET()
            WHERE Id = @Id AND UserId = @UserId;";

        using var connection = CreateConnection();
        var rows = await connection.ExecuteAsync(sql, word);
        return rows > 0;
    }

    public async Task<bool> DeleteWordAsync(Guid id, Guid userId)
    {
        const string sql = "DELETE FROM Words WHERE Id = @Id AND UserId = @UserId;";
        using var connection = CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new { Id = id, UserId = userId });
        return rows > 0;
    }

    #endregion

    #region Phrases

    public async Task<PagedResult<Phrase>> GetPhrasesAsync(
        Guid? userId,
        string? search,
        string? startingLetter,
        DateTimeOffset? fromDate,
        DateTimeOffset? toDate,
        string? sortOrder,
        int page,
        int pageSize,
        bool publicOnly)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 12;
        if (pageSize > 100) pageSize = 100;
        var offset = (page - 1) * pageSize;

        var conditions = new List<string>();
        var parameters = new DynamicParameters();
        parameters.Add("@Offset", offset);
        parameters.Add("@PageSize", pageSize);

        if (userId.HasValue)
        {
            conditions.Add("UserId = @UserId");
            parameters.Add("@UserId", userId.Value);
        }

        if (publicOnly)
        {
            conditions.Add("IsPublic = 1");
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            conditions.Add("(PhraseText LIKE @Search OR Meaning LIKE @Search OR Context LIKE @Search OR Tags LIKE @Search)");
            parameters.Add("@Search", $"%{search.Trim()}%");
        }

        if (!string.IsNullOrWhiteSpace(startingLetter) && startingLetter.Length == 1 && char.IsLetter(startingLetter[0]))
        {
            conditions.Add("PhraseText LIKE @StartingLetter");
            parameters.Add("@StartingLetter", $"{startingLetter.Trim()}%");
        }

        if (fromDate.HasValue)
        {
            conditions.Add("CreatedAt >= @FromDate");
            parameters.Add("@FromDate", fromDate.Value);
        }

        if (toDate.HasValue)
        {
            conditions.Add("CreatedAt <= @ToDate");
            parameters.Add("@ToDate", toDate.Value);
        }

        var whereClause = conditions.Count > 0 ? "WHERE " + string.Join(" AND ", conditions) : string.Empty;

        // Sorting: Automatic alphabetical sorting by default!
        var orderByClause = sortOrder?.ToLowerInvariant() switch
        {
            "alpha-desc" => "ORDER BY PhraseText COLLATE Latin1_General_CI_AS DESC",
            "date-desc" => "ORDER BY CreatedAt DESC",
            "date-asc" => "ORDER BY CreatedAt ASC",
            _ => "ORDER BY PhraseText COLLATE Latin1_General_CI_AS ASC" // Default: Alphabetical A-Z
        };

        var countSql = $"SELECT COUNT(1) FROM Phrases {whereClause};";
        var itemsSql = $@"
            SELECT Id, UserId, PhraseText, Meaning, Context, Tags, Notes, IsPublic, CreatedAt, UpdatedAt
            FROM Phrases
            {whereClause}
            {orderByClause}
            OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;";

        using var connection = CreateConnection();
        var total = await connection.ExecuteScalarAsync<int>(countSql, parameters);
        var items = (await connection.QueryAsync<Phrase>(itemsSql, parameters)).ToList();

        return new PagedResult<Phrase>(items, total, page, pageSize);
    }

    public async Task<Phrase?> GetPhraseByIdAsync(Guid id)
    {
        const string sql = @"
            SELECT Id, UserId, PhraseText, Meaning, Context, Tags, Notes, IsPublic, CreatedAt, UpdatedAt
            FROM Phrases
            WHERE Id = @Id;";

        using var connection = CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<Phrase>(sql, new { Id = id });
    }

    public async Task<Guid> CreatePhraseAsync(Phrase phrase)
    {
        if (phrase.Id == Guid.Empty)
        {
            phrase.Id = Guid.NewGuid();
        }

        const string sql = @"
            INSERT INTO Phrases (Id, UserId, PhraseText, Meaning, Context, Tags, Notes, IsPublic, CreatedAt, UpdatedAt)
            VALUES (@Id, @UserId, @PhraseText, @Meaning, @Context, @Tags, @Notes, @IsPublic, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());";

        using var connection = CreateConnection();
        await connection.ExecuteAsync(sql, phrase);
        return phrase.Id;
    }

    public async Task<bool> UpdatePhraseAsync(Phrase phrase)
    {
        const string sql = @"
            UPDATE Phrases
            SET PhraseText = @PhraseText,
                Meaning = @Meaning,
                Context = @Context,
                Tags = @Tags,
                Notes = @Notes,
                IsPublic = @IsPublic,
                UpdatedAt = SYSDATETIMEOFFSET()
            WHERE Id = @Id AND UserId = @UserId;";

        using var connection = CreateConnection();
        var rows = await connection.ExecuteAsync(sql, phrase);
        return rows > 0;
    }

    public async Task<bool> DeletePhraseAsync(Guid id, Guid userId)
    {
        const string sql = "DELETE FROM Phrases WHERE Id = @Id AND UserId = @UserId;";
        using var connection = CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new { Id = id, UserId = userId });
        return rows > 0;
    }

    #endregion

    #region Statistics

    public async Task<LibrarySummaryDto> GetSummaryAsync(Guid userId)
    {
        const string sql = @"
            SELECT COUNT(1) FROM Words WHERE UserId = @UserId;
            SELECT COUNT(1) FROM Phrases WHERE UserId = @UserId;
            SELECT COUNT(1) FROM Words WHERE UserId = @UserId AND CreatedAt >= DATEADD(DAY, -7, SYSDATETIMEOFFSET());
            SELECT COUNT(1) FROM Phrases WHERE UserId = @UserId AND CreatedAt >= DATEADD(DAY, -7, SYSDATETIMEOFFSET());
            SELECT TOP 1 CreatedAt FROM (
                SELECT CreatedAt FROM Words WHERE UserId = @UserId
                UNION ALL
                SELECT CreatedAt FROM Phrases WHERE UserId = @UserId
            ) AS Combined ORDER BY CreatedAt DESC;
            SELECT Tags FROM Words WHERE UserId = @UserId AND Tags IS NOT NULL
            UNION ALL
            SELECT Tags FROM Phrases WHERE UserId = @UserId AND Tags IS NOT NULL;";

        using var connection = CreateConnection();
        using var multi = await connection.QueryMultipleAsync(sql, new { UserId = userId });

        var totalWords = await multi.ReadSingleOrDefaultAsync<int>();
        var totalPhrases = await multi.ReadSingleOrDefaultAsync<int>();
        var wordsThisWeek = await multi.ReadSingleOrDefaultAsync<int>();
        var phrasesThisWeek = await multi.ReadSingleOrDefaultAsync<int>();
        var lastActivity = await multi.ReadSingleOrDefaultAsync<DateTimeOffset?>();
        var rawTags = (await multi.ReadAsync<string>()).ToList();

        var topTags = rawTags
            .SelectMany(t => t.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries))
            .GroupBy(t => t, StringComparer.OrdinalIgnoreCase)
            .OrderByDescending(g => g.Count())
            .Take(6)
            .Select(g => g.Key)
            .ToList();

        return new LibrarySummaryDto
        {
            TotalWords = totalWords,
            TotalPhrases = totalPhrases,
            WordsAddedThisWeek = wordsThisWeek,
            PhrasesAddedThisWeek = phrasesThisWeek,
            LastActivity = lastActivity,
            TopTags = topTags
        };
    }

    #endregion
}
