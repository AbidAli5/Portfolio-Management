namespace PortfolioManagement.Api.Models.Entities;

public class Investment
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public decimal CurrentValue { get; set; }
    public DateTime PurchaseDate { get; set; }
    public string Status { get; set; } = "active";
    public string? Description { get; set; }
    public string? Symbol { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }
}

