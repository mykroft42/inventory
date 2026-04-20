using System.Net;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;

namespace backend.Middleware;

public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        var code = HttpStatusCode.InternalServerError;
        string message = "An unexpected error occurred. Please try again later.";

        // Handle specific exception types
        if (ex is ArgumentException || ex is InvalidOperationException)
        {
            code = HttpStatusCode.BadRequest;
            message = ex.Message;
        }
        else if (ex is KeyNotFoundException)
        {
            code = HttpStatusCode.NotFound;
            message = "The requested item was not found.";
        }
        else if (ex is DbUpdateException)
        {
            code = HttpStatusCode.Conflict;
            message = "A database conflict occurred. Please check your data and try again.";
        }
        else if (ex is UnauthorizedAccessException)
        {
            code = HttpStatusCode.Unauthorized;
            message = "You are not authorized to perform this action.";
        }

        // Log the exception
        _logger.LogError(ex, "An error occurred while processing the request: {Message}", ex.Message);

        var result = JsonSerializer.Serialize(new
        {
            error = message,
            statusCode = (int)code,
            timestamp = DateTime.UtcNow
        });

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)code;
        await context.Response.WriteAsync(result);
    }
}