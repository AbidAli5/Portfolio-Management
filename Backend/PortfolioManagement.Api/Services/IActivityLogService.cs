using PortfolioManagement.Api.Models.Entities;

namespace PortfolioManagement.Api.Services;

public interface IActivityLogService
{
    Task LogAsync(Guid? userId, string action, string entityType, string entityId, string? details = null, string? ipAddress = null, string? userAgent = null);
}

