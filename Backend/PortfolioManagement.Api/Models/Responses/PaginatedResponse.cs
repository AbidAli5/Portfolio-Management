namespace PortfolioManagement.Api.Models.Responses;

public class PaginatedResponse<T>
{
    public List<T> Data { get; set; } = new();
    public int Total { get; set; }
    public int Page { get; set; }
    public int Limit { get; set; }
    public int TotalPages { get; set; }
}

