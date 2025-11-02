namespace PortfolioManagement.Api.Models.Requests;

public class UpdateUserRequest
{
    public string? Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Role { get; set; }
    public bool? IsActive { get; set; }
    public bool? EmailVerified { get; set; }
    public string? Password { get; set; }
}

