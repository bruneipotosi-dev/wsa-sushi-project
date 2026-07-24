using BlueHarbor.API.Data;
using BlueHarbor.API.Services;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using BlueHarbor.API.Middleware;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Normalizza errori di validazione
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var messages = context.ModelState.Values
            .SelectMany(v => v.Errors)
            .Select(e => e.ErrorMessage);
        return new BadRequestObjectResult(new { error = string.Join("; ", messages) });
    };
});

// Gestore globale eccezioni
builder.Services.AddExceptionHandler<ApiExceptionHandler>();
builder.Services.AddProblemDetails();

// Assicura che la cartella Data esista prima che SQLite provi a scriverci dentro
// (necessario in ambienti come Railway, dove la cartella non esiste finché non viene creata)
Directory.CreateDirectory("Data");

// Collega il database SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IAssignmentService, AssignmentService>();
builder.Services.AddScoped<IPortLogService, PortLogService>();

// CORS — aperto temporaneamente per il deploy rapido su Railway
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();
app.UseExceptionHandler();

// Crea il database automaticamente all'avvio
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// Swagger sempre attivo — comodo per i test, e apre direttamente su http://localhost:5000
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "BlueHarbor API V1");
    c.RoutePrefix = string.Empty;
});

// HttpsRedirection disattivato in sviluppo locale (evita warning con http://localhost)
// app.UseHttpsRedirection();

app.UseCors();          // ⚠️ deve stare PRIMA di UseAuthorization
app.UseAuthorization();
app.MapControllers();

// Porta dinamica — Railway assegna la porta tramite la variabile PORT
var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
app.Run($"http://0.0.0.0:{port}");