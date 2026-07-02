# BlueHarbor — Backend Architecture & Data Management Overview

## 🎯 Scopo del Documento
Questo documento fornisce una panoramica tecnica e strutturale dettagliata dell'applicazione Backend sviluppata in **C# / ASP.NET Core** per il progetto **BlueHarbor**. Descrive l'organizzazione dell'architettura dei dati, i modelli di dominio, gli endpoint esposti e, nello specifico, il funzionamento logico del motore di gestione del tempo virtuale del porto.

---

## 🏗️ Architettura e Struttura dei File

L'applicazione segue i pattern architetturali standard di ASP.NET Core per garantire la massima manutenibilità, separando i modelli di dati dalla logica di persistenza e dai controller di comunicazione.

### 1. Core di Avvio e Configurazione
* **`Program.cs`**: Punto di ingresso dell'applicazione. Configura il web server, esegue la registrazione dei servizi nel container della Dependency Injection (DI) e mappa i controller delle API. Gestisce inoltre l'invocazione automatica di `db.Database.Migrate()` all'avvio per assicurare l'allineamento automatico dello schema del database SQLite senza interventi manuali.
* **`appsettings.json` / `appsettings.Development.json`**: File di configurazione dell'ambiente, dei livelli di logging e delle stringhe di connessione.
* **`BlueHarbor.API.csproj`**: File di definizione del progetto .NET contenente i pacchetti NuGet essenziali (Entity Framework Core SQLite, EF Core Tools e Swagger/OpenAPI).

### 2. Strato dei Dati (Data Layer)
* **`Data/AppDbContext.cs`**: Rappresenta il contesto del database per Entity Framework Core. Espone i contesti di interrogazione (`DbSet`) per l'accesso relazionale a tutte le entità del sistema. Gestisce il seeding iniziale dei dati statici (configurazione delle banchine fisse del porto) e lo stato iniziale del tempo (Day 1).

### 3. Modelli di Dominio (Models)
L'applicazione modella le entità principali del terminale portuale:
* **`Ship.cs`**: Rappresenta le navi mercantili (proprietà: `Id`, `Name`, `Size`, `ArrivalDay`, `OccupationDuration`, `Status`, `Notes`).
* **`Berth.cs`**: Rappresenta le banchine fisiche disponibili all'interno del porto (proprietà: `Id`, `Name`, `Size`).
* **`Assignment.cs`**: Entità relazionale che modella l'assegnazione temporale di una determinata nave su una banchina specifica (proprietà: `Id`, `ShipId`, `Ship`, `BerthId`, `Berth`, `StartDay`, `EndDay`).
* **`SystemState.cs`** : Modello critico per la persistenza dello stato di esecuzione globale. Memorizza il giorno di simulazione corrente. La tabella è strutturata per ospitare un singolo record di controllo centralizzato con chiave primaria fissa `Id = 1`.

### 4. Strato di Controllo (Controllers)
* **`SystemController.cs`** : Controller REST dedicato alla gestione dello stato del sistema portuale. Espone i metodi per l'interrogazione e l'avanzamento cronologico delle attività portuali.

---

## ⚙️ Logica di Business: Il Motore del Tempo Virtuale

La gestione temporale del porto simula l'avanzamento delle giornate operative in modo discreto attraverso l'invocazione dell'endpoint di controllo. All'invocazione di `POST /api/advance-day`, il backend esegue una sequenza atomica di passaggi logici protetti da transazione sul DB:

1. **Lettura e Incremento**: Viene prelevato l'unico record dello stato di sistema (`Id = 1`) tramite `FirstAsync()` e la proprietà `CurrentDay` viene incrementata di un'unità.
2. **Scansione delle Scadenze**: Viene eseguita una query ottimizzata sulla tabella degli `Assignments`, includendo l'entità correlata delle navi (`.Include(a => a.Ship)`). La clausola di filtro seleziona tutte le navi correntemente ormeggiate (`Status == "Assigned"`) il cui giorno di fine occupazione risulta inferiore rispetto al nuovo giorno corrente (`EndDay < state.CurrentDay`).
3. **Aggiornamento di Stato**: L'algoritmo itera sulle assegnazioni individuate e ne modifica lo stato di dominio direttamente in `Departed` (Partita), liberando virtualmente lo spazio occupato.
4. **Persistenza**: Tutte le modifiche coordinate vengono salvate in un'unica operazione di scrittura sul database tramite `await _db.SaveChangesAsync()`.


## 🛠️ Comandi Utili per il Team

### 1. Allineamento del Database (Per TUTTI i membri del team)
Quando si scaricano gli aggiornamenti dal repository (tramite `git pull`), per applicare le nuove tabelle sul proprio database locale (inclusa la tabella `SystemStates` ), eseguire semplicemente:
```powershell
dotnet ef database update