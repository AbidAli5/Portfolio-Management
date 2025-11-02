namespace PortfolioManagement.Api.Models.Entities;

public class Transaction
{
    public Guid Id { get; set; }
    public Guid InvestmentId { get; set; }
    public string Type { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal Amount { get; set; }
    public decimal? Fees { get; set; }
    public DateTime Date { get; set; }
    public string Status { get; set; } = "completed";
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

