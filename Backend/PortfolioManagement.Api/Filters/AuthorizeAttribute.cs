using System.Security.Claims;

namespace PortfolioManagement.Api.Filters;

public static class AuthorizationExtensions
{
    public static bool IsAuthenticated(this ClaimsPrincipal? user)
    {
        return user?.Identity?.IsAuthenticated ?? false;
    }

    public static Guid? GetUserId(this ClaimsPrincipal? user)
    {
        var userIdClaim = user?.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
        {
            return userId;
        }
        return null;
    }

    public static bool IsAdmin(this ClaimsPrincipal? user)
    {
        return user?.IsInRole("admin") ?? false;
    }

    public static bool RequiresAdmin(this ClaimsPrincipal? user, bool requireAdmin)
    {
        if (!requireAdmin) return true;
        return user?.IsInRole("admin") ?? false;
    }
}

