using PortfolioManagement.Api.Models.Entities;

namespace PortfolioManagement.Api.Repositories;

public interface IRefreshTokenRepository
{
    Task<RefreshToken?> GetByTokenAsync(string token);
    Task<RefreshToken> CreateAsync(RefreshToken refreshToken);
    Task<bool> DeleteByTokenAsync(string token);
    Task<bool> DeleteByUserIdAsync(Guid userId);
}

