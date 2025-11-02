using PortfolioManagement.Api.Models.Entities;

namespace PortfolioManagement.Api.Services;

public interface ITokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    Guid? ValidateToken(string token);
}

