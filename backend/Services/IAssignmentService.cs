using BlueHarbor.API.Models;

namespace BlueHarbor.API.Services;

public interface IAssignmentService
{
    Task<Assignment> AssignShipToBerthAsync(int shipId, int berthId);
}