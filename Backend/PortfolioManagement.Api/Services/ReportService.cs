using Dapper;
using PortfolioManagement.Api.Data;
using PortfolioManagement.Api.Models.Responses;
using PortfolioManagement.Api.Repositories;
using PortfolioManagement.Api.Services;

namespace PortfolioManagement.Api.Services;

public class ReportService : IReportService
{
    private readonly IDbConnectionFactory _connectionFactory;
    private readonly IInvestmentRepository _investmentRepository;

    public ReportService(IDbConnectionFactory connectionFactory, IInvestmentRepository investmentRepository)
    {
        _connectionFactory = connectionFactory;
        _investmentRepository = investmentRepository;
    }

    public async Task<PerformanceSummaryResponse> GetPerformanceSummaryAsync(Guid userId)
    {
        using var connection = _connectionFactory.CreateConnection();
        
        
        var totalValueSql = "SELECT COALESCE(SUM(CurrentValue), 0) FROM Investments WHERE UserId = @UserId AND DeletedAt IS NULL AND Status = 'active'";
        var totalGainLossSql = "SELECT COALESCE(SUM(CurrentValue - Amount), 0) FROM Investments WHERE UserId = @UserId AND DeletedAt IS NULL AND Status = 'active'";
        var activeInvestmentsSql = "SELECT COUNT(*) FROM Investments WHERE UserId = @UserId AND DeletedAt IS NULL AND Status = 'active'";
        var totalAmountSql = "SELECT COALESCE(SUM(Amount), 0) FROM Investments WHERE UserId = @UserId AND DeletedAt IS NULL AND Status = 'active'";

        var totalValue = await connection.QuerySingleAsync<decimal>(totalValueSql, new { UserId = userId });
        var totalGainLoss = await connection.QuerySingleAsync<decimal>(totalGainLossSql, new { UserId = userId });
        var activeInvestments = await connection.QuerySingleAsync<int>(activeInvestmentsSql, new { UserId = userId });
        var totalAmount = await connection.QuerySingleAsync<decimal>(totalAmountSql, new { UserId = userId });

        var totalGainLossPercentage = totalAmount > 0 
            ? (totalGainLoss / totalAmount) * 100 
            : 0;

       
        var investments = await _investmentRepository.GetByUserIdAsync(userId, 1, 1000, null, null, "active", "gainLoss", "desc");
        
        InvestmentSummary? bestInvestment = null;
        InvestmentSummary? worstInvestment = null;

        var investmentList = investments.ToList();
        if (investmentList.Any())
        {
            var best = investmentList.OrderByDescending(i => i.CurrentValue - i.Amount).FirstOrDefault();
            if (best != null)
            {
                bestInvestment = new InvestmentSummary
                {
                    Id = best.Id,
                    Name = best.Name,
                    GainLoss = best.CurrentValue - best.Amount,
                    GainLossPercentage = best.Amount > 0 ? ((best.CurrentValue - best.Amount) / best.Amount) * 100 : 0
                };
            }

            var worst = investmentList.OrderBy(i => i.CurrentValue - i.Amount).FirstOrDefault();
            if (worst != null)
            {
                worstInvestment = new InvestmentSummary
                {
                    Id = worst.Id,
                    Name = worst.Name,
                    GainLoss = worst.CurrentValue - worst.Amount,
                    GainLossPercentage = worst.Amount > 0 ? ((worst.CurrentValue - worst.Amount) / worst.Amount) * 100 : 0
                };
            }
        }

        return new PerformanceSummaryResponse
        {
            TotalValue = totalValue,
            TotalGainLoss = totalGainLoss,
            TotalGainLossPercentage = totalGainLossPercentage,
            ActiveInvestments = activeInvestments,
            BestInvestment = bestInvestment,
            WorstInvestment = worstInvestment
        };
    }

    public async Task<List<DistributionResponse>> GetDistributionAsync(Guid userId)
    {
        using var connection = _connectionFactory.CreateConnection();
        
        var sql = @"
            SELECT 
                Type,
                COALESCE(SUM(CurrentValue), 0) as Value
            FROM Investments
            WHERE UserId = @UserId AND DeletedAt IS NULL AND Status = 'active'
            GROUP BY Type";

    
        var distribution = await connection.QueryAsync<dynamic>(sql, new { UserId = userId });
        
        var distributionList = new List<DistributionResponse>();
        decimal total = 0;
        
        foreach (dynamic row in distribution)
        {
           
            var type = GetPropertyValue(row, "Type", "type")?.ToString() ?? string.Empty;
            var value = Convert.ToDecimal(GetPropertyValue(row, "Value", "value") ?? 0);
            distributionList.Add(new DistributionResponse
            {
                Type = type,
                Value = value,
                Percentage = 0
            });
            total += value;
        }
        
        foreach (var item in distributionList)
        {
            item.Percentage = total > 0 ? (item.Value / total) * 100 : 0;
        }
        
        return distributionList;
    }

