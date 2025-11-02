using PortfolioManagement.Api.Models.Responses;

namespace PortfolioManagement.Api.Services;

public interface IReportService
{
    Task<PerformanceSummaryResponse> GetPerformanceSummaryAsync(Guid userId);
    Task<List<DistributionResponse>> GetDistributionAsync(Guid userId);
    Task<List<TrendDataResponse>> GetTrendsAsync(Guid userId, int months = 12);
    Task<List<TopPerformerResponse>> GetTopPerformersAsync(Guid userId, int top = 5);
    Task<YearOverYearResponse> GetYearOverYearAsync(Guid userId);
}

public class PerformanceSummaryResponse
{
    public decimal TotalValue { get; set; }
    public decimal TotalGainLoss { get; set; }
    public decimal TotalGainLossPercentage { get; set; }
    public int ActiveInvestments { get; set; }
    public InvestmentSummary? BestInvestment { get; set; }
    public InvestmentSummary? WorstInvestment { get; set; }
}

public class InvestmentSummary
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal GainLoss { get; set; }
    public decimal GainLossPercentage { get; set; }
}

public class DistributionResponse
{
    public string Type { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public decimal Percentage { get; set; }
}

public class TrendDataResponse
{
    public string Month { get; set; } = string.Empty;
    public decimal Value { get; set; }
}

public class TopPerformerResponse
{
    public Guid InvestmentId { get; set; }
    public string InvestmentName { get; set; } = string.Empty;
    public decimal GainLoss { get; set; }
    public decimal GainLossPercentage { get; set; }
}

public class YearOverYearResponse
{
    public int CurrentYear { get; set; }
    public int PreviousYear { get; set; }
    public decimal CurrentYearValue { get; set; }
    public decimal PreviousYearValue { get; set; }
    public decimal Change { get; set; }
    public decimal ChangePercentage { get; set; }
}

