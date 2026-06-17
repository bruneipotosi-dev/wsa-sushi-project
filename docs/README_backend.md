# Backend Overview

## Scopo
Questo file descrive la struttura reale del backend C# / ASP.NET Core nel repository, escludendo completamente il frontend.

## Struttura backend corrente

- `Program.cs`
  - Avvia l'app ASP.NET Core
  - Registra i controller
  - Configura Entity Framework Core con SQLite
  - Esegue `db.Database.Migrate()` all'avvio

- `AppDbcontext.cs`
  - Definisce `AppDbContext : DbContext`
  - Contiene i `DbSet` per `Ship`, `Berth`, `Assignment`
  - Seed iniziale delle banchine (`Berth`) nel metodo `OnModelCreating`

- `Ship.cs`
  - Modello dominio per le navi
  - Campi: `Id`, `Name`, `Size`, `ArrivalDay`, `OccupationDuration`, `Status`, `Notes`

- `Berth.cs`
  - Modello dominio per le banchine
  - Campi: `Id`, `Name`, `Size`

- `Assignment.cs`
  - Modello dominio per le assegnazioni di nave -> banchina
  - Campi: `Id`, `ShipId`, `Ship`, `BerthId`, `Berth`, `StartDay`, `EndDay`

- `BlueHarbor.API.csproj`
  - Progetto ASP.NET Core
  - Dipendenze principali: EF Core SQLite, Swagger

- `appsettings.json`
  - Configurazione logging e `AllowedHosts`

- `appsettings.Development.json`
  - Configurazione ambiente di sviluppo

- `BlueHarbor.API.http`
  - File di test HTTP probabilmente usato per chiamate API manuali

- `blueharbor.db`
  - Database SQLite usato dall'app

## Pulizia eseguita

Rimosso:
- `bin/`
- `obj/`
- `BlueHarbor.Backend/`

Queste cartelle contenevano solo artefatti di build / output e non fanno parte del codice sorgente backend effettivo.

## Osservazioni principali

- Non sono presenti cartelle tipiche di un backend ASP.NET Core organizzato, come:
  - `Controllers/`
  - `Models/`
  - `Data/`
  - `Services/`
  - `Migrations/`

- Tutti i file principali sono al livello root del progetto.
- Il database è SQLite, come evidenziato da `Program.cs`.

## Consigli per rendere la struttura più leggibile

### Opzione raccomandata: strutturare fisicamente il backend
Questa è la miglior scelta per un backend C# mantenibile:

- spostare i modelli in `Models/`
- mettere `AppDbContext` in `Data/`
- creare `Controllers/` per gli endpoint REST
- aggiungere `Migrations/` se si usa EF Core
- aggiungere `Services/` se si vuole separare la logica di dominio

### Passi consigliati

1. Lasciare `Program.cs` e `BlueHarbor.API.csproj` al root.
2. Spostare:
   - `Ship.cs` → `Models/Ship.cs`
   - `Berth.cs` → `Models/Berth.cs`
   - `Assignment.cs` → `Models/Assignment.cs`
   - `AppDbcontext.cs` → `Data/AppDbContext.cs`
3. Aggiungere almeno un controller base:
   - `Controllers/ShipsController.cs`
   - `Controllers/AssignmentsController.cs`
   - `Controllers/SystemController.cs`
4. Mantenere `blueharbor.db` finché serve come DB locale, ma valutarne il versionamento.

### Cosa fare ora
- Se vuoi, posso anche creare subito la struttura fisica consigliata e aggiornare i riferimenti in `Program.cs`.
- Se preferisci solo tenere il backend flat ma documentato, la `README_backend.md` è già pronta.
