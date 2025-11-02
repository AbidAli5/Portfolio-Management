using PortfolioManagement.Api.Data;
using PortfolioManagement.Api.Repositories;
using PortfolioManagement.Api.Services;

namespace PortfolioManagement.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Data
        services.AddSingleton<IDbConnectionFactory, DbConnectionFactory>();

        // Repositories
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IInvestmentRepository, InvestmentRepository>();
        services.AddScoped<ITransactionRepository, TransactionRepository>();
        services.AddScoped<IActivityLogRepository, ActivityLogRepository>();
        services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();

        // Services
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IActivityLogService, ActivityLogService>();
        services.AddScoped<IInvestmentService, InvestmentService>();
        services.AddScoped<ITransactionService, TransactionService>();
        services.AddScoped<IReportService, ReportService>();
        services.AddScoped<IAdminService, AdminService>();
        services.AddScoped<IMigrationRunner, MigrationRunner>();

        return services;
    }
}

