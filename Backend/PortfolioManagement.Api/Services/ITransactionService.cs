using PortfolioManagement.Api.Models.Entities;
using PortfolioManagement.Api.Models.Requests;

namespace PortfolioManagement.Api.Services;

public interface ITransactionService
{
    Task<Transaction?> GetByIdAsync(Guid id, Guid userId);
    Task<Transaction> CreateAsync(CreateTransactionRequest request, Guid userId);
    Task<Transaction> UpdateAsync(Guid id, UpdateTransactionRequest request, Guid userId);
    Task<bool> DeleteAsync(Guid id, Guid userId);
    Task<(List<Transaction> Transactions, int Total)> GetByUserIdAsync(Guid userId, TransactionFilters filters);
    Task<List<Transaction>> GetByInvestmentIdAsync(Guid investmentId, Guid userId);
}

public class TransactionFilters
{
    public int Page { get; set; } = 1;
    public int Limit { get; set; } = 10;
    public string? Search { get; set; }
    public string? Type { get; set; }
    public string? Status { get; set; }
    public Guid? InvestmentId { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
}

