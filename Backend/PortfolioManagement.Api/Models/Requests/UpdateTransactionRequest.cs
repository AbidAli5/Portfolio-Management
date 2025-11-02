namespace PortfolioManagement.Api.Models.Requests;

public class UpdateTransactionRequest
{
    public string? Type { get; set; }
    public decimal? Quantity { get; set; }
    public decimal? Price { get; set; }
    public decimal? Fees { get; set; }
    public DateTime? Date { get; set; }
    public string? Status { get; set; }
    public string? Notes { get; set; }
}

