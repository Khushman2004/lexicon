using Lexicon.Auth.Data;
using Lexicon.Auth.Entities;
using Lexicon.Common.DTOs;
using Lexicon.Common.Models;
using Lexicon.Common.Security;

namespace Lexicon.Auth.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly JwtSettings _jwtSettings;
    private readonly ILogger<AuthService> _logger;

    public AuthService(IUserRepository userRepository, JwtSettings jwtSettings, ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _jwtSettings = jwtSettings;
        _logger = logger;
    }

    public async Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username))
            return ApiResponse<AuthResponse>.Fail("Username is required.");

        if (string.IsNullOrWhiteSpace(request.Email))
            return ApiResponse<AuthResponse>.Fail("Email is required.");

        if (string.IsNullOrWhiteSpace(request.Password) || request.Password.Length < 6)
            return ApiResponse<AuthResponse>.Fail("Password must be at least 6 characters.");

        if (await _userRepository.ExistsByUsernameAsync(request.Username))
            return ApiResponse<AuthResponse>.Fail("Username is already taken.");

        if (await _userRepository.ExistsByEmailAsync(request.Email))
            return ApiResponse<AuthResponse>.Fail("Email is already registered.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Username = request.Username.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            FullName = string.IsNullOrWhiteSpace(request.FullName) ? request.Username.Trim() : request.FullName.Trim(),
            Bio = request.Bio?.Trim(),
            PasswordHash = PasswordHasher.HashPassword(request.Password),
            IsPublic = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        await _userRepository.CreateAsync(user);

        var token = JwtTokenGenerator.GenerateToken(user.Id, user.Username, user.Email, _jwtSettings);
        var userDto = MapToDto(user);

        return ApiResponse<AuthResponse>.Ok(new AuthResponse
        {
            Token = token,
            User = userDto,
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(_jwtSettings.ExpiryInMinutes)
        }, "Registration successful.");
    }

    public async Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.UsernameOrEmail) || string.IsNullOrWhiteSpace(request.Password))
            return ApiResponse<AuthResponse>.Fail("Username/Email and password are required.");

        var user = await _userRepository.GetByUsernameOrEmailAsync(request.UsernameOrEmail);
        if (user == null || !PasswordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            return ApiResponse<AuthResponse>.Fail("Invalid credentials.");
        }

        var token = JwtTokenGenerator.GenerateToken(user.Id, user.Username, user.Email, _jwtSettings);
        var userDto = MapToDto(user);

        return ApiResponse<AuthResponse>.Ok(new AuthResponse
        {
            Token = token,
            User = userDto,
            ExpiresAt = DateTimeOffset.UtcNow.AddMinutes(_jwtSettings.ExpiryInMinutes)
        }, "Login successful.");
    }

    public async Task<ApiResponse<UserDto>> GetCurrentUserAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            return ApiResponse<UserDto>.Fail("User not found.");

        return ApiResponse<UserDto>.Ok(MapToDto(user));
    }

    public async Task<ApiResponse<UserDto>> GetUserProfileAsync(Guid userId)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null || !user.IsPublic)
            return ApiResponse<UserDto>.Fail("User profile not found or private.");

        return ApiResponse<UserDto>.Ok(MapToDto(user));
    }

    public async Task<ApiResponse<PagedResult<UserDto>>> SearchUsersAsync(string? query, int page, int pageSize)
    {
        var result = await _userRepository.SearchUsersAsync(query, page, pageSize);
        var dtos = result.Items.Select(MapToDto).ToList();

        var pagedDtos = new PagedResult<UserDto>(dtos, result.TotalCount, result.Page, result.PageSize);
        return ApiResponse<PagedResult<UserDto>>.Ok(pagedDtos);
    }

    private static UserDto MapToDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            FullName = user.FullName,
            Bio = user.Bio,
            AvatarUrl = user.AvatarUrl,
            IsPublic = user.IsPublic,
            CreatedAt = user.CreatedAt
        };
    }
}
