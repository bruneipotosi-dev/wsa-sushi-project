namespace BlueHarbor.API.Models;

public class PortLog
{
    public int Id { get; set; }
    public string ShipName { get; set; } = string.Empty;
    public int ArrivalDay { get; set; }
    public int DepartureDay { get; set; }
    
    // Calcolo automatico della durata della sosta
    public int Duration 
    { 
        get { return DepartureDay - ArrivalDay; }
    }
}