using BlueHarbor.API.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Collega il database SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=Data/blueharbor.db"));

var app = builder.Build();

// Crea il database automaticamente all'avvio
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// if (app.Environment.IsDevelopment())
// {
//     app.UseSwagger();
//     app.UseSwaggerUI();
// }
app.UseSwagger();

app.UseSwaggerUI(c =>
{
    // Questo trucco fa sì che digitando http://localhost:5000 si apra DIRETTAMENTE Swagger
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "BlueHarbor API V1");
    c.RoutePrefix = string.Empty; 
});

//app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();