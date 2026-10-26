using Lexicon.Common.DTOs;
using Lexicon.Common.Models;

namespace Lexicon.Auth.Services;

public interface IAuthService
{
    Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request);
    Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request);
    Task<ApiResponse<UserDto>> GetCurrentUserAsync(Guid userId);
    Task<ApiResponse<UserDto>> GetUserProfileAsync(Guid userId);
    Task<ApiResponse<PagedResult<UserDto>>> SearchUsersAsync(string? query, int page, int pageSize);
}
