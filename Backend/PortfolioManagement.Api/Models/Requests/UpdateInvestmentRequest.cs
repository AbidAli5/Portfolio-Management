namespace PortfolioManagement.Api.Models.Requests;

public class UpdateInvestmentRequest
{
    public string? Name { get; set; }
    public string? Type { get; set; }
    public decimal? Amount { get; set; }
    public decimal? CurrentValue { get; set; }
    public DateTime? PurchaseDate { get; set; }
    public string? Status { get; set; }
    public string? Description { get; set; }
    public string? Symbol { get; set; }
}

