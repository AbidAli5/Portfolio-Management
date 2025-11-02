using PortfolioManagement.Api.Models.Entities;
using PortfolioManagement.Api.Models.Requests;
using PortfolioManagement.Api.Repositories;
using PortfolioManagement.Api.Services;

namespace PortfolioManagement.Api.Services;

public class TransactionService : ITransactionService
{
    private readonly ITransactionRepository _transactionRepository;
    private readonly IInvestmentRepository _investmentRepository;
    private readonly IActivityLogService _activityLogService;

    public TransactionService(
        ITransactionRepository transactionRepository,
        IInvestmentRepository investmentRepository,
        IActivityLogService activityLogService)
    {
        _transactionRepository = transactionRepository;
        _investmentRepository = investmentRepository;
        _activityLogService = activityLogService;
    }

    public async Task<Transaction?> GetByIdAsync(Guid id, Guid userId)
    {
        var transaction = await _transactionRepository.GetByIdAsync(id);
        if (transaction == null)
        {
            return null;
        }

        // Verify the transaction belongs to the user
        var investment = await _investmentRepository.GetByIdAsync(transaction.InvestmentId);
        if (investment == null || investment.UserId != userId)
        {
            return null;
        }

        return transaction;
    }

    public async Task<Transaction> CreateAsync(CreateTransactionRequest request, Guid userId)
    {
        // Verify investment belongs to user
        var investment = await _investmentRepository.GetByIdAndUserIdAsync(request.InvestmentId, userId);
        if (investment == null)
        {
            throw new InvalidOperationException("Investment not found");
        }

        // Auto-calculate amount if not provided
        var amount = request.Quantity * request.Price + (request.Fees ?? 0);

        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            InvestmentId = request.InvestmentId,
            Type = request.Type,
            Quantity = request.Quantity,
            Price = request.Price,
            Amount = amount,
            Fees = request.Fees,
            Date = request.Date,
            Status = request.Status,
            Notes = request.Notes,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var created = await _transactionRepository.CreateAsync(transaction);
        
        // Update investment current value if needed
        if (request.Type == "buy")
        {
            investment.CurrentValue += amount;
            investment.UpdatedAt = DateTime.UtcNow;
            await _investmentRepository.UpdateAsync(investment);
        }
        else if (request.Type == "sell")
        {
            investment.CurrentValue -= amount;
            investment.UpdatedAt = DateTime.UtcNow;
            await _investmentRepository.UpdateAsync(investment);
        }

        await _activityLogService.LogAsync(userId, "create", "transaction", created.Id.ToString(), 
            $"Created transaction: {created.Type} for investment {investment.Name}");

        return created;
    }

    public async Task<Transaction> UpdateAsync(Guid id, UpdateTransactionRequest request, Guid userId)
    {
        var transaction = await GetByIdAsync(id, userId);
        if (transaction == null)
        {
            throw new InvalidOperationException("Transaction not found");
        }

        if (!string.IsNullOrEmpty(request.Type))
            transaction.Type = request.Type;
        if (request.Quantity.HasValue)
            transaction.Quantity = request.Quantity.Value;
        if (request.Price.HasValue)
            transaction.Price = request.Price.Value;
        if (request.Fees != null)
            transaction.Fees = request.Fees;
        if (request.Date.HasValue)
            transaction.Date = request.Date.Value;
        if (!string.IsNullOrEmpty(request.Status))
            transaction.Status = request.Status;
        if (request.Notes != null)
            transaction.Notes = request.Notes;

        // Recalculate amount
        transaction.Amount = transaction.Quantity * transaction.Price + (transaction.Fees ?? 0);
        transaction.UpdatedAt = DateTime.UtcNow;

        var updated = await _transactionRepository.UpdateAsync(transaction);
        
        await _activityLogService.LogAsync(userId, "update", "transaction", updated.Id.ToString(), 
            $"Updated transaction");

        return updated;
    }

    public async Task<bool> DeleteAsync(Guid id, Guid userId)
    {
        var transaction = await GetByIdAsync(id, userId);
        if (transaction == null)
        {
            return false;
        }

        var result = await _transactionRepository.DeleteAsync(id);
        
        if (result)
        {
            await _activityLogService.LogAsync(userId, "delete", "transaction", id.ToString(), 
                $"Deleted transaction");
        }

        return result;
    }

    public async Task<(List<Transaction> Transactions, int Total)> GetByUserIdAsync(Guid userId, TransactionFilters filters)
    {
        var transactions = await _transactionRepository.GetByUserIdAsync(
            userId,
            filters.Page,
            filters.Limit,
            filters.Search,
            filters.Type,
            filters.Status,
            filters.InvestmentId,
            filters.DateFrom,
            filters.DateTo
        );

        var total = await _transactionRepository.GetTotalCountByUserIdAsync(
            userId,
            filters.Search,
            filters.Type,
            filters.Status,
            filters.InvestmentId,
            filters.DateFrom,
            filters.DateTo
        );

        return (transactions, total);
    }

    public async Task<List<Transaction>> GetByInvestmentIdAsync(Guid investmentId, Guid userId)
    {
        // Verify investment belongs to user
        var investment = await _investmentRepository.GetByIdAndUserIdAsync(investmentId, userId);
        if (investment == null)
        {
            throw new InvalidOperationException("Investment not found");
        }

        return await _transactionRepository.GetByInvestmentIdAsync(investmentId);
    }
}

