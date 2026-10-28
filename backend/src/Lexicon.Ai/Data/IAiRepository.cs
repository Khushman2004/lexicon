using Lexicon.Common.DTOs;

namespace Lexicon.Ai.Data;

public interface IAiRepository
{
    Task<Guid> SaveExerciseAsync(Guid userId, SaveExerciseRequest request);
    Task<List<AiExerciseDto>> GetUserExercisesAsync(Guid userId, int limit = 20);
    Task<AiExerciseDto?> GetExerciseByIdAsync(Guid id, Guid userId);
    Task<bool> DeleteExerciseAsync(Guid id, Guid userId);
}
