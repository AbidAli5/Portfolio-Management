namespace PortfolioManagement.Api.Models.Requests;

public class CreateInvestmentRequest
{
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal CurrentValue { get; set; }
    public DateTime PurchaseDate { get; set; }
    public string Status { get; set; } = "active";
    public string? Description { get; set; }
    public string? Symbol { get; set; }
}

