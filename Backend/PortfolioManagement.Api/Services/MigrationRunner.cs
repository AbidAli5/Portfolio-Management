using System.Data;
using BCrypt.Net;
using Dapper;
using PortfolioManagement.Api.Data;
using PortfolioManagement.Api.Models.Entities;
using PortfolioManagement.Api.Repositories;

namespace PortfolioManagement.Api.Services;

public class MigrationRunner : IMigrationRunner
{
    private readonly IDbConnectionFactory _connectionFactory;
    private readonly IConfiguration _configuration;
    private readonly IUserRepository _userRepository;
    private readonly IInvestmentRepository _investmentRepository;
    private readonly ITransactionRepository _transactionRepository;
    private readonly ILogger<MigrationRunner> _logger;

    public MigrationRunner(
        IDbConnectionFactory connectionFactory,
        IConfiguration configuration,
        IUserRepository userRepository,
        IInvestmentRepository investmentRepository,
        ITransactionRepository transactionRepository,
        ILogger<MigrationRunner> logger)
    {
        _connectionFactory = connectionFactory;
        _configuration = configuration;
        _userRepository = userRepository;
        _investmentRepository = investmentRepository;
        _transactionRepository = transactionRepository;
        _logger = logger;
    }

    public async Task RunMigrationsAsync()
    {
        try
        {
            _logger.LogInformation("Starting database migrations...");

            using var connection = _connectionFactory.CreateConnection();

            // Read migration files
            var migrationsPath = Path.Combine(Directory.GetCurrentDirectory(), "Migrations");
            
            var migrationFiles = new[]
            {
                "001_CreateTables.sql",
                "002_CreateIndexes.sql",
                "003_CreateForeignKeys.sql"
            };

            foreach (var file in migrationFiles)
            {
                var filePath = Path.Combine(migrationsPath, file);
                if (File.Exists(filePath))
                {
                    var sql = await File.ReadAllTextAsync(filePath);
                    await connection.ExecuteAsync(sql);
                    _logger.LogInformation($"Executed migration: {file}");
                }
            }

            _logger.LogInformation("Database migrations completed successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error running migrations");
            throw;
        }
    }

    public async Task SeedDataAsync()
    {
        try
        {
            _logger.LogInformation("Starting data seeding...");

            // Seed users with actual BCrypt hashed passwords
            await SeedUsersAsync();
            
            // Seed investments
            await SeedInvestmentsAsync();
            
            // Seed transactions
            await SeedTransactionsAsync();

            _logger.LogInformation("Data seeding completed successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding data");
            throw;
        }
    }

    private async Task SeedUsersAsync()
    {
        // Check if users already exist
        var admin = await _userRepository.GetByEmailAsync("admin@portfolio.com");
        if (admin != null)
        {
            _logger.LogInformation("Users already seeded, skipping...");
            return;
        }

        var adminId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var user1Id = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var user2Id = Guid.Parse("33333333-3333-3333-3333-333333333333");

        // Hash passwords with BCrypt
        var adminPasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123", 12);
        var userPasswordHash = BCrypt.Net.BCrypt.HashPassword("User@123", 12);

        var users = new[]
        {
            new User
            {
                Id = adminId,
                Email = "admin@portfolio.com",
                PasswordHash = adminPasswordHash,
                FirstName = "Admin",
                LastName = "User",
                Role = "admin",
                IsActive = true,
                EmailVerified = true,
                CreatedAt = DateTime.UtcNow.AddMonths(-12),
                UpdatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = user1Id,
                Email = "user1@portfolio.com",
                PasswordHash = userPasswordHash,
                FirstName = "John",
                LastName = "Doe",
                Role = "user",
                IsActive = true,
                EmailVerified = true,
                CreatedAt = DateTime.UtcNow.AddMonths(-6),
                UpdatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = user2Id,
                Email = "user2@portfolio.com",
                PasswordHash = userPasswordHash,
                FirstName = "Jane",
                LastName = "Smith",
                Role = "user",
                IsActive = true,
                EmailVerified = true,
                CreatedAt = DateTime.UtcNow.AddMonths(-4),
                UpdatedAt = DateTime.UtcNow
            }
        };

        foreach (var user in users)
        {
            await _userRepository.CreateAsync(user);
        }

        _logger.LogInformation("Seeded users successfully.");
    }

