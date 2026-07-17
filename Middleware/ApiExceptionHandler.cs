using Microsoft.AspNetCore.Diagnostics;

namespace BlueHarbor.API.Middleware;

public class ApiExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        httpContext.Response.StatusCode = 500;
        httpContext.Response.ContentType = "application/json";

        await httpContext.Response.WriteAsJsonAsync(
            new { error = exception.Message },
            cancellationToken);

        return true;
    }
}