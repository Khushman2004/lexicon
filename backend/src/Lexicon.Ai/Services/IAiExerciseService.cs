using Lexicon.Common.DTOs;
using Lexicon.Common.Models;

namespace Lexicon.Ai.Services;

public interface IAiExerciseService
{
    Task<ApiResponse<AiExerciseDto>> GenerateExerciseAsync(Guid userId, GenerateExerciseRequest request);
    Task<ApiResponse<Guid>> SaveExerciseAsync(Guid userId, SaveExerciseRequest request);
    Task<ApiResponse<List<AiExerciseDto>>> GetUserExercisesAsync(Guid userId);
    Task<ApiResponse<AiExerciseDto>> GetExerciseByIdAsync(Guid id, Guid userId);
    Task<ApiResponse<bool>> DeleteExerciseAsync(Guid id, Guid userId);
}
