using Dapper;
using PortfolioManagement.Api.Data;
using PortfolioManagement.Api.Models.Entities;

namespace PortfolioManagement.Api.Repositories;

public class ActivityLogRepository : IActivityLogRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public ActivityLogRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<ActivityLog> CreateAsync(ActivityLog activityLog)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = @"
            INSERT INTO ActivityLogs (Id, UserId, Action, EntityType, EntityId, Details, IpAddress, UserAgent, CreatedAt)
            VALUES (@Id, @UserId, @Action, @EntityType, @EntityId, @Details, @IpAddress, @UserAgent, @CreatedAt)
            RETURNING Id, UserId, Action, EntityType, EntityId, Details, IpAddress, UserAgent, CreatedAt";

        return await connection.QuerySingleAsync<ActivityLog>(sql, activityLog);
    }

    public async Task<List<ActivityLog>> GetAllAsync(int page, int limit, Guid? userId, string? action, string? entityType, DateTime? dateFrom, DateTime? dateTo)
    {
        using var connection = _connectionFactory.CreateConnection();
        var offset = (page - 1) * limit;
        
        var conditions = new List<string>();
        var parameters = new Dictionary<string, object?>
        {
            { "Offset", offset },
            { "Limit", limit }
        };

        if (userId.HasValue)
        {
            conditions.Add("al.UserId = @UserId");
            parameters["UserId"] = userId.Value;
        }

        if (!string.IsNullOrWhiteSpace(action))
        {
            conditions.Add("al.Action = @Action");
            parameters["Action"] = action;
        }

        if (!string.IsNullOrWhiteSpace(entityType))
        {
            conditions.Add("al.EntityType = @EntityType");
            parameters["EntityType"] = entityType;
        }

        if (dateFrom.HasValue)
        {
            conditions.Add("al.CreatedAt >= @DateFrom");
            parameters["DateFrom"] = dateFrom.Value;
        }

        if (dateTo.HasValue)
        {
            conditions.Add("al.CreatedAt <= @DateTo");
            parameters["DateTo"] = dateTo.Value;
        }

        var whereClause = conditions.Count > 0 ? "WHERE " + string.Join(" AND ", conditions) : "";
        
        var sql = $@"
            SELECT al.Id, al.UserId, al.Action, al.EntityType, al.EntityId, al.Details, 
                   al.IpAddress, al.UserAgent, al.CreatedAt,
                   u.Email AS UserEmail
            FROM ActivityLogs al
            LEFT JOIN Users u ON al.UserId = u.Id
            {whereClause}
            ORDER BY al.CreatedAt DESC
            OFFSET @Offset
            LIMIT @Limit";

        var activityLogs = await connection.QueryAsync<ActivityLog>(sql, parameters);

        return activityLogs.ToList();
    }

    public async Task<int> GetTotalCountAsync(Guid? userId, string? action, string? entityType, DateTime? dateFrom, DateTime? dateTo)
    {
        using var connection = _connectionFactory.CreateConnection();
        
        var conditions = new List<string>();
        var parameters = new Dictionary<string, object?>();

        if (userId.HasValue)
        {
            conditions.Add("UserId = @UserId");
            parameters["UserId"] = userId.Value;
        }

        if (!string.IsNullOrWhiteSpace(action))
        {
            conditions.Add("Action = @Action");
            parameters["Action"] = action;
        }

        if (!string.IsNullOrWhiteSpace(entityType))
        {
            conditions.Add("EntityType = @EntityType");
            parameters["EntityType"] = entityType;
        }

        if (dateFrom.HasValue)
        {
            conditions.Add("CreatedAt >= @DateFrom");
            parameters["DateFrom"] = dateFrom.Value;
        }

        if (dateTo.HasValue)
        {
            conditions.Add("CreatedAt <= @DateTo");
            parameters["DateTo"] = dateTo.Value;
        }

        var whereClause = conditions.Count > 0 ? "WHERE " + string.Join(" AND ", conditions) : "";
        
        var sql = $@"
            SELECT COUNT(*)
            FROM ActivityLogs
            {whereClause}";

        return await connection.QuerySingleAsync<int>(sql, parameters);
    }
}

