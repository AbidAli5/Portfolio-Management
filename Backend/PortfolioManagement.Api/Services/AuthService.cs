using BCrypt.Net;
using PortfolioManagement.Api.Models.Entities;
using PortfolioManagement.Api.Models.Requests;
using PortfolioManagement.Api.Models.Responses;
using PortfolioManagement.Api.Repositories;

namespace PortfolioManagement.Api.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IActivityLogService _activityLogService;

    public AuthService(
        IUserRepository userRepository,
        ITokenService tokenService,
        IRefreshTokenRepository refreshTokenRepository,
        IActivityLogService activityLogService)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
        _refreshTokenRepository = refreshTokenRepository;
        _activityLogService = activityLogService;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        // Check if user already exists
        var existingUser = await _userRepository.GetByEmailAsync(request.Email);
        if (existingUser != null)
        {
            throw new InvalidOperationException("User with this email already exists");
        }

        // Hash password
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, 12);

        // Create user
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            PasswordHash = passwordHash,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Role = "user",
            IsActive = true,
            EmailVerified = false, // Simulated - would be set to true after email verification
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        user = await _userRepository.CreateAsync(user);

        // Generate tokens
        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();

        // Store refresh token
        await _refreshTokenRepository.CreateAsync(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow
        });

        return new AuthResponse
        {
            User = user,
            Token = accessToken,
            RefreshToken = refreshToken
        };
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null || !user.IsActive)
        {
            return null;
        }

        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return null;
        }

        // Generate tokens
        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();

        // Store refresh token
        await _refreshTokenRepository.CreateAsync(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = refreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow
        });

        // Log login activity
        await _activityLogService.LogAsync(user.Id, "login", "user", user.Id.ToString(), 
            $"User logged in: {user.Email}");

        return new AuthResponse
        {
            User = user,
            Token = accessToken,
            RefreshToken = refreshToken
        };
    }

    public async Task LogoutAsync(string refreshToken)
    {
        await _refreshTokenRepository.DeleteByTokenAsync(refreshToken);
    }

    public async Task<AuthResponse?> RefreshTokenAsync(string refreshToken)
    {
        var token = await _refreshTokenRepository.GetByTokenAsync(refreshToken);
        if (token == null || token.ExpiresAt < DateTime.UtcNow)
        {
            return null;
        }

        var user = await _userRepository.GetByIdAsync(token.UserId);
        if (user == null || !user.IsActive)
        {
            return null;
        }

        // Generate new tokens
        var accessToken = _tokenService.GenerateAccessToken(user);
        var newRefreshToken = _tokenService.GenerateRefreshToken();

        // Delete old refresh token
        await _refreshTokenRepository.DeleteByTokenAsync(refreshToken);

        // Store new refresh token
        await _refreshTokenRepository.CreateAsync(new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = newRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddDays(7),
            CreatedAt = DateTime.UtcNow
        });

        return new AuthResponse
        {
            User = user,
            Token = accessToken,
            RefreshToken = newRefreshToken
        };
    }

    public async Task<bool> ForgotPasswordAsync(ForgotPasswordRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null)
        {
            // Don't reveal if email exists for security
            return true;
        }

        // Generate reset token (simulated - in production, send email)
        var resetToken = Guid.NewGuid().ToString();
        // Store reset token in database would go here
        // For now, just return true (simulated)
        return true;
    }

    public async Task<bool> ResetPasswordAsync(ResetPasswordRequest request)
    {
        // Validate token and reset password
        // This is simulated - in production, validate token from database
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, 12);
        // Update password in database would go here
        return true;
    }

    public async Task<User?> GetProfileAsync(Guid userId)
    {
        return await _userRepository.GetByIdAsync(userId);
    }

    public async Task<User?> UpdateProfileAsync(Guid userId, ProfileUpdateRequest request)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return null;
        }

        if (!string.IsNullOrEmpty(request.FirstName))
            user.FirstName = request.FirstName;
        if (!string.IsNullOrEmpty(request.LastName))
            user.LastName = request.LastName;
        if (!string.IsNullOrEmpty(request.Email))
            user.Email = request.Email;

        user.UpdatedAt = DateTime.UtcNow;

        return await _userRepository.UpdateAsync(user);
    }

    public async Task<bool> ChangePasswordAsync(Guid userId, ChangePasswordRequest request)
    {
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
        {
            return false;
        }

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            return false;
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword, 12);
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateAsync(user);
        return true;
    }
}

