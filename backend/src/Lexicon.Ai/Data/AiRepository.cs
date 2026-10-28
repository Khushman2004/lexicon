using System.Data;
using System.Text.Json;
using Dapper;
using Lexicon.Common.DTOs;
using Microsoft.Data.SqlClient;

namespace Lexicon.Ai.Data;

public class AiRepository : IAiRepository
{
    private readonly string _connectionString;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public AiRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection connection string is not configured.");
    }

    private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

    public async Task<Guid> SaveExerciseAsync(Guid userId, SaveExerciseRequest request)
    {
        const string sql = @"
            INSERT INTO AiExercises (
                Id, UserId, Title, ExerciseType, Tone, Content, 
                TargetItemsJson, QuizQuestionsJson, TipsForRetention, CreatedAt
            )
            OUTPUT INSERTED.Id
            VALUES (
                NEWID(), @UserId, @Title, @ExerciseType, @Tone, @Content,
                @TargetItemsJson, @QuizQuestionsJson, @TipsForRetention, SYSDATETIMEOFFSET()
            );";

        var targetItemsJson = JsonSerializer.Serialize(request.TargetItems, JsonOptions);
        var quizJson = request.QuizQuestions != null ? JsonSerializer.Serialize(request.QuizQuestions, JsonOptions) : null;

        using var connection = CreateConnection();
        var id = await connection.ExecuteScalarAsync<Guid>(sql, new
        {
            UserId = userId,
            Title = request.Title,
            ExerciseType = request.ExerciseType,
            Tone = request.Tone,
            Content = request.Content,
            TargetItemsJson = targetItemsJson,
            QuizQuestionsJson = quizJson,
            TipsForRetention = request.TipsForRetention
        });

        return id;
    }

    public async Task<List<AiExerciseDto>> GetUserExercisesAsync(Guid userId, int limit = 20)
    {
        const string sql = @"
            SELECT TOP (@Limit)
                Id, UserId, Title, ExerciseType, Tone, Content,
                TargetItemsJson, QuizQuestionsJson, TipsForRetention, CreatedAt
            FROM AiExercises
            WHERE UserId = @UserId
            ORDER BY CreatedAt DESC;";

        using var connection = CreateConnection();
        var rows = await connection.QueryAsync(sql, new { UserId = userId, Limit = limit });

        var results = new List<AiExerciseDto>();
        foreach (var r in rows)
        {
            var targetItems = string.IsNullOrWhiteSpace((string)r.TargetItemsJson)
                ? new List<TargetVocabularyItem>()
                : JsonSerializer.Deserialize<List<TargetVocabularyItem>>((string)r.TargetItemsJson, JsonOptions) ?? new();

            var quizQuestions = string.IsNullOrWhiteSpace((string)r.QuizQuestionsJson)
                ? null
                : JsonSerializer.Deserialize<List<ClozeQuestion>>((string)r.QuizQuestionsJson, JsonOptions);

            results.Add(new AiExerciseDto
            {
                Id = r.Id,
                UserId = r.UserId,
                Title = r.Title,
                ExerciseType = r.ExerciseType,
                Tone = r.Tone,
                Content = r.Content,
                TargetItems = targetItems,
                QuizQuestions = quizQuestions,
                TipsForRetention = r.TipsForRetention ?? string.Empty,
                CreatedAt = r.CreatedAt
            });
        }

        return results;
    }

    public async Task<AiExerciseDto?> GetExerciseByIdAsync(Guid id, Guid userId)
    {
        const string sql = @"
            SELECT
                Id, UserId, Title, ExerciseType, Tone, Content,
                TargetItemsJson, QuizQuestionsJson, TipsForRetention, CreatedAt
            FROM AiExercises
            WHERE Id = @Id AND UserId = @UserId;";

        using var connection = CreateConnection();
        var r = await connection.QuerySingleOrDefaultAsync(sql, new { Id = id, UserId = userId });
        if (r == null) return null;

        var targetItems = string.IsNullOrWhiteSpace((string)r.TargetItemsJson)
            ? new List<TargetVocabularyItem>()
            : JsonSerializer.Deserialize<List<TargetVocabularyItem>>((string)r.TargetItemsJson, JsonOptions) ?? new();

        var quizQuestions = string.IsNullOrWhiteSpace((string)r.QuizQuestionsJson)
            ? null
            : JsonSerializer.Deserialize<List<ClozeQuestion>>((string)r.QuizQuestionsJson, JsonOptions);

        return new AiExerciseDto
        {
            Id = r.Id,
            UserId = r.UserId,
            Title = r.Title,
            ExerciseType = r.ExerciseType,
            Tone = r.Tone,
            Content = r.Content,
            TargetItems = targetItems,
            QuizQuestions = quizQuestions,
            TipsForRetention = r.TipsForRetention ?? string.Empty,
            CreatedAt = r.CreatedAt
        };
    }

    public async Task<bool> DeleteExerciseAsync(Guid id, Guid userId)
    {
        const string sql = "DELETE FROM AiExercises WHERE Id = @Id AND UserId = @UserId;";
        using var connection = CreateConnection();
        var rows = await connection.ExecuteAsync(sql, new { Id = id, UserId = userId });
        return rows > 0;
    }
}
