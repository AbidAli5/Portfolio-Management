using Dapper;
using PortfolioManagement.Api.Data;
using PortfolioManagement.Api.Models.Entities;

namespace PortfolioManagement.Api.Repositories;

public class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public RefreshTokenRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<RefreshToken?> GetByTokenAsync(string token)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = @"
            SELECT Id, UserId, Token, ExpiresAt, CreatedAt
            FROM RefreshTokens
            WHERE Token = @Token AND ExpiresAt > (NOW() AT TIME ZONE 'UTC')";

        return await connection.QueryFirstOrDefaultAsync<RefreshToken>(sql, new { Token = token });
    }

    public async Task<RefreshToken> CreateAsync(RefreshToken refreshToken)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = @"
            INSERT INTO RefreshTokens (Id, UserId, Token, ExpiresAt, CreatedAt)
            VALUES (@Id, @UserId, @Token, @ExpiresAt, @CreatedAt)
            RETURNING Id, UserId, Token, ExpiresAt, CreatedAt";

        return await connection.QuerySingleAsync<RefreshToken>(sql, refreshToken);
    }

    public async Task<bool> DeleteByTokenAsync(string token)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = @"DELETE FROM RefreshTokens WHERE Token = @Token";

        var rowsAffected = await connection.ExecuteAsync(sql, new { Token = token });
        return rowsAffected > 0;
    }

    public async Task<bool> DeleteByUserIdAsync(Guid userId)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = @"DELETE FROM RefreshTokens WHERE UserId = @UserId";

        var rowsAffected = await connection.ExecuteAsync(sql, new { UserId = userId });
        return rowsAffected > 0;
    }
}

