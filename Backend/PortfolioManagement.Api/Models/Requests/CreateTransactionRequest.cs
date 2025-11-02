namespace PortfolioManagement.Api.Models.Requests;

public class CreateTransactionRequest
{
    public Guid InvestmentId { get; set; }
    public string Type { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal Price { get; set; }
    public decimal? Fees { get; set; }
    public DateTime Date { get; set; }
    public string Status { get; set; } = "completed";
    public string? Notes { get; set; }
}

