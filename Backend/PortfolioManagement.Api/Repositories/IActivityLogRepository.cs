using PortfolioManagement.Api.Models.Entities;

namespace PortfolioManagement.Api.Repositories;

public interface IActivityLogRepository
{
    Task<ActivityLog> CreateAsync(ActivityLog activityLog);
    Task<List<ActivityLog>> GetAllAsync(int page, int limit, Guid? userId, string? action, string? entityType, DateTime? dateFrom, DateTime? dateTo);
    Task<int> GetTotalCountAsync(Guid? userId, string? action, string? entityType, DateTime? dateFrom, DateTime? dateTo);
}

