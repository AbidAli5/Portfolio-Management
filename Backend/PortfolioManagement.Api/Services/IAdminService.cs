using PortfolioManagement.Api.Models.Entities;
using PortfolioManagement.Api.Models.Requests;

namespace PortfolioManagement.Api.Services;

public interface IAdminService
{
    Task<(List<User> Users, int Total)> GetAllUsersAsync(UserFilters filters);
    Task<User?> GetUserByIdAsync(Guid id);
    Task<User> CreateUserAsync(CreateUserRequest request);
    Task<User?> UpdateUserAsync(Guid id, UpdateUserRequest request);
    Task<bool> ActivateUserAsync(Guid id, bool isActive);
    Task<bool> DeleteUserAsync(Guid id);
    Task<SystemStatsResponse> GetSystemStatsAsync();
    Task<(List<ActivityLog> Logs, int Total)> GetActivityLogsAsync(ActivityLogFilters filters);
}

public class UserFilters
{
    public int Page { get; set; } = 1;
    public int Limit { get; set; } = 10;
    public string? Search { get; set; }
    public string? Role { get; set; }
    public bool? IsActive { get; set; }
}

public class ActivityLogFilters
{
    public int Page { get; set; } = 1;
    public int Limit { get; set; } = 10;
    public Guid? UserId { get; set; }
    public string? Action { get; set; }
    public string? EntityType { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
}

public class SystemStatsResponse
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int TotalInvestments { get; set; }
    public decimal TotalInvestmentValue { get; set; }
    public int ActiveTransactions { get; set; }
}

