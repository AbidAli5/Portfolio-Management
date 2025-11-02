using System.Security.Claims;
using System.Text.Json;
using PortfolioManagement.Api.Data;
using PortfolioManagement.Api.Extensions;
using PortfolioManagement.Api.Filters;
using PortfolioManagement.Api.Models.Requests;
using PortfolioManagement.Api.Models.Responses;
using PortfolioManagement.Api.Repositories;
using PortfolioManagement.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Portfolio Management API",
        Version = "v1",
        Description = "API for Investment Portfolio Management System"
    });

    // Add JWT Authentication to Swagger
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});
builder.Services.AddOpenApi();
builder.Services.AddApplicationServices();

// Add CORS
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() 
    ?? new[] { "http://localhost:5173", "http://localhost:5174" };

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Portfolio Management API v1");
        c.RoutePrefix = "swagger"; // Access Swagger UI at /swagger
        c.DisplayRequestDuration();
        c.EnableDeepLinking();
        c.EnableFilter();
    });
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCustomCors(builder.Configuration);
app.UseCustomMiddleware();

// Run migrations and seed data on startup
using (var scope = app.Services.CreateScope())
{
    var migrationRunner = scope.ServiceProvider.GetRequiredService<IMigrationRunner>();
    try
    {
        await migrationRunner.RunMigrationsAsync();
        await migrationRunner.SeedDataAsync();
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while running migrations or seeding data");
    }
}

// Configure JSON options
var jsonOptions = new JsonSerializerOptions
{
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
};

// ========== HEALTH CHECK ENDPOINT ==========
app.MapGet("/health", async (IDbConnectionFactory connectionFactory) =>
{
    var startTime = DateTime.UtcNow;
    
    try
    {
        // Check database connectivity
        using var connection = connectionFactory.CreateConnection();
        connection.Open();
        
        // Simple query to verify database is accessible
        using var command = connection.CreateCommand();
        command.CommandText = "SELECT 1";
        var result = command.ExecuteScalar();
        var responseTime = (DateTime.UtcNow - startTime).TotalMilliseconds;

        var detailedStatus = new
        {
            status = "healthy",
            timestamp = DateTime.UtcNow,
            service = "Portfolio Management API",
            version = "v1.0",
            database = new
            {
                status = "connected",
                responseTime = $"{responseTime:F2}ms"
            },
            uptime = (DateTime.UtcNow - System.Diagnostics.Process.GetCurrentProcess().StartTime.ToUniversalTime()).TotalSeconds
        };

        return Results.Ok(ApiResponse<object>.CreateSuccess(detailedStatus));
    }
    catch (Exception ex)
    {
        // Database check failed but API is still running
        var degradedStatus = new
        {
            status = "degraded",
            timestamp = DateTime.UtcNow,
            service = "Portfolio Management API",
            version = "v1.0",
            database = new
            {
                status = "disconnected",
                error = ex.Message
            },
            uptime = (DateTime.UtcNow - System.Diagnostics.Process.GetCurrentProcess().StartTime.ToUniversalTime()).TotalSeconds
        };

        return Results.Json(degradedStatus, statusCode: 503); // Service Unavailable
    }
}).WithTags("Health").WithName("HealthCheck").AllowAnonymous();

// ========== AUTH ENDPOINTS ==========
var authGroup = app.MapGroup("/api/auth").WithTags("Auth");

