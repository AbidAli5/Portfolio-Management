using PortfolioManagement.Api.Models.Entities;
using PortfolioManagement.Api.Models.Requests;
using PortfolioManagement.Api.Repositories;
using PortfolioManagement.Api.Services;

namespace PortfolioManagement.Api.Services;

public class InvestmentService : IInvestmentService
{
    private readonly IInvestmentRepository _investmentRepository;
    private readonly IActivityLogService _activityLogService;

    public InvestmentService(IInvestmentRepository investmentRepository, IActivityLogService activityLogService)
    {
        _investmentRepository = investmentRepository;
        _activityLogService = activityLogService;
    }

    public async Task<Investment?> GetByIdAsync(Guid id, Guid userId)
    {
        return await _investmentRepository.GetByIdAndUserIdAsync(id, userId);
    }

    public async Task<Investment> CreateAsync(CreateInvestmentRequest request, Guid userId)
    {
        var investment = new Investment
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = request.Name,
            Type = request.Type,
            Amount = request.Amount,
            CurrentValue = request.CurrentValue,
            PurchaseDate = request.PurchaseDate,
            Status = request.Status,
            Description = request.Description,
            Symbol = request.Symbol,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var created = await _investmentRepository.CreateAsync(investment);
        
        await _activityLogService.LogAsync(userId, "create", "investment", created.Id.ToString(), 
            $"Created investment: {created.Name}");

        return created;
    }

    public async Task<Investment> UpdateAsync(Guid id, UpdateInvestmentRequest request, Guid userId)
    {
        var investment = await _investmentRepository.GetByIdAndUserIdAsync(id, userId);
        if (investment == null)
        {
            throw new InvalidOperationException("Investment not found");
        }

        if (!string.IsNullOrEmpty(request.Name))
            investment.Name = request.Name;
        if (!string.IsNullOrEmpty(request.Type))
            investment.Type = request.Type;
        if (request.Amount.HasValue)
            investment.Amount = request.Amount.Value;
        if (request.CurrentValue.HasValue)
            investment.CurrentValue = request.CurrentValue.Value;
        if (request.PurchaseDate.HasValue)
            investment.PurchaseDate = request.PurchaseDate.Value;
        if (!string.IsNullOrEmpty(request.Status))
            investment.Status = request.Status;
        if (request.Description != null)
            investment.Description = request.Description;
        if (request.Symbol != null)
            investment.Symbol = request.Symbol;

        investment.UpdatedAt = DateTime.UtcNow;

        var updated = await _investmentRepository.UpdateAsync(investment);
        
        await _activityLogService.LogAsync(userId, "update", "investment", updated.Id.ToString(), 
            $"Updated investment: {updated.Name}");

        return updated;
    }

    public async Task<bool> DeleteAsync(Guid id, Guid userId)
    {
        var investment = await _investmentRepository.GetByIdAndUserIdAsync(id, userId);
        if (investment == null)
        {
            return false;
        }

        var result = await _investmentRepository.DeleteAsync(id);
        
        if (result)
        {
            await _activityLogService.LogAsync(userId, "delete", "investment", id.ToString(), 
                $"Deleted investment: {investment.Name}");
        }

        return result;
    }

    public async Task<(List<Investment> Investments, int Total)> GetByUserIdAsync(Guid userId, InvestmentFilters filters)
    {
        var investments = await _investmentRepository.GetByUserIdAsync(
            userId,
            filters.Page,
            filters.Limit,
            filters.Search,
            filters.Type,
            filters.Status,
            filters.SortBy ?? "createdAt",
            filters.SortOrder ?? "desc"
        );

        var total = await _investmentRepository.GetTotalCountByUserIdAsync(
            userId,
            filters.Search,
            filters.Type,
            filters.Status
        );

        return (investments, total);
    }
}

