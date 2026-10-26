using Lexicon.Auth.Entities;
using Lexicon.Common.Models;

namespace Lexicon.Auth.Data;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> GetByUsernameOrEmailAsync(string identifier);
    Task<bool> ExistsByUsernameAsync(string username);
    Task<bool> ExistsByEmailAsync(string email);
    Task<Guid> CreateAsync(User user);
    Task<bool> UpdateAsync(User user);
    Task<PagedResult<User>> SearchUsersAsync(string? query, int page, int pageSize);
}
