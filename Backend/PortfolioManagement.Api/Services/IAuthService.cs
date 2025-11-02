using PortfolioManagement.Api.Models.Entities;
using PortfolioManagement.Api.Models.Requests;
using PortfolioManagement.Api.Models.Responses;

namespace PortfolioManagement.Api.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse?> LoginAsync(LoginRequest request);
    Task LogoutAsync(string refreshToken);
    Task<AuthResponse?> RefreshTokenAsync(string refreshToken);
    Task<bool> ForgotPasswordAsync(ForgotPasswordRequest request);
    Task<bool> ResetPasswordAsync(ResetPasswordRequest request);
    Task<User?> GetProfileAsync(Guid userId);
    Task<User?> UpdateProfileAsync(Guid userId, ProfileUpdateRequest request);
    Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordRequest request);
}

