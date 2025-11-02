using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using PortfolioManagement.Api.Models.Responses;

namespace PortfolioManagement.Api.Middleware;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var code = HttpStatusCode.InternalServerError;
        var message = "An error occurred while processing your request.";

        switch (exception)
        {
            case InvalidOperationException:
                code = HttpStatusCode.BadRequest;
                message = exception.Message;
                break;
            case UnauthorizedAccessException:
                code = HttpStatusCode.Unauthorized;
                message = "Unauthorized access";
                break;
        }

        // In development, include more details
        if (context.RequestServices.GetRequiredService<IWebHostEnvironment>().IsDevelopment())
        {
            message = exception.Message;
            if (exception.InnerException != null)
            {
                message += $" Inner: {exception.InnerException.Message}";
            }
            _logger.LogError(exception, "Exception details: {Message}", exception.ToString());
        }

        var response = ApiResponse<object>.CreateError(message);
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)code;

        var options = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        return context.Response.WriteAsync(JsonSerializer.Serialize(response, options));
    }
}

