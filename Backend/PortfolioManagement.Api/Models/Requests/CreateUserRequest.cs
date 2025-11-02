namespace PortfolioManagement.Api.Models.Requests;

public class CreateUserRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Role { get; set; } = "user";
    public bool IsActive { get; set; } = true;
    public bool EmailVerified { get; set; } = false;
}

