using BCrypt.Net;
using Dapper;
using PortfolioManagement.Api.Data;
using PortfolioManagement.Api.Models.Entities;
using PortfolioManagement.Api.Models.Requests;
using PortfolioManagement.Api.Repositories;
using PortfolioManagement.Api.Services;

namespace PortfolioManagement.Api.Services;

public class AdminService : IAdminService
{
    private readonly IUserRepository _userRepository;
    private readonly IInvestmentRepository _investmentRepository;
    private readonly ITransactionRepository _transactionRepository;
    private readonly IActivityLogRepository _activityLogRepository;
    private readonly IDbConnectionFactory _connectionFactory;

    public AdminService(
        IUserRepository userRepository,
        IInvestmentRepository investmentRepository,
        ITransactionRepository transactionRepository,
        IActivityLogRepository activityLogRepository,
        IDbConnectionFactory connectionFactory)
    {
        _userRepository = userRepository;
        _investmentRepository = investmentRepository;
        _transactionRepository = transactionRepository;
        _activityLogRepository = activityLogRepository;
        _connectionFactory = connectionFactory;
    }

    public async Task<(List<User> Users, int Total)> GetAllUsersAsync(UserFilters filters)
    {
        var users = await _userRepository.GetAllAsync(
            filters.Page,
            filters.Limit,
            filters.Search,
            filters.Role,
            filters.IsActive
        );

        var total = await _userRepository.GetTotalCountAsync(
            filters.Search,
            filters.Role,
            filters.IsActive
        );

        return (users, total);
    }

    public async Task<User?> GetUserByIdAsync(Guid id)
    {
        return await _userRepository.GetByIdAsync(id);
    }

    public async Task<User> CreateUserAsync(CreateUserRequest request)
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
            Role = request.Role,
            IsActive = request.IsActive,
            EmailVerified = request.EmailVerified,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        return await _userRepository.CreateAsync(user);
    }

    public async Task<User?> UpdateUserAsync(Guid id, UpdateUserRequest request)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            return null;
        }

        // Update fields if provided
        if (!string.IsNullOrEmpty(request.Email))
        {
            // Check if email is already taken by another user
            var existingUser = await _userRepository.GetByEmailAsync(request.Email);
            if (existingUser != null && existingUser.Id != id)
            {
                throw new InvalidOperationException("Email is already taken by another user");
            }
            user.Email = request.Email;
        }

        if (!string.IsNullOrEmpty(request.FirstName))
            user.FirstName = request.FirstName;

        if (!string.IsNullOrEmpty(request.LastName))
            user.LastName = request.LastName;

        if (!string.IsNullOrEmpty(request.Role))
            user.Role = request.Role;

        if (request.IsActive.HasValue)
            user.IsActive = request.IsActive.Value;

        if (request.EmailVerified.HasValue)
            user.EmailVerified = request.EmailVerified.Value;

        // Update password if provided
        if (!string.IsNullOrEmpty(request.Password))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, 12);
        }

        user.UpdatedAt = DateTime.UtcNow;

        return await _userRepository.UpdateAsync(user);
    }

    public async Task<bool> ActivateUserAsync(Guid id, bool isActive)
    {
        return await _userRepository.ActivateAsync(id, isActive);
    }

    public async Task<bool> DeleteUserAsync(Guid id)
    {
        return await _userRepository.DeleteAsync(id);
    }

    public async Task<SystemStatsResponse> GetSystemStatsAsync()
    {
        using var connection = _connectionFactory.CreateConnection();
        
        // Query each stat separately for better reliability
        var totalUsersSql = "SELECT COUNT(*) FROM Users WHERE DeletedAt IS NULL";
        var activeUsersSql = "SELECT COUNT(*) FROM Users WHERE DeletedAt IS NULL AND IsActive = true";
        var totalInvestmentsSql = "SELECT COUNT(*) FROM Investments WHERE DeletedAt IS NULL";
        var totalInvestmentValueSql = "SELECT COALESCE(SUM(CurrentValue), 0) FROM Investments WHERE DeletedAt IS NULL";
        var activeTransactionsSql = "SELECT COUNT(*) FROM Transactions WHERE Status = 'completed'";

        var totalUsers = await connection.QuerySingleAsync<int>(totalUsersSql);
        var activeUsers = await connection.QuerySingleAsync<int>(activeUsersSql);
        var totalInvestments = await connection.QuerySingleAsync<int>(totalInvestmentsSql);
        var totalInvestmentValue = await connection.QuerySingleAsync<decimal>(totalInvestmentValueSql);
        var activeTransactions = await connection.QuerySingleAsync<int>(activeTransactionsSql);

        return new SystemStatsResponse
        {
            TotalUsers = totalUsers,
            ActiveUsers = activeUsers,
            TotalInvestments = totalInvestments,
            TotalInvestmentValue = totalInvestmentValue,
            ActiveTransactions = activeTransactions
        };
    }

    public async Task<(List<ActivityLog> Logs, int Total)> GetActivityLogsAsync(ActivityLogFilters filters)
    {
        var logs = await _activityLogRepository.GetAllAsync(
            filters.Page,
            filters.Limit,
            filters.UserId,
            filters.Action,
            filters.EntityType,
            filters.DateFrom,
            filters.DateTo
        );

        var total = await _activityLogRepository.GetTotalCountAsync(
            filters.UserId,
            filters.Action,
            filters.EntityType,
            filters.DateFrom,
            filters.DateTo
        );

        return (logs, total);
    }
}

