using PortfolioManagement.Api.Models.Entities;

namespace PortfolioManagement.Api.Models.Responses;

public class AuthResponse
{
    public User User { get; set; } = null!;
    public string Token { get; set; } = string.Empty;
    public string? RefreshToken { get; set; }
}

