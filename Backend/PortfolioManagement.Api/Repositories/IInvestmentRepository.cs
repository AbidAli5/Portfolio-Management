using PortfolioManagement.Api.Models.Entities;

namespace PortfolioManagement.Api.Repositories;

public interface IInvestmentRepository
{
    Task<Investment?> GetByIdAsync(Guid id);
    Task<Investment?> GetByIdAndUserIdAsync(Guid id, Guid userId);
    Task<Investment> CreateAsync(Investment investment);
    Task<Investment> UpdateAsync(Investment investment);
    Task<bool> DeleteAsync(Guid id);
    Task<List<Investment>> GetByUserIdAsync(Guid userId, int page, int limit, string? search, string? type, string? status, string? sortBy, string? sortOrder);
    Task<int> GetTotalCountByUserIdAsync(Guid userId, string? search, string? type, string? status);
    Task<List<Investment>> GetAllAsync(int page, int limit, string? search, string? type, string? status, string? sortBy, string? sortOrder);
    Task<int> GetTotalCountAsync(string? search, string? type, string? status);
}

