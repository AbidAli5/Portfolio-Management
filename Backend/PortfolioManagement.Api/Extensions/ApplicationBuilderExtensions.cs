using PortfolioManagement.Api.Middleware;

namespace PortfolioManagement.Api.Extensions;

public static class ApplicationBuilderExtensions
{
    public static IApplicationBuilder UseCustomMiddleware(this IApplicationBuilder app)
    {
        app.UseMiddleware<ErrorHandlingMiddleware>();
        app.UseMiddleware<JwtMiddleware>();
        return app;
    }

    public static IApplicationBuilder UseCustomCors(this IApplicationBuilder app, IConfiguration configuration)
    {
        var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() 
            ?? new[] { "http://localhost:5173", "http://localhost:5174" };

        app.UseCors(builder =>
        {
            builder.WithOrigins(allowedOrigins)
                   .AllowAnyMethod()
                   .AllowAnyHeader()
                   .AllowCredentials();
        });

        return app;
    }
}

