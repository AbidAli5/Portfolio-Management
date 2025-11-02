using Dapper;
using PortfolioManagement.Api.Data;
using PortfolioManagement.Api.Models.Entities;

namespace PortfolioManagement.Api.Repositories;

public class InvestmentRepository : IInvestmentRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public InvestmentRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<Investment?> GetByIdAsync(Guid id)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = @"
            SELECT Id, UserId, Name, Type, Amount, CurrentValue, PurchaseDate, Status, 
                   Description, Symbol, CreatedAt, UpdatedAt, DeletedAt
            FROM Investments
            WHERE Id = @Id AND DeletedAt IS NULL";

        return await connection.QueryFirstOrDefaultAsync<Investment>(sql, new { Id = id });
    }

    public async Task<Investment?> GetByIdAndUserIdAsync(Guid id, Guid userId)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = @"
            SELECT Id, UserId, Name, Type, Amount, CurrentValue, PurchaseDate, Status, 
                   Description, Symbol, CreatedAt, UpdatedAt, DeletedAt
            FROM Investments
            WHERE Id = @Id AND UserId = @UserId AND DeletedAt IS NULL";

        return await connection.QueryFirstOrDefaultAsync<Investment>(sql, new { Id = id, UserId = userId });
    }

    public async Task<Investment> CreateAsync(Investment investment)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = @"
            INSERT INTO Investments (Id, UserId, Name, Type, Amount, CurrentValue, PurchaseDate, Status, Description, Symbol, CreatedAt, UpdatedAt)
            VALUES (@Id, @UserId, @Name, @Type, @Amount, @CurrentValue, @PurchaseDate, @Status, @Description, @Symbol, @CreatedAt, @UpdatedAt)
            RETURNING Id, UserId, Name, Type, Amount, CurrentValue, PurchaseDate, Status, Description, Symbol, CreatedAt, UpdatedAt, DeletedAt";

        return await connection.QuerySingleAsync<Investment>(sql, investment);
    }

    public async Task<Investment> UpdateAsync(Investment investment)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = @"
            UPDATE Investments
            SET Name = @Name, Type = @Type, Amount = @Amount, CurrentValue = @CurrentValue,
                PurchaseDate = @PurchaseDate, Status = @Status, Description = @Description,
                Symbol = @Symbol, UpdatedAt = @UpdatedAt
            WHERE Id = @Id AND DeletedAt IS NULL
            RETURNING Id, UserId, Name, Type, Amount, CurrentValue, PurchaseDate, Status, Description, Symbol, CreatedAt, UpdatedAt, DeletedAt";

        return await connection.QuerySingleAsync<Investment>(sql, investment);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = @"
            UPDATE Investments
            SET DeletedAt = (NOW() AT TIME ZONE 'UTC'), UpdatedAt = (NOW() AT TIME ZONE 'UTC')
            WHERE Id = @Id AND DeletedAt IS NULL";

        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });
        return rowsAffected > 0;
    }

    public async Task<List<Investment>> GetByUserIdAsync(Guid userId, int page, int limit, string? search, string? type, string? status, string? sortBy, string? sortOrder)
    {
        using var connection = _connectionFactory.CreateConnection();
        var offset = (page - 1) * limit;
        
        var orderBy = GetOrderByClause(sortBy, sortOrder);
        var searchParam = string.IsNullOrWhiteSpace(search) ? null : $"%{search}%";
        
        var sql = $@"
            SELECT Id, UserId, Name, Type, Amount, CurrentValue, PurchaseDate, Status, 
                   Description, Symbol, CreatedAt, UpdatedAt, DeletedAt
            FROM Investments
            WHERE UserId = @UserId AND DeletedAt IS NULL
            AND (@Search IS NULL OR Name LIKE @Search)
            AND (@Type IS NULL OR Type = @Type)
            AND (@Status IS NULL OR Status = @Status)
            ORDER BY {orderBy}
            OFFSET @Offset
            LIMIT @Limit";

        var investments = await connection.QueryAsync<Investment>(sql, new
        {
            UserId = userId,
            Search = searchParam,
            Type = type,
            Status = status,
            Offset = offset,
            Limit = limit
        });

        return investments.ToList();
    }

    public async Task<int> GetTotalCountByUserIdAsync(Guid userId, string? search, string? type, string? status)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = @"
            SELECT COUNT(*)
            FROM Investments
            WHERE UserId = @UserId AND DeletedAt IS NULL
            AND (@Search IS NULL OR Name LIKE @Search)
            AND (@Type IS NULL OR Type = @Type)
            AND (@Status IS NULL OR Status = @Status)";

        var searchParam = string.IsNullOrWhiteSpace(search) ? null : $"%{search}%";
        
        return await connection.QuerySingleAsync<int>(sql, new
        {
            UserId = userId,
            Search = searchParam,
            Type = type,
            Status = status
        });
    }

    public async Task<List<Investment>> GetAllAsync(int page, int limit, string? search, string? type, string? status, string? sortBy, string? sortOrder)
    {
        using var connection = _connectionFactory.CreateConnection();
        var offset = (page - 1) * limit;
        
        var orderBy = GetOrderByClause(sortBy, sortOrder);
        var searchParam = string.IsNullOrWhiteSpace(search) ? null : $"%{search}%";
        
        var sql = $@"
            SELECT Id, UserId, Name, Type, Amount, CurrentValue, PurchaseDate, Status, 
                   Description, Symbol, CreatedAt, UpdatedAt, DeletedAt
            FROM Investments
            WHERE DeletedAt IS NULL
            AND (@Search IS NULL OR Name LIKE @Search)
            AND (@Type IS NULL OR Type = @Type)
            AND (@Status IS NULL OR Status = @Status)
            ORDER BY {orderBy}
            OFFSET @Offset
            LIMIT @Limit";

        var investments = await connection.QueryAsync<Investment>(sql, new
        {
            Search = searchParam,
            Type = type,
            Status = status,
            Offset = offset,
            Limit = limit
        });

        return investments.ToList();
    }

    public async Task<int> GetTotalCountAsync(string? search, string? type, string? status)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = @"
            SELECT COUNT(*)
            FROM Investments
            WHERE DeletedAt IS NULL
            AND (@Search IS NULL OR Name LIKE @Search)
            AND (@Type IS NULL OR Type = @Type)
            AND (@Status IS NULL OR Status = @Status)";

        var searchParam = string.IsNullOrWhiteSpace(search) ? null : $"%{search}%";
        
        return await connection.QuerySingleAsync<int>(sql, new
        {
            Search = searchParam,
            Type = type,
            Status = status
        });
    }

    private static string GetOrderByClause(string? sortBy, string? sortOrder)
    {
        var order = sortOrder?.ToLower() == "desc" ? "DESC" : "ASC";
        
        return sortBy?.ToLower() switch
        {
            "amount" => $"Amount {order}",
            "currentvalue" => $"CurrentValue {order}",
            "purchasedate" => $"PurchaseDate {order}",
            "name" => $"Name {order}",
            _ => $"CreatedAt {order}"
        };
    }
}

