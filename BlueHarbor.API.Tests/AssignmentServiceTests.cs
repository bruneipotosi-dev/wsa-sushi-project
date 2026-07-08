using BlueHarbor.API.Data;
using BlueHarbor.API.Models;
using BlueHarbor.API.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Xunit;

namespace BlueHarbor.API.Tests;

public class AssignmentServiceTests
{
    private static AppDbContext CreateInMemoryDb()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .ConfigureWarnings(warnings => warnings.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        var db = new AppDbContext(options);
        db.SystemStates.Add(new SystemState { Id = 1, CurrentDay = 1 });
        db.Berths.AddRange(
            new Berth { Id = 5, Name = "S-1", Size = ShipSize.S },
            new Berth { Id = 1, Name = "XL-1", Size = ShipSize.XL }
        );
        db.SaveChanges();
        return db;
    }

    [Fact]
    public async Task AssignShipToBerth_ValidAssignment_CalculatesCorrectStartAndEndDay()
    {
        using var db = CreateInMemoryDb();
        var service = new AssignmentService(db);

        var ship = new Ship
        {
            Name = "Nave Test",
            Size = ShipSize.S,
            ArrivalDay = 3,
            OccupationDuration = 5,
            Status = ShipStatus.Pending
        };
        db.Ships.Add(ship);
        await db.SaveChangesAsync();

        var result = await service.AssignShipToBerthAsync(ship.Id, 5);

        Assert.Equal(3, result.StartDay);
        Assert.Equal(7, result.EndDay);
        Assert.Equal(ShipStatus.Assigned, ship.Status);
    }

    [Fact]
    public async Task AssignShipToBerth_IncompatibleSize_ThrowsException()
    {
        using var db = CreateInMemoryDb();
        var service = new AssignmentService(db);

        var ship = new Ship
        {
            Name = "Nave XL",
            Size = ShipSize.XL,
            ArrivalDay = 1,
            OccupationDuration = 3,
            Status = ShipStatus.Pending
        };
        db.Ships.Add(ship);
        await db.SaveChangesAsync();

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.AssignShipToBerthAsync(ship.Id, 5));

        Assert.Contains("Dimensione incompatibile", ex.Message);
    }

    [Fact]
    public async Task AssignShipToBerth_ShipAlreadyAssigned_ThrowsException()
    {
        using var db = CreateInMemoryDb();
        var service = new AssignmentService(db);

        var ship = new Ship
        {
            Name = "Nave Già Assegnata",
            Size = ShipSize.S,
            ArrivalDay = 1,
            OccupationDuration = 3,
            Status = ShipStatus.Assigned
        };
        db.Ships.Add(ship);
        await db.SaveChangesAsync();

        var ex = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.AssignShipToBerthAsync(ship.Id, 5));

        Assert.Contains("già in stato", ex.Message);
    }

    [Fact]
    public async Task AssignShipToBerth_BerthOverlap_MovesToNextAvailableWindow()
    {
        using var db = CreateInMemoryDb();
        var service = new AssignmentService(db);

        var ship1 = new Ship
        {
            Name = "Nave 1",
            Size = ShipSize.S,
            ArrivalDay = 1,
            OccupationDuration = 5,
            Status = ShipStatus.Pending
        };
        db.Ships.Add(ship1);
        await db.SaveChangesAsync();
        await service.AssignShipToBerthAsync(ship1.Id, 5);

        var ship2 = new Ship
        {
            Name = "Nave 2",
            Size = ShipSize.S,
            ArrivalDay = 2,
            OccupationDuration = 3,
            Status = ShipStatus.Pending
        };
        db.Ships.Add(ship2);
        await db.SaveChangesAsync();

        var result = await service.AssignShipToBerthAsync(ship2.Id, 5);

        Assert.Equal(6, result.StartDay);
        Assert.Equal(8, result.EndDay);
    }

    [Fact]
    public async Task AssignShipToBerth_RespectsFormula_MaxArrivalDayLastEndDayPlusOne()
    {
        using var db = CreateInMemoryDb();
        var service = new AssignmentService(db);

        var ship1 = new Ship
        {
            Name = "Nave 1",
            Size = ShipSize.S,
            ArrivalDay = 1,
            OccupationDuration = 7,
            Status = ShipStatus.Pending
        };
        db.Ships.Add(ship1);
        await db.SaveChangesAsync();
        await service.AssignShipToBerthAsync(ship1.Id, 5);

        var ship2 = new Ship
        {
            Name = "Nave 2",
            Size = ShipSize.S,
            ArrivalDay = 10,
            OccupationDuration = 3,
            Status = ShipStatus.Pending
        };
        db.Ships.Add(ship2);
        await db.SaveChangesAsync();

        var result = await service.AssignShipToBerthAsync(ship2.Id, 5);

        Assert.Equal(10, result.StartDay);
        Assert.Equal(12, result.EndDay);
    }
}