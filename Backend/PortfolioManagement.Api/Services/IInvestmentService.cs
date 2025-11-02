using PortfolioManagement.Api.Models.Entities;
using PortfolioManagement.Api.Models.Requests;

namespace PortfolioManagement.Api.Services;

public interface IInvestmentService
{
    Task<Investment?> GetByIdAsync(Guid id, Guid userId);
    Task<Investment> CreateAsync(CreateInvestmentRequest request, Guid userId);
    Task<Investment> UpdateAsync(Guid id, UpdateInvestmentRequest request, Guid userId);
    Task<bool> DeleteAsync(Guid id, Guid userId);
    Task<(List<Investment> Investments, int Total)> GetByUserIdAsync(Guid userId, InvestmentFilters filters);
}

public class InvestmentFilters
{
    public int Page { get; set; } = 1;
    public int Limit { get; set; } = 10;
    public string? Search { get; set; }
    public string? Type { get; set; }
    public string? Status { get; set; }
    public string? SortBy { get; set; }
    public string? SortOrder { get; set; }
}

