using PortfolioManagement.Api.Models.Entities;
using PortfolioManagement.Api.Repositories;

namespace PortfolioManagement.Api.Services;

public class ActivityLogService : IActivityLogService
{
    private readonly IActivityLogRepository _activityLogRepository;

    public ActivityLogService(IActivityLogRepository activityLogRepository)
    {
        _activityLogRepository = activityLogRepository;
    }

    public async Task LogAsync(Guid? userId, string action, string entityType, string entityId, string? details = null, string? ipAddress = null, string? userAgent = null)
    {
        var activityLog = new ActivityLog
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Details = details,
            IpAddress = ipAddress,
            UserAgent = userAgent,
            CreatedAt = DateTime.UtcNow
        };

        await _activityLogRepository.CreateAsync(activityLog);
    }
}

