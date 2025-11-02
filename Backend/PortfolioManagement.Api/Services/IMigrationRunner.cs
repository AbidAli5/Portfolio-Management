namespace PortfolioManagement.Api.Services;

public interface IMigrationRunner
{
    Task RunMigrationsAsync();
    Task SeedDataAsync();
}