    private async Task SeedInvestmentsAsync()
    {
        var user1Id = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var user2Id = Guid.Parse("33333333-3333-3333-3333-333333333333");

        var investmentTypes = new[] { "stocks", "bonds", "crypto", "real-estate", "mutual-funds", "etf" };
        var statuses = new[] { "active", "sold", "closed" };
        var random = new Random();

        var investments = new List<Investment>();
        var baseDate = DateTime.UtcNow.AddYears(-2);

        // Generate 20+ investments for user1
        for (int i = 1; i <= 12; i++)
        {
            var purchaseDate = baseDate.AddDays(random.Next(0, 730));
            var amount = (decimal)(random.Next(500, 500000) + random.NextDouble() * 1000);
            var gainLossPercent = (decimal)(random.Next(-30, 50) + random.NextDouble());
            var currentValue = amount * (1 + gainLossPercent / 100);

            investments.Add(new Investment
            {
                Id = Guid.NewGuid(),
                UserId = user1Id,
                Name = $"Investment {i} - {investmentTypes[random.Next(investmentTypes.Length)]}",
                Type = investmentTypes[random.Next(investmentTypes.Length)],
                Amount = amount,
                CurrentValue = currentValue,
                PurchaseDate = purchaseDate,
                Status = statuses[random.Next(statuses.Length)],
                Description = $"Investment description for investment {i}",
                Symbol = $"SYM{i:000}",
                CreatedAt = purchaseDate,
                UpdatedAt = DateTime.UtcNow
            });
        }

        // Generate 10+ investments for user2
        for (int i = 1; i <= 10; i++)
        {
            var purchaseDate = baseDate.AddDays(random.Next(0, 730));
            var amount = (decimal)(random.Next(500, 500000) + random.NextDouble() * 1000);
            var gainLossPercent = (decimal)(random.Next(-30, 50) + random.NextDouble());
            var currentValue = amount * (1 + gainLossPercent / 100);

            investments.Add(new Investment
            {
                Id = Guid.NewGuid(),
                UserId = user2Id,
                Name = $"Investment {i} - {investmentTypes[random.Next(investmentTypes.Length)]}",
                Type = investmentTypes[random.Next(investmentTypes.Length)],
                Amount = amount,
                CurrentValue = currentValue,
                PurchaseDate = purchaseDate,
                Status = statuses[random.Next(statuses.Length)],
                Description = $"Investment description for investment {i}",
                Symbol = $"SYM{i:000}",
                CreatedAt = purchaseDate,
                UpdatedAt = DateTime.UtcNow
            });
        }

        foreach (var investment in investments)
        {
            await _investmentRepository.CreateAsync(investment);
        }

        _logger.LogInformation($"Seeded {investments.Count} investments successfully.");
    }

    private async Task SeedTransactionsAsync()
    {
        var user1Id = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var user2Id = Guid.Parse("33333333-3333-3333-3333-333333333333");

        // Get investments for each user
        var user1Investments = await _investmentRepository.GetByUserIdAsync(user1Id, 1, 100, null, null, null, null, null);
        var user2Investments = await _investmentRepository.GetByUserIdAsync(user2Id, 1, 100, null, null, null, null, null);

        var transactionTypes = new[] { "buy", "sell", "dividend", "interest", "fee" };
        var statuses = new[] { "completed", "pending", "cancelled" };
        var random = new Random();

        var transactions = new List<Transaction>();

        // Generate transactions for user1 investments
        foreach (var investment in user1Investments)
        {
            var transactionCount = random.Next(2, 6); // 2-5 transactions per investment
            
            for (int i = 0; i < transactionCount; i++)
            {
                var transactionDate = investment.PurchaseDate.AddDays(random.Next(0, 730));
                var type = transactionTypes[random.Next(transactionTypes.Length)];
                var quantity = (decimal)(random.Next(1, 100) + random.NextDouble());
                var price = investment.Amount / (quantity * 2) * (decimal)(0.8 + random.NextDouble() * 0.4);
                var fees = (decimal)(random.Next(0, 100) + random.NextDouble());
                var amount = quantity * price + fees;

                transactions.Add(new Transaction
                {
                    Id = Guid.NewGuid(),
                    InvestmentId = investment.Id,
                    Type = type,
                    Quantity = quantity,
                    Price = price,
                    Amount = amount,
                    Fees = fees,
                    Date = transactionDate,
                    Status = statuses[random.Next(statuses.Length)],
                    Notes = $"Transaction {i + 1} for {investment.Name}",
                    CreatedAt = transactionDate,
                    UpdatedAt = DateTime.UtcNow
                });
            }
        }

        // Generate transactions for user2 investments
        foreach (var investment in user2Investments)
        {
            var transactionCount = random.Next(2, 5);
            
            for (int i = 0; i < transactionCount; i++)
            {
                var transactionDate = investment.PurchaseDate.AddDays(random.Next(0, 730));
                var type = transactionTypes[random.Next(transactionTypes.Length)];
                var quantity = (decimal)(random.Next(1, 100) + random.NextDouble());
                var price = investment.Amount / (quantity * 2) * (decimal)(0.8 + random.NextDouble() * 0.4);
                var fees = (decimal)(random.Next(0, 100) + random.NextDouble());
                var amount = quantity * price + fees;

                transactions.Add(new Transaction
                {
                    Id = Guid.NewGuid(),
                    InvestmentId = investment.Id,
                    Type = type,
                    Quantity = quantity,
                    Price = price,
                    Amount = amount,
                    Fees = fees,
                    Date = transactionDate,
                    Status = statuses[random.Next(statuses.Length)],
                    Notes = $"Transaction {i + 1} for {investment.Name}",
                    CreatedAt = transactionDate,
                    UpdatedAt = DateTime.UtcNow
                });
            }
        }

        foreach (var transaction in transactions)
        {
            await _transactionRepository.CreateAsync(transaction);
        }

        _logger.LogInformation($"Seeded {transactions.Count} transactions successfully.");
    }
}