authGroup.MapPost("/register", async (RegisterRequest request, IAuthService authService) =>
{
    try
    {
        var response = await authService.RegisterAsync(request);
        return Results.Ok(ApiResponse<AuthResponse>.CreateSuccess(response, "Registration successful"));
    }
    catch (InvalidOperationException ex)
    {
        return Results.BadRequest(ApiResponse<object>.CreateError(ex.Message));
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
});

authGroup.MapPost("/login", async (LoginRequest request, IAuthService authService) =>
{
    var response = await authService.LoginAsync(request);
    if (response == null)
    {
        return Results.Unauthorized();
    }
    return Results.Ok(ApiResponse<AuthResponse>.CreateSuccess(response));
});

authGroup.MapPost("/logout", async (HttpContext context, RefreshTokenRequest? request, IAuthService authService) =>
{
    // Try to get refresh token from request body, or from header/token if available
    var refreshToken = request?.RefreshToken ?? string.Empty;
    if (!string.IsNullOrEmpty(refreshToken))
    {
        await authService.LogoutAsync(refreshToken);
    }
    return Results.Ok(ApiResponse<object>.CreateSuccess(null, "Logged out successfully"));
});

authGroup.MapPost("/refresh", async (RefreshTokenRequest request, IAuthService authService) =>
{
    var response = await authService.RefreshTokenAsync(request.RefreshToken);
    if (response == null)
    {
        return Results.Unauthorized();
    }
    return Results.Ok(ApiResponse<AuthResponse>.CreateSuccess(response));
});

authGroup.MapPost("/forgot-password", async (ForgotPasswordRequest request, IAuthService authService) =>
{
    await authService.ForgotPasswordAsync(request);
    return Results.Ok(ApiResponse<object>.CreateSuccess(null, "If an account exists with this email, a password reset link has been sent."));
});

authGroup.MapPost("/reset-password", async (ResetPasswordRequest request, IAuthService authService) =>
{
    var result = await authService.ResetPasswordAsync(request);
    if (!result)
    {
        return Results.BadRequest(ApiResponse<object>.CreateError("Invalid or expired reset token"));
    }
    return Results.Ok(ApiResponse<object>.CreateSuccess(null, "Password reset successful"));
});

authGroup.MapGet("/profile", async (HttpContext context, IAuthService authService) =>
{
    var userId = context.User.GetUserId();
    if (!userId.HasValue)
    {
        return Results.Unauthorized();
    }

    var user = await authService.GetProfileAsync(userId.Value);
    if (user == null)
    {
        return Results.NotFound(ApiResponse<object>.CreateError("User not found"));
    }

    return Results.Ok(ApiResponse<object>.CreateSuccess(user));
});

authGroup.MapPut("/profile", async (HttpContext context, ProfileUpdateRequest request, IAuthService authService) =>
{
    var userId = context.User.GetUserId();
    if (!userId.HasValue)
    {
        return Results.Unauthorized();
    }

    var user = await authService.UpdateProfileAsync(userId.Value, request);
    if (user == null)
    {
        return Results.NotFound(ApiResponse<object>.CreateError("User not found"));
    }

    return Results.Ok(ApiResponse<object>.CreateSuccess(user, "Profile updated successfully"));
});

authGroup.MapPost("/change-password", async (HttpContext context, ChangePasswordRequest request, IAuthService authService) =>
{
    var userId = context.User.GetUserId();
    if (!userId.HasValue)
    {
        return Results.Unauthorized();
    }

    var result = await authService.ChangePasswordAsync(userId.Value, request);
    if (!result)
    {
        return Results.BadRequest(ApiResponse<object>.CreateError("Current password is incorrect"));
    }

    return Results.Ok(ApiResponse<object>.CreateSuccess(null, "Password changed successfully"));
});

// ========== INVESTMENT ENDPOINTS ==========
var investmentGroup = app.MapGroup("/api/investments").WithTags("Investments");

investmentGroup.MapGet("", async (HttpContext context, IInvestmentService investmentService, 
    int page = 1, int limit = 10, string? search = null, string? type = null, 
    string? status = null, string? sortBy = null, string? sortOrder = null) =>
{
    var userId = context.User.GetUserId();
    if (!userId.HasValue)
    {
        return Results.Unauthorized();
    }

    var filters = new InvestmentFilters
    {
        Page = page,
        Limit = limit,
        Search = search,
        Type = type,
        Status = status,
        SortBy = sortBy,
        SortOrder = sortOrder
    };

    var (investments, total) = await investmentService.GetByUserIdAsync(userId.Value, filters);

    var response = new PaginatedResponse<object>
    {
        Data = investments.Cast<object>().ToList(),
        Total = total,
        Page = page,
        Limit = limit,
        TotalPages = (int)Math.Ceiling(total / (double)limit)
    };

    return Results.Ok(ApiResponse<PaginatedResponse<object>>.CreateSuccess(response));
});

investmentGroup.MapGet("/{id}", async (HttpContext context, Guid id, IInvestmentService investmentService) =>
{
    var userId = context.User.GetUserId();
    if (!userId.HasValue)
    {
        return Results.Unauthorized();
    }

    var investment = await investmentService.GetByIdAsync(id, userId.Value);
    if (investment == null)
    {
        return Results.NotFound(ApiResponse<object>.CreateError("Investment not found"));
    }

    return Results.Ok(ApiResponse<object>.CreateSuccess(investment));
});

investmentGroup.MapPost("", async (HttpContext context, CreateInvestmentRequest request, IInvestmentService investmentService) =>
{
    var userId = context.User.GetUserId();
    if (!userId.HasValue)
    {
        return Results.Unauthorized();
    }

    try
    {
        var investment = await investmentService.CreateAsync(request, userId.Value);
        return Results.Ok(ApiResponse<object>.CreateSuccess(investment, "Investment created successfully"));
    }
    catch (InvalidOperationException ex)
    {
        return Results.BadRequest(ApiResponse<object>.CreateError(ex.Message));
    }
});

investmentGroup.MapPut("/{id}", async (HttpContext context, Guid id, UpdateInvestmentRequest request, IInvestmentService investmentService) =>
{
    var userId = context.User.GetUserId();
    if (!userId.HasValue)
    {
        return Results.Unauthorized();
    }

    try
    {
        var investment = await investmentService.UpdateAsync(id, request, userId.Value);
        return Results.Ok(ApiResponse<object>.CreateSuccess(investment, "Investment updated successfully"));
    }
    catch (InvalidOperationException ex)
    {
        return Results.BadRequest(ApiResponse<object>.CreateError(ex.Message));
    }
});

investmentGroup.MapDelete("/{id}", async (HttpContext context, Guid id, IInvestmentService investmentService) =>
{
    var userId = context.User.GetUserId();
    if (!userId.HasValue)
    {
        return Results.Unauthorized();
    }

    var result = await investmentService.DeleteAsync(id, userId.Value);
    if (!result)
    {
        return Results.NotFound(ApiResponse<object>.CreateError("Investment not found"));
    }

    return Results.Ok(ApiResponse<object>.CreateSuccess(null, "Investment deleted successfully"));
});

investmentGroup.MapGet("/{id}/export", async (HttpContext context, Guid id, string format, IInvestmentService investmentService) =>
{
    var userId = context.User.GetUserId();
    if (!userId.HasValue)
    {
        return Results.Unauthorized();
    }

    var investment = await investmentService.GetByIdAsync(id, userId.Value);
    if (investment == null)
    {
        return Results.NotFound(ApiResponse<object>.CreateError("Investment not found"));
    }

    // Simulated export - in production, generate actual CSV/JSON file
    if (format.ToLower() == "csv")
    {
        var csv = $"Id,Name,Type,Amount,CurrentValue,PurchaseDate,Status\n{investment.Id},{investment.Name},{investment.Type},{investment.Amount},{investment.CurrentValue},{investment.PurchaseDate:yyyy-MM-dd},{investment.Status}";
        return Results.File(System.Text.Encoding.UTF8.GetBytes(csv), "text/csv", $"{investment.Name}.csv");
    }
    else if (format.ToLower() == "json")
    {
        var json = System.Text.Json.JsonSerializer.Serialize(investment, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        return Results.File(System.Text.Encoding.UTF8.GetBytes(json), "application/json", $"{investment.Name}.json");
    }

    return Results.BadRequest(ApiResponse<object>.CreateError("Invalid format. Use 'csv' or 'json'"));
});

// ========== TRANSACTION ENDPOINTS ==========
var transactionGroup = app.MapGroup("/api/transactions").WithTags("Transactions");

transactionGroup.MapGet("", async (HttpContext context, ITransactionService transactionService,
    int page = 1, int limit = 10, string? search = null, string? type = null,
    string? status = null, Guid? investmentId = null, DateTime? dateFrom = null, DateTime? dateTo = null) =>
{
    var userId = context.User.GetUserId();
    if (!userId.HasValue)
    {
        return Results.Unauthorized();
    }

    var filters = new TransactionFilters
    {
        Page = page,
        Limit = limit,
        Search = search,
        Type = type,
        Status = status,
        InvestmentId = investmentId,
        DateFrom = dateFrom,
        DateTo = dateTo
    };

    var (transactions, total) = await transactionService.GetByUserIdAsync(userId.Value, filters);

    var response = new PaginatedResponse<object>
    {
        Data = transactions.Cast<object>().ToList(),
        Total = total,
        Page = page,
        Limit = limit,
        TotalPages = (int)Math.Ceiling(total / (double)limit)
    };

    return Results.Ok(ApiResponse<PaginatedResponse<object>>.CreateSuccess(response));
});

transactionGroup.MapGet("/investment/{investmentId}", async (HttpContext context, Guid investmentId, ITransactionService transactionService) =>
{
    var userId = context.User.GetUserId();
    if (!userId.HasValue)
    {
        return Results.Unauthorized();
    }

    try
    {
        var transactions = await transactionService.GetByInvestmentIdAsync(investmentId, userId.Value);
        return Results.Ok(ApiResponse<object>.CreateSuccess(transactions));
    }
    catch (InvalidOperationException ex)
    {
        return Results.BadRequest(ApiResponse<object>.CreateError(ex.Message));
    }
});

transactionGroup.MapGet("/{id}", async (HttpContext context, Guid id, ITransactionService transactionService) =>
{
    var userId = context.User.GetUserId();
    if (!userId.HasValue)
    {
        return Results.Unauthorized();
    }

    var transaction = await transactionService.GetByIdAsync(id, userId.Value);
    if (transaction == null)
    {
        return Results.NotFound(ApiResponse<object>.CreateError("Transaction not found"));
    }

    return Results.Ok(ApiResponse<object>.CreateSuccess(transaction));
});

transactionGroup.MapPost("", async (HttpContext context, CreateTransactionRequest request, ITransactionService transactionService) =>
{
    var userId = context.User.GetUserId();
    if (!userId.HasValue)
    {
        return Results.Unauthorized();
    }

    try
    {
        var transaction = await transactionService.CreateAsync(request, userId.Value);
        return Results.Ok(ApiResponse<object>.CreateSuccess(transaction, "Transaction created successfully"));
    }
    catch (InvalidOperationException ex)
    {
        return Results.BadRequest(ApiResponse<object>.CreateError(ex.Message));
    }
});

transactionGroup.MapPut("/{id}", async (HttpContext context, Guid id, UpdateTransactionRequest request, ITransactionService transactionService) =>
{
    var userId = context.User.GetUserId();
    if (!userId.HasValue)
    {
        return Results.Unauthorized();
    }

    try
    {
        var transaction = await transactionService.UpdateAsync(id, request, userId.Value);
        return Results.Ok(ApiResponse<object>.CreateSuccess(transaction, "Transaction updated successfully"));
    }
    catch (InvalidOperationException ex)
    {
        return Results.BadRequest(ApiResponse<object>.CreateError(ex.Message));
    }
});

transactionGroup.MapDelete("/{id}", async (HttpContext context, Guid id, ITransactionService transactionService) =>
{
    var userId = context.User.GetUserId();
    if (!userId.HasValue)
    {
        return Results.Unauthorized();
    }

    var result = await transactionService.DeleteAsync(id, userId.Value);
    if (!result)
    {
        return Results.NotFound(ApiResponse<object>.CreateError("Transaction not found"));
    }

    return Results.Ok(ApiResponse<object>.CreateSuccess(null, "Transaction deleted successfully"));
});

// ========== REPORTS ENDPOINTS ==========
var reportGroup = app.MapGroup("/api/reports").WithTags("Reports");

reportGroup.MapGet("/performance", async (HttpContext context, IReportService reportService, string? period = "monthly") =>
{
    var userId = context.User.GetUserId();
    if (!userId.HasValue)
    {
        return Results.Unauthorized();
    }

    var summary = await reportService.GetPerformanceSummaryAsync(userId.Value);
    
    // Map to frontend expected format
    var response = new
    {
        totalValue = summary.TotalValue,
        totalGain = summary.TotalGainLoss,
        totalGainPercent = summary.TotalGainLossPercentage,
        period = period
    };
    
    return Results.Ok(ApiResponse<object>.CreateSuccess(response));
});

reportGroup.MapGet("/distribution", async (HttpContext context, IReportService reportService) =>
{
    var userId = context.User.GetUserId();
    if (!userId.HasValue)
    {
        return Results.Unauthorized();
    }

    var distribution = await reportService.GetDistributionAsync(userId.Value);
    return Results.Ok(ApiResponse<object>.CreateSuccess(distribution));
});

reportGroup.MapGet("/trends", async (HttpContext context, IReportService reportService, int months = 12) =>
{
    var userId = context.User.GetUserId();
    if (!userId.HasValue)
    {
        return Results.Unauthorized();
    }

    var trends = await reportService.GetTrendsAsync(userId.Value, months);
    return Results.Ok(ApiResponse<object>.CreateSuccess(trends));
});

reportGroup.MapGet("/top-performers", async (HttpContext context, IReportService reportService, IInvestmentRepository investmentRepository, int limit = 5) =>
{
    var userId = context.User.GetUserId();
    if (!userId.HasValue)
    {
        return Results.Unauthorized();
    }

    var performers = await reportService.GetTopPerformersAsync(userId.Value, limit);
    
    // Map to frontend expected format
    var response = new List<object>();
    foreach (var p in performers)
    {
        var investment = await investmentRepository.GetByIdAsync(p.InvestmentId);
        response.Add(new
        {
            investmentId = p.InvestmentId,
            investmentName = p.InvestmentName,
            gainLossPercent = p.GainLossPercentage,
            currentValue = investment?.CurrentValue ?? 0
        });
    }
    
    return Results.Ok(ApiResponse<object>.CreateSuccess(response));
});

reportGroup.MapGet("/year-over-year", async (HttpContext context, IReportService reportService) =>
{
    var userId = context.User.GetUserId();
    if (!userId.HasValue)
    {
        return Results.Unauthorized();
    }

    var yoy = await reportService.GetYearOverYearAsync(userId.Value);
    
    // Map to frontend expected format
    var response = new
    {
        current = yoy.CurrentYearValue,
        previous = yoy.PreviousYearValue,
        change = yoy.Change
    };
    
    return Results.Ok(ApiResponse<object>.CreateSuccess(response));
});

reportGroup.MapGet("/export", async (HttpContext context, IReportService reportService, string format) =>
{
    var userId = context.User.GetUserId();
    if (!userId.HasValue)
    {
        return Results.Unauthorized();
    }

    // Get all report data
    var performance = await reportService.GetPerformanceSummaryAsync(userId.Value);
    var distribution = await reportService.GetDistributionAsync(userId.Value);
    var trends = await reportService.GetTrendsAsync(userId.Value);

    var reportData = new
    {
        performance,
        distribution,
        trends
    };

    // Simulated export - in production, generate actual PDF/CSV/JSON file
    if (format.ToLower() == "pdf")
    {
        // PDF export would require a library like QuestPDF or iTextSharp
        return Results.BadRequest(ApiResponse<object>.CreateError("PDF export not yet implemented"));
    }
    else if (format.ToLower() == "csv")
    {
        var csv = "Report Type,Data\n";
        csv += $"Performance,Total Value: {performance.TotalValue},Total Gain: {performance.TotalGainLoss}\n";
        csv += "Distribution," + string.Join(";", distribution.Select(d => $"{d.Type}: {d.Value}"));
        return Results.File(System.Text.Encoding.UTF8.GetBytes(csv), "text/csv", "reports.csv");
    }
    else if (format.ToLower() == "json")
    {
        var json = System.Text.Json.JsonSerializer.Serialize(reportData, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        return Results.File(System.Text.Encoding.UTF8.GetBytes(json), "application/json", "reports.json");
    }

    return Results.BadRequest(ApiResponse<object>.CreateError("Invalid format. Use 'pdf', 'csv', or 'json'"));
});

// ========== ADMIN ENDPOINTS ==========
var adminGroup = app.MapGroup("/api/admin").WithTags("Admin");

adminGroup.MapGet("/users", async (HttpContext context, IAdminService adminService,
    int page = 1, int limit = 10, string? search = null, string? role = null, bool? isActive = null) =>
{
    var user = context.User;
    if (!user.IsAdmin())
    {
        return Results.Unauthorized();
    }

    var filters = new UserFilters
    {
        Page = page,
        Limit = limit,
        Search = search,
        Role = role,
        IsActive = isActive
    };

    var (users, total) = await adminService.GetAllUsersAsync(filters);

    var response = new PaginatedResponse<object>
    {
        Data = users.Cast<object>().ToList(),
        Total = total,
        Page = page,
        Limit = limit,
        TotalPages = (int)Math.Ceiling(total / (double)limit)
    };

    return Results.Ok(ApiResponse<PaginatedResponse<object>>.CreateSuccess(response));
});

adminGroup.MapGet("/users/{id}", async (HttpContext context, Guid id, IAdminService adminService) =>
{
    var user = context.User;
    if (!user.IsAdmin())
    {
        return Results.Unauthorized();
    }

    var userData = await adminService.GetUserByIdAsync(id);
    if (userData == null)
    {
        return Results.NotFound(ApiResponse<object>.CreateError("User not found"));
    }

    return Results.Ok(ApiResponse<object>.CreateSuccess(userData));
});

adminGroup.MapPost("/users", async (HttpContext context, CreateUserRequest request, IAdminService adminService) =>
{
    var user = context.User;
    if (!user.IsAdmin())
    {
        return Results.Unauthorized();
    }

    try
    {
        var newUser = await adminService.CreateUserAsync(request);
        return Results.Ok(ApiResponse<object>.CreateSuccess(newUser, "User created successfully"));
    }
    catch (InvalidOperationException ex)
    {
        return Results.BadRequest(ApiResponse<object>.CreateError(ex.Message));
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
});

adminGroup.MapPut("/users/{id}", async (HttpContext context, Guid id, UpdateUserRequest request, IAdminService adminService) =>
{
    var user = context.User;
    if (!user.IsAdmin())
    {
        return Results.Unauthorized();
    }

    try
    {
        var updatedUser = await adminService.UpdateUserAsync(id, request);
        if (updatedUser == null)
        {
            return Results.NotFound(ApiResponse<object>.CreateError("User not found"));
        }

        return Results.Ok(ApiResponse<object>.CreateSuccess(updatedUser, "User updated successfully"));
    }
    catch (InvalidOperationException ex)
    {
        return Results.BadRequest(ApiResponse<object>.CreateError(ex.Message));
    }
    catch (Exception ex)
    {
        return Results.Problem(ex.Message);
    }
});

adminGroup.MapPut("/users/{id}/activate", async (HttpContext context, Guid id, ActivateUserRequest request, IAdminService adminService) =>
{
    var user = context.User;
    if (!user.IsAdmin())
    {
        return Results.Unauthorized();
    }

    var result = await adminService.ActivateUserAsync(id, request.IsActive);
    if (!result)
    {
        return Results.NotFound(ApiResponse<object>.CreateError("User not found"));
    }

    var updatedUser = await adminService.GetUserByIdAsync(id);
    return Results.Ok(ApiResponse<object>.CreateSuccess(updatedUser, $"User {(request.IsActive ? "activated" : "deactivated")} successfully"));
});

adminGroup.MapDelete("/users/{id}", async (HttpContext context, Guid id, IAdminService adminService) =>
{
    var user = context.User;
    if (!user.IsAdmin())
    {
        return Results.Unauthorized();
    }

    var result = await adminService.DeleteUserAsync(id);
    if (!result)
    {
        return Results.NotFound(ApiResponse<object>.CreateError("User not found"));
    }

    return Results.Ok(ApiResponse<object>.CreateSuccess(null, "User deleted successfully"));
});

adminGroup.MapGet("/stats", async (HttpContext context, IAdminService adminService) =>
{
    var user = context.User;
    if (!user.IsAdmin())
    {
        return Results.Unauthorized();
    }

    var stats = await adminService.GetSystemStatsAsync();
    return Results.Ok(ApiResponse<object>.CreateSuccess(stats));
});

// Support both activity-log and activity-logs for compatibility
adminGroup.MapGet("/activity-log", async (HttpContext context, IAdminService adminService,
    int page = 1, int limit = 10, Guid? userId = null, string? action = null,
    string? entityType = null, DateTime? dateFrom = null, DateTime? dateTo = null) =>
{
    var user = context.User;
    if (!user.IsAdmin())
    {
        return Results.Unauthorized();
    }

    var filters = new ActivityLogFilters
    {
        Page = page,
        Limit = limit,
        UserId = userId,
        Action = action,
        EntityType = entityType,
        DateFrom = dateFrom,
        DateTo = dateTo
    };

    var (logs, total) = await adminService.GetActivityLogsAsync(filters);

    var response = new PaginatedResponse<object>
    {
        Data = logs.Cast<object>().ToList(),
        Total = total,
        Page = page,
        Limit = limit,
        TotalPages = (int)Math.Ceiling(total / (double)limit)
    };

    return Results.Ok(ApiResponse<PaginatedResponse<object>>.CreateSuccess(response));
});

adminGroup.MapGet("/activity-logs", async (HttpContext context, IAdminService adminService,
    int page = 1, int limit = 10, Guid? userId = null, string? action = null,
    string? entityType = null, DateTime? dateFrom = null, DateTime? dateTo = null) =>
{
    var user = context.User;
    if (!user.IsAdmin())
    {
        return Results.Unauthorized();
    }

    var filters = new ActivityLogFilters
    {
        Page = page,
        Limit = limit,
        UserId = userId,
        Action = action,
        EntityType = entityType,
        DateFrom = dateFrom,
        DateTo = dateTo
    };

    var (logs, total) = await adminService.GetActivityLogsAsync(filters);

    var response = new PaginatedResponse<object>
    {
        Data = logs.Cast<object>().ToList(),
        Total = total,
        Page = page,
        Limit = limit,
        TotalPages = (int)Math.Ceiling(total / (double)limit)
    };

    return Results.Ok(ApiResponse<PaginatedResponse<object>>.CreateSuccess(response));
});

app.Run();
