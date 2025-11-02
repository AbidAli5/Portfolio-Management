using Dapper;
using PortfolioManagement.Api.Data;
using PortfolioManagement.Api.Models.Entities;

namespace PortfolioManagement.Api.Repositories;

public class TransactionRepository : ITransactionRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public TransactionRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<Transaction?> GetByIdAsync(Guid id)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = @"
            SELECT t.Id, t.InvestmentId, t.Type, t.Quantity, t.Price, t.Amount, t.Fees, 
                   t.Date, t.Status, t.Notes, t.CreatedAt, t.UpdatedAt
            FROM Transactions t
            WHERE t.Id = @Id";

        return await connection.QueryFirstOrDefaultAsync<Transaction>(sql, new { Id = id });
    }

    public async Task<Transaction> CreateAsync(Transaction transaction)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = @"
            INSERT INTO Transactions (Id, InvestmentId, Type, Quantity, Price, Amount, Fees, Date, Status, Notes, CreatedAt, UpdatedAt)
            VALUES (@Id, @InvestmentId, @Type, @Quantity, @Price, @Amount, @Fees, @Date, @Status, @Notes, @CreatedAt, @UpdatedAt)
            RETURNING Id, InvestmentId, Type, Quantity, Price, Amount, Fees, Date, Status, Notes, CreatedAt, UpdatedAt";

        return await connection.QuerySingleAsync<Transaction>(sql, transaction);
    }

    public async Task<Transaction> UpdateAsync(Transaction transaction)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = @"
            UPDATE Transactions
            SET InvestmentId = @InvestmentId, Type = @Type, Quantity = @Quantity, Price = @Price,
                Amount = @Amount, Fees = @Fees, Date = @Date, Status = @Status, Notes = @Notes,
                UpdatedAt = @UpdatedAt
            WHERE Id = @Id
            RETURNING Id, InvestmentId, Type, Quantity, Price, Amount, Fees, Date, Status, Notes, CreatedAt, UpdatedAt";

        return await connection.QuerySingleAsync<Transaction>(sql, transaction);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = @"DELETE FROM Transactions WHERE Id = @Id";

        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });
        return rowsAffected > 0;
    }

    public async Task<List<Transaction>> GetByUserIdAsync(Guid userId, int page, int limit, string? search, string? type, string? status, Guid? investmentId, DateTime? dateFrom, DateTime? dateTo)
    {
        using var connection = _connectionFactory.CreateConnection();
        var offset = (page - 1) * limit;
        
        var conditions = new List<string> { "i.UserId = @UserId", "i.DeletedAt IS NULL" };
        var parameters = new Dictionary<string, object?>
        {
            { "UserId", userId },
            { "Offset", offset },
            { "Limit", limit }
        };

        if (!string.IsNullOrWhiteSpace(search))
        {
            conditions.Add("i.Name LIKE @Search");
            parameters["Search"] = $"%{search}%";
        }

        if (!string.IsNullOrWhiteSpace(type))
        {
            conditions.Add("t.Type = @Type");
            parameters["Type"] = type;
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            conditions.Add("t.Status = @Status");
            parameters["Status"] = status;
        }

        if (investmentId.HasValue)
        {
            conditions.Add("t.InvestmentId = @InvestmentId");
            parameters["InvestmentId"] = investmentId.Value;
        }

        if (dateFrom.HasValue)
        {
            conditions.Add("t.Date >= @DateFrom");
            parameters["DateFrom"] = dateFrom.Value;
        }

        if (dateTo.HasValue)
        {
            conditions.Add("t.Date <= @DateTo");
            parameters["DateTo"] = dateTo.Value;
        }

        var whereClause = string.Join(" AND ", conditions);
        
        var sql = $@"
            SELECT t.Id, t.InvestmentId, t.Type, t.Quantity, t.Price, t.Amount, t.Fees, 
                   t.Date, t.Status, t.Notes, t.CreatedAt, t.UpdatedAt
            FROM Transactions t
            INNER JOIN Investments i ON t.InvestmentId = i.Id
            WHERE {whereClause}
            ORDER BY t.Date DESC, t.CreatedAt DESC
            OFFSET @Offset
            LIMIT @Limit";
        
        var transactions = await connection.QueryAsync<Transaction>(sql, parameters);
        return transactions.ToList();
    }

    public async Task<List<Transaction>> GetByInvestmentIdAsync(Guid investmentId)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = @"
            SELECT t.Id, t.InvestmentId, t.Type, t.Quantity, t.Price, t.Amount, t.Fees, 
                   t.Date, t.Status, t.Notes, t.CreatedAt, t.UpdatedAt
            FROM Transactions t
            WHERE t.InvestmentId = @InvestmentId
            ORDER BY t.Date DESC, t.CreatedAt DESC";

        var transactions = await connection.QueryAsync<Transaction>(sql, new { InvestmentId = investmentId });
        return transactions.ToList();
    }

    public async Task<int> GetTotalCountByUserIdAsync(Guid userId, string? search, string? type, string? status, Guid? investmentId, DateTime? dateFrom, DateTime? dateTo)
    {
        using var connection = _connectionFactory.CreateConnection();
        
        var conditions = new List<string> { "i.UserId = @UserId", "i.DeletedAt IS NULL" };
        var parameters = new Dictionary<string, object?> { { "UserId", userId } };

        if (!string.IsNullOrWhiteSpace(search))
        {
            conditions.Add("i.Name LIKE @Search");
            parameters["Search"] = $"%{search}%";
        }

        if (!string.IsNullOrWhiteSpace(type))
        {
            conditions.Add("t.Type = @Type");
            parameters["Type"] = type;
        }

        if (!string.IsNullOrWhiteSpace(status))
        {
            conditions.Add("t.Status = @Status");
            parameters["Status"] = status;
        }

        if (investmentId.HasValue)
        {
            conditions.Add("t.InvestmentId = @InvestmentId");
            parameters["InvestmentId"] = investmentId.Value;
        }

        if (dateFrom.HasValue)
        {
            conditions.Add("t.Date >= @DateFrom");
            parameters["DateFrom"] = dateFrom.Value;
        }

        if (dateTo.HasValue)
        {
            conditions.Add("t.Date <= @DateTo");
            parameters["DateTo"] = dateTo.Value;
        }

        var whereClause = string.Join(" AND ", conditions);
        
        var sql = $@"
            SELECT COUNT(*)
            FROM Transactions t
            INNER JOIN Investments i ON t.InvestmentId = i.Id
            WHERE {whereClause}";
        
        return await connection.QuerySingleAsync<int>(sql, parameters);
    }
}

