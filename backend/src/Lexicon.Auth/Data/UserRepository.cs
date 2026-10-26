using System.Data;
using Dapper;
using Lexicon.Auth.Entities;
using Lexicon.Common.Models;
using Microsoft.Data.SqlClient;

namespace Lexicon.Auth.Data;

public class UserRepository : IUserRepository
{
    private readonly string _connectionString;

    public UserRepository(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not configured.");
    }

    private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

    public async Task<User?> GetByIdAsync(Guid id)
    {
        const string sql = @"
            SELECT Id, Username, Email, PasswordHash, FullName, Bio, AvatarUrl, IsPublic, CreatedAt, UpdatedAt
            FROM Users
            WHERE Id = @Id;";

        using var connection = CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<User>(sql, new { Id = id });
    }

    public async Task<User?> GetByUsernameOrEmailAsync(string identifier)
    {
        const string sql = @"
            SELECT Id, Username, Email, PasswordHash, FullName, Bio, AvatarUrl, IsPublic, CreatedAt, UpdatedAt
            FROM Users
            WHERE LOWER(Username) = LOWER(@Identifier) OR LOWER(Email) = LOWER(@Identifier);";

        using var connection = CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<User>(sql, new { Identifier = identifier.Trim() });
    }

    public async Task<bool> ExistsByUsernameAsync(string username)
    {
        const string sql = "SELECT COUNT(1) FROM Users WHERE LOWER(Username) = LOWER(@Username);";
        using var connection = CreateConnection();
        var count = await connection.ExecuteScalarAsync<int>(sql, new { Username = username.Trim() });
        return count > 0;
    }

    public async Task<bool> ExistsByEmailAsync(string email)
    {
        const string sql = "SELECT COUNT(1) FROM Users WHERE LOWER(Email) = LOWER(@Email);";
        using var connection = CreateConnection();
        var count = await connection.ExecuteScalarAsync<int>(sql, new { Email = email.Trim() });
        return count > 0;
    }

    public async Task<Guid> CreateAsync(User user)
    {
        if (user.Id == Guid.Empty)
        {
            user.Id = Guid.NewGuid();
        }

        const string sql = @"
            INSERT INTO Users (Id, Username, Email, PasswordHash, FullName, Bio, AvatarUrl, IsPublic, CreatedAt, UpdatedAt)
            VALUES (@Id, @Username, @Email, @PasswordHash, @FullName, @Bio, @AvatarUrl, @IsPublic, SYSDATETIMEOFFSET(), SYSDATETIMEOFFSET());";

        using var connection = CreateConnection();
        await connection.ExecuteAsync(sql, user);
        return user.Id;
    }

    public async Task<bool> UpdateAsync(User user)
    {
        const string sql = @"
            UPDATE Users
            SET Username = @Username,
                Email = @Email,
                FullName = @FullName,
                Bio = @Bio,
                AvatarUrl = @AvatarUrl,
                IsPublic = @IsPublic,
                UpdatedAt = SYSDATETIMEOFFSET()
            WHERE Id = @Id;";

        using var connection = CreateConnection();
        var rows = await connection.ExecuteAsync(sql, user);
        return rows > 0;
    }

    public async Task<PagedResult<User>> SearchUsersAsync(string? query, int page, int pageSize)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100;
        var offset = (page - 1) * pageSize;

        var whereClause = "WHERE IsPublic = 1";
        var parameters = new DynamicParameters();
        parameters.Add("@Offset", offset);
        parameters.Add("@PageSize", pageSize);

        if (!string.IsNullOrWhiteSpace(query))
        {
            whereClause += " AND (LOWER(Username) LIKE LOWER(@Query) OR LOWER(FullName) LIKE LOWER(@Query) OR LOWER(Bio) LIKE LOWER(@Query))";
            parameters.Add("@Query", $"%{query.Trim()}%");
        }

        var countSql = $"SELECT COUNT(1) FROM Users {whereClause};";
        var itemsSql = $@"
            SELECT Id, Username, Email, PasswordHash, FullName, Bio, AvatarUrl, IsPublic, CreatedAt, UpdatedAt
            FROM Users
            {whereClause}
            ORDER BY Username ASC
            OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;";

        using var connection = CreateConnection();
        var total = await connection.ExecuteScalarAsync<int>(countSql, parameters);
        var items = (await connection.QueryAsync<User>(itemsSql, parameters)).ToList();

        return new PagedResult<User>(items, total, page, pageSize);
    }
}
