using Dapper;
using PortfolioManagement.Api.Data;
using PortfolioManagement.Api.Models.Entities;

namespace PortfolioManagement.Api.Repositories;

public class UserRepository : IUserRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public UserRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = @"
            SELECT Id, Email, PasswordHash, FirstName, LastName, Role, IsActive, EmailVerified, 
                   CreatedAt, UpdatedAt, DeletedAt
            FROM Users
            WHERE Id = @Id AND DeletedAt IS NULL";

        return await connection.QueryFirstOrDefaultAsync<User>(sql, new { Id = id });
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = @"
            SELECT Id, Email, PasswordHash, FirstName, LastName, Role, IsActive, EmailVerified, 
                   CreatedAt, UpdatedAt, DeletedAt
            FROM Users
            WHERE Email = @Email AND DeletedAt IS NULL";

        return await connection.QueryFirstOrDefaultAsync<User>(sql, new { Email = email });
    }

    public async Task<User> CreateAsync(User user)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = @"
            INSERT INTO Users (Id, Email, PasswordHash, FirstName, LastName, Role, IsActive, EmailVerified, CreatedAt, UpdatedAt)
            VALUES (@Id, @Email, @PasswordHash, @FirstName, @LastName, @Role, @IsActive, @EmailVerified, @CreatedAt, @UpdatedAt)
            RETURNING Id, Email, PasswordHash, FirstName, LastName, Role, IsActive, EmailVerified, CreatedAt, UpdatedAt, DeletedAt";

        return await connection.QuerySingleAsync<User>(sql, user);
    }

    public async Task<User> UpdateAsync(User user)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = @"
            UPDATE Users
            SET Email = @Email, FirstName = @FirstName, LastName = @LastName, 
                Role = @Role, IsActive = @IsActive, EmailVerified = @EmailVerified,
                UpdatedAt = @UpdatedAt
            WHERE Id = @Id AND DeletedAt IS NULL
            RETURNING Id, Email, PasswordHash, FirstName, LastName, Role, IsActive, EmailVerified, CreatedAt, UpdatedAt, DeletedAt";

        return await connection.QuerySingleAsync<User>(sql, user);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = @"
            UPDATE Users
            SET DeletedAt = (NOW() AT TIME ZONE 'UTC'), UpdatedAt = (NOW() AT TIME ZONE 'UTC')
            WHERE Id = @Id AND DeletedAt IS NULL";

        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });
        return rowsAffected > 0;
    }

    public async Task<List<User>> GetAllAsync(int page, int limit, string? search, string? role, bool? isActive)
    {
        using var connection = _connectionFactory.CreateConnection();
        var offset = (page - 1) * limit;
        
        var sql = @"
            SELECT Id, Email, PasswordHash, FirstName, LastName, Role, IsActive, EmailVerified, 
                   CreatedAt, UpdatedAt, DeletedAt
            FROM Users
            WHERE DeletedAt IS NULL
            AND (@Search IS NULL OR Email LIKE @Search OR FirstName LIKE @Search OR LastName LIKE @Search)
            AND (@Role IS NULL OR Role = @Role)
            AND (@IsActive IS NULL OR IsActive = @IsActive)
            ORDER BY CreatedAt DESC
            OFFSET @Offset
            LIMIT @Limit";

        var searchParam = string.IsNullOrWhiteSpace(search) ? null : $"%{search}%";
        
        var users = await connection.QueryAsync<User>(sql, new
        {
            Search = searchParam,
            Role = role,
            IsActive = isActive,
            Offset = offset,
            Limit = limit
        });

        return users.ToList();
    }

    public async Task<int> GetTotalCountAsync(string? search, string? role, bool? isActive)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = @"
            SELECT COUNT(*)
            FROM Users
            WHERE DeletedAt IS NULL
            AND (@Search IS NULL OR Email LIKE @Search OR FirstName LIKE @Search OR LastName LIKE @Search)
            AND (@Role IS NULL OR Role = @Role)
            AND (@IsActive IS NULL OR IsActive = @IsActive)";

        var searchParam = string.IsNullOrWhiteSpace(search) ? null : $"%{search}%";
        
        return await connection.QuerySingleAsync<int>(sql, new
        {
            Search = searchParam,
            Role = role,
            IsActive = isActive
        });
    }

    public async Task<bool> ActivateAsync(Guid id, bool isActive)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = @"
            UPDATE Users
            SET IsActive = @IsActive, UpdatedAt = (NOW() AT TIME ZONE 'UTC')
            WHERE Id = @Id AND DeletedAt IS NULL";

        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id, IsActive = isActive });
        return rowsAffected > 0;
    }
}