    public async Task<List<TrendDataResponse>> GetTrendsAsync(Guid userId, int months = 12)
    {
        using var connection = _connectionFactory.CreateConnection();
        
        var startDate = DateTime.UtcNow.AddMonths(-months);
        
        var sql = @"
            SELECT 
                TO_CHAR(DATE_TRUNC('month', t.Date), 'YYYY-MM') as Month,
                COALESCE(SUM(t.Amount), 0) as Value
            FROM Transactions t
            INNER JOIN Investments i ON t.InvestmentId = i.Id
            WHERE i.UserId = @UserId AND i.DeletedAt IS NULL
            AND t.Date >= @StartDate
            GROUP BY DATE_TRUNC('month', t.Date)
            ORDER BY Month";

        var trends = await connection.QueryAsync<dynamic>(sql, new { UserId = userId, StartDate = startDate });
        
        var trendList = new List<TrendDataResponse>();
        foreach (dynamic row in trends)
        {
           
            var month = GetPropertyValue(row, "Month", "month")?.ToString() ?? string.Empty;
            var value = Convert.ToDecimal(GetPropertyValue(row, "Value", "value") ?? 0);
            
            trendList.Add(new TrendDataResponse
            {
                Month = month,
                Value = value
            });
        }
        
        return trendList;
    }

    public async Task<List<TopPerformerResponse>> GetTopPerformersAsync(Guid userId, int top = 5)
    {
        var investments = await _investmentRepository.GetByUserIdAsync(userId, 1, 1000, null, null, "active", "gainLoss", "desc");
        
        return investments
            .Select(i => new TopPerformerResponse
            {
                InvestmentId = i.Id,
                InvestmentName = i.Name,
                GainLoss = i.CurrentValue - i.Amount,
                GainLossPercentage = i.Amount > 0 ? ((i.CurrentValue - i.Amount) / i.Amount) * 100 : 0
            })
            .OrderByDescending(i => i.GainLoss)
            .Take(top)
            .ToList();
    }

    public async Task<YearOverYearResponse> GetYearOverYearAsync(Guid userId)
    {
        var currentYear = DateTime.UtcNow.Year;
        var previousYear = currentYear - 1;

        using var connection = _connectionFactory.CreateConnection();
        
        // Query each year separately for better reliability
        var currentYearSql = @"
            SELECT COALESCE(SUM(i.CurrentValue), 0) 
            FROM Investments i
            WHERE i.UserId = @UserId AND i.DeletedAt IS NULL AND Status = 'active'
            AND EXTRACT(YEAR FROM i.PurchaseDate) = @CurrentYear";
        
        var previousYearSql = @"
            SELECT COALESCE(SUM(i.CurrentValue), 0) 
            FROM Investments i
            WHERE i.UserId = @UserId AND i.DeletedAt IS NULL AND Status = 'active'
            AND EXTRACT(YEAR FROM i.PurchaseDate) = @PreviousYear";

        var currentYearValue = await connection.QuerySingleAsync<decimal>(currentYearSql, new 
        { 
            UserId = userId, 
            CurrentYear = currentYear 
        });
        
        var previousYearValue = await connection.QuerySingleAsync<decimal>(previousYearSql, new 
        { 
            UserId = userId, 
            PreviousYear = previousYear 
        });

        var change = currentYearValue - previousYearValue;
        var changePercentage = previousYearValue > 0 
            ? (change / previousYearValue) * 100 
            : 0;

        return new YearOverYearResponse
        {
            CurrentYear = currentYear,
            PreviousYear = previousYear,
            CurrentYearValue = (decimal)currentYearValue,
            PreviousYearValue = (decimal)previousYearValue,
            Change = change,
            ChangePercentage = changePercentage
        };
    }

    private static object? GetPropertyValue(dynamic obj, string pascalCaseKey, string camelCaseKey)
    {
        try
        {
            var dict = obj as IDictionary<string, object>;
            if (dict != null)
            {
                if (dict.TryGetValue(pascalCaseKey, out var pascalValue))
                    return pascalValue;
                if (dict.TryGetValue(camelCaseKey, out var camelValue))
                    return camelValue;
            }
            
            var type = obj?.GetType();
            var pascalProp = type?.GetProperty(pascalCaseKey);
            if (pascalProp != null)
                return pascalProp.GetValue(obj);
            
            var camelProp = type?.GetProperty(camelCaseKey);
            if (camelProp != null)
                return camelProp.GetValue(obj);
                
            return null;
        }
        catch
        {
            return null;
        }
    }
}

