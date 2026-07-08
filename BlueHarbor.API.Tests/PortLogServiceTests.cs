using BlueHarbor.API.Data;
using BlueHarbor.API.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace BlueHarbor.API.Tests;

public class PortLogServiceTests
{
    [Fact]
    public async Task LogAsync_CreatesLogEntry()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        using var db = new AppDbContext(options);
        var service = new PortLogService(db);

        await service.LogAsync("Test", "Dettaglio test", arrivalDay: 1, departureDay: 5, duration: 5);

        var log = await db.PortLogs.FirstOrDefaultAsync();
        Assert.NotNull(log);
        Assert.Equal("Test", log.Action);
        Assert.Equal("Dettaglio test", log.Details);
        Assert.Equal(1, log.ArrivalDay);
        Assert.Equal(5, log.DepartureDay);
        Assert.Equal(5, log.Duration);
    }
}