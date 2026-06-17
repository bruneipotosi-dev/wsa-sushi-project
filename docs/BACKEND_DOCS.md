# Backend Documentation

## Indice

- [Panoramica](#panoramica)
- [Architettura del backend](#architettura-del-backend)
- [Endpoint API](#endpoint-api)
- [Schema database](#schema-database)
- [Build e avvio](#build-e-avvio)
- [Configurazione](#configurazione)
- [Pulizia effettuata](#pulizia-effettuata)
- [Warning e mancanze](#warning-e-mancanze)
- [Metodo consigliato per aggiornare la documentazione](#metodo-consigliato-per-aggiornare-la-documentazione)
- [Script di generazione automatica](#script-di-generazione-automatica)
- [TODO / prossimi passi](#todo--prossimi-passaggi)

## Panoramica

Questo documento copre l'intero backend ASP.NET Core del progetto:

- Stack: C# .NET 10, ASP.NET Core, Entity Framework Core, SQLite
- Stanza del codice: backend principale in `AWS_Sushi_project/`
- Frontend escluso da questa documentazione

## Architettura del backend

### Cartelle principali

- `Controllers/`
  - `ShipsController.cs`
  - `AssignmentsController.cs`
  - `SystemController.cs`
- `Models/`
  - `Ship.cs`
  - `Berth.cs`
  - `Assignment.cs`
- `Data/`
  - `AppDbContext.cs`
- Root
  - `Program.cs`
  - `BlueHarbor.API.csproj`
  - `appsettings.json`
  - `appsettings.Development.json`
  - `BlueHarbor.API.http`
  - `blueharbor.db`

### Ruoli principali

- `Program.cs`
  - registra i controller
  - configura EF Core con SQLite
  - abilita Swagger in ambiente di sviluppo
  - esegue `db.Database.Migrate()` all'avvio
- `Data/AppDbContext.cs`
  - definisce i `DbSet` delle entità
  - contiene il seed iniziale delle banchine (`Berth`)
- `Controllers/*`
  - espongono gli endpoint REST del backend
- `Models/*`
  - definiscono le entità dominio e le relazioni EF Core

## Endpoint API

### `GET /api/ships`

- Descrizione: restituisce la lista delle navi
- Metodo HTTP: `GET`
- Route: `/api/ships`
- Parametri: nessuno
- Esempio di richiesta:

```http
GET /api/ships HTTP/1.1
Host: localhost:5000
Accept: application/json
```

- Esempio di risposta (`200 OK`):

```json
[
  {
    "id": 1,
    "name": "Aurora",
    "size": "L",
    "arrivalDay": 4,
    "occupationDuration": 7,
    "status": "Pending",
    "notes": "Carico merci generiche"
  }
]
```

### `POST /api/ships`

- Descrizione: aggiunge una nuova nave
- Metodo HTTP: `POST`
- Route: `/api/ships`
- Parametri: body JSON con i campi della `Ship`
- Esempio di richiesta:

```http
POST /api/ships HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "name": "Aurora",
  "size": "L",
  "arrivalDay": 4,
  "occupationDuration": 7,
  "status": "Pending",
  "notes": "Carico merci generiche"
}
```

- Esempio di risposta (`201 Created`):

```json
{
  "id": 5,
  "name": "Aurora",
  "size": "L",
  "arrivalDay": 4,
  "occupationDuration": 7,
  "status": "Pending",
  "notes": "Carico merci generiche"
}
```

### `GET /api/ships/{id}`

- Descrizione: restituisce i dettagli di una singola nave
- Metodo HTTP: `GET`
- Route: `/api/ships/{id}`
- Parametri: `id` nella route
- Esempio di richiesta:

```http
GET /api/ships/5 HTTP/1.1
Host: localhost:5000
Accept: application/json
```

- Esempio di risposta (`200 OK`):

```json
{
  "id": 5,
  "name": "Aurora",
  "size": "L",
  "arrivalDay": 4,
  "occupationDuration": 7,
  "status": "Pending",
  "notes": "Carico merci generiche"
}
```

### `GET /api/assignments`

- Descrizione: restituisce la lista delle assegnazioni con entità `Ship` e `Berth` incluse
- Metodo HTTP: `GET`
- Route: `/api/assignments`
- Parametri: nessuno
- Esempio di richiesta:

```http
GET /api/assignments HTTP/1.1
Host: localhost:5000
Accept: application/json
```

- Esempio di risposta (`200 OK`):

```json
[
  {
    "id": 1,
    "shipId": 1,
    "ship": {
      "id": 1,
      "name": "Aurora",
      "size": "L",
      "arrivalDay": 4,
      "occupationDuration": 7,
      "status": "Pending",
      "notes": null
    },
    "berthId": 2,
    "berth": {
      "id": 2,
      "name": "L-1",
      "size": "L"
    },
    "startDay": 4,
    "endDay": 11
  }
]
```

### `GET /api/assignments/{id}`

- Descrizione: restituisce i dettagli di una singola assegnazione
- Metodo HTTP: `GET`
- Route: `/api/assignments/{id}`
- Parametri: `id` nella route
- Esempio di richiesta:

```http
GET /api/assignments/1 HTTP/1.1
Host: localhost:5000
Accept: application/json
```

- Esempio di risposta (`200 OK`):

```json
{
  "id": 1,
  "shipId": 1,
  "ship": {
    "id": 1,
    "name": "Aurora",
    "size": "L",
    "arrivalDay": 4,
    "occupationDuration": 7,
    "status": "Pending",
    "notes": null
  },
  "berthId": 2,
  "berth": {
    "id": 2,
    "name": "L-1",
    "size": "L"
  },
  "startDay": 4,
  "endDay": 11
}
```

### `POST /api/assignments`

- Descrizione: aggiunge una nuova assegnazione
- Metodo HTTP: `POST`
- Route: `/api/assignments`
- Parametri: body JSON con i campi della `Assignment`
- Esempio di richiesta:

```http
POST /api/assignments HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "shipId": 1,
  "berthId": 2,
  "startDay": 4,
  "endDay": 11
}
```

- Esempio di risposta (`201 Created`):

```json
{
  "id": 1,
  "shipId": 1,
  "berthId": 2,
  "startDay": 4,
  "endDay": 11
}
```

> Nota: l'endpoint `POST /api/assignments` ora esegue validazione server-side di `ShipId`, `BerthId` e di `EndDay >= StartDay`.

### `GET /api/day`

- Descrizione: restituisce il giorno corrente calcolato a partire dalle navi
- Metodo HTTP: `GET`
- Route: `/api/day`
- Parametri: nessuno
- Esempio di richiesta:

```http
GET /api/day HTTP/1.1
Host: localhost:5000
Accept: application/json
```

- Esempio di risposta (`200 OK`):

```json
{
  "currentDay": 4
}
```

### `POST /api/advance-day`

- Descrizione: endpoint placeholder per l'avanzamento del giorno virtuale
- Metodo HTTP: `POST`
- Route: `/api/advance-day`
- Parametri: nessuno
- Esempio di richiesta:

```http
POST /api/advance-day HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{}
```

- Esempio di risposta (`200 OK`):

```json
{
  "message": "Advance day endpoint is available."
}
```

> Warning: questo endpoint non implementa ancora la logica reale di avanzamento dei giorni.

## Schema database

Il backend usa SQLite con le entità EF Core seguenti.

### Ship

- `Id` (int, PK)
- `Name` (string, non null)
- `Size` (string, non null)
- `ArrivalDay` (int, non null)
- `OccupationDuration` (int, non null)
- `Status` (string, non null)
- `Notes` (string, nullable)

### Berth

- `Id` (int, PK)
- `Name` (string, non null)
- `Size` (string, non null)

### Assignment

- `Id` (int, PK)
- `ShipId` (int, FK su `Ship.Id`)
- `BerthId` (int, FK su `Berth.Id`)
- `StartDay` (int, non null)
- `EndDay` (int, non null)

### Relazioni

- `Assignment` -> `Ship`: relazione many-to-one
- `Assignment` -> `Berth`: relazione many-to-one

### Seed dati

`AppDbContext.OnModelCreating` seeda 8 banchine fisse:

- `XL-1` (XL)
- `L-1` (L)
- `M-1` (M)
- `M-2` (M)
- `S-1` (S)
- `S-2` (S)
- `S-3` (S)
- `S-4` (S)

## Build e avvio

### Prerequisiti

- .NET SDK 10 installato
- Windows / macOS / Linux compatibile

### Comandi

```powershell
cd C:\Users\hussni.sougrati\Documents\AWS_Sushi_project
dotnet build BlueHarbor.API.csproj
dotnet run --project BlueHarbor.API.csproj
```

### Endpoint locali tipici

- `https://localhost:5001`
- `http://localhost:5000`

## Configurazione

### `appsettings.json`

Usato per configurare logging e `AllowedHosts`.

### `appsettings.Development.json`

Usato per sovrascrivere impostazioni in ambiente di sviluppo.

### Database

La connessione è definita in `Program.cs` con:

```csharp
options.UseSqlite("Data Source=blueharbor.db")
```

Il file `blueharbor.db` è il database SQLite locale.

## Pulizia effettuata

Sono stati rimossi i seguenti elementi non funzionali o ridondanti:

- `bin/` e `obj/` (artefatti build)
- `BlueHarbor.Backend/` (cartella artefatto e duplicata)
- vecchi file root di modello backend (`Ship.cs`, `Berth.cs`, `Assignment.cs`, `AppDbcontext.cs`) spostati nella nuova struttura

È stata creata la struttura pulita del backend con:
- `Controllers/`
- `Models/`
- `Data/`

## Warning e mancanze

- `Controllers/SystemController.cs` espone un endpoint placeholder `POST /api/advance-day` senza logica di avanzamento.
- `Controllers/ShipsController.cs` e `Controllers/AssignmentsController.cs` ora supportano richieste `GET /api/ships/{id}` e `GET /api/assignments/{id}`.
- Non sono presenti DTO separati per request/response.
- Non sono presenti validazioni forti su `POST /api/ships` e `POST /api/assignments`.
- Non è presente una cartella `Migrations/` EF Core esplicita.
- `Program.cs` chiama `db.Database.Migrate()` pur non essendo presente alcuna migrazione definita nel progetto.

## Metodo consigliato per aggiornare la documentazione

### Opzione preferita: Swagger / OpenAPI + markdown statico

Il progetto ha già `Swashbuckle.AspNetCore` configurato in `Program.cs`:

- `builder.Services.AddSwaggerGen();`
- `app.UseSwagger();`
- `app.UseSwaggerUI();`

Questo permette di avere documentazione interattiva runtime su `/swagger` in sviluppo.

### Opzione semplice aggiuntiva: script di estrazione da controller

Ho creato uno script PowerShell che scansiona `Controllers/*.cs` e rigenera automaticamente la sezione endpoint del markdown.

### Opzione consigliata per generazione XML docs

Aggiorna `BlueHarbor.API.csproj` con queste proprietà:

```xml
<PropertyGroup>
  <GenerateDocumentationFile>true</GenerateDocumentationFile>
  <DocumentationFile>bin\Debug\net10.0\BlueHarbor.API.xml</DocumentationFile>
</PropertyGroup>
```

Poi esegui:

```powershell
dotnet build BlueHarbor.API.csproj
```

Questo genera un file XML di documentazione che può essere trasformato in Markdown con strumenti esterni.

## Script di generazione automatica

### File creato
- `scripts/GenerateBackendDocs.ps1`

### Uso

```powershell
cd C:\Users\hussni.sougrati\Documents\AWS_Sushi_project
powershell -ExecutionPolicy Bypass -File .\scripts\GenerateBackendDocs.ps1
```

Lo script analizza i controller esistenti e aggiorna la sezione `## Endpoint API` del file `BACKEND_DOCS.md`.

## TODO / prossimi passaggi

- Aggiungere una cartella `Migrations/` con migrazioni EF Core
- Introdurre un layer `Services/` per separare la logica di business dai controller
- Implementare DTO per request/response e validazione dei modelli
- Completare la logica di `POST /api/advance-day`
- Aggiungere commenti XML ai controller e ai modelli per generare documentazione con `dotnet build`
- Considerare l'esportazione OpenAPI (`swagger.json`) verso documentazione statica
