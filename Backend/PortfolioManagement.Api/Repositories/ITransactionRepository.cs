using PortfolioManagement.Api.Models.Entities;

namespace PortfolioManagement.Api.Repositories;

public interface ITransactionRepository
{
    Task<Transaction?> GetByIdAsync(Guid id);
    Task<Transaction> CreateAsync(Transaction transaction);
    Task<Transaction> UpdateAsync(Transaction transaction);
    Task<bool> DeleteAsync(Guid id);
    Task<List<Transaction>> GetByUserIdAsync(Guid userId, int page, int limit, string? search, string? type, string? status, Guid? investmentId, DateTime? dateFrom, DateTime? dateTo);
    Task<List<Transaction>> GetByInvestmentIdAsync(Guid investmentId);
    Task<int> GetTotalCountByUserIdAsync(Guid userId, string? search, string? type, string? status, Guid? investmentId, DateTime? dateFrom, DateTime? dateTo);
}

