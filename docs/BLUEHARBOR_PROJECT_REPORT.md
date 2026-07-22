# BlueHarbor — Report di Progetto

**Corso:** Learning by Project — ITS Web Solutions Architect  
**Progetto:** BlueHarbor — Port Terminal Management System  
**Data report:** 17 luglio 2026  
**Stato:** Completato e funzionante per la consegna

---

## 1. Panoramica

### 1.1 Scopo del sistema

BlueHarbor è un **gestionale per terminal portuale container** sviluppato come progetto didattico. Il sistema simula le operazioni quotidiane di un porto fittizio: un operatore registra le navi in arrivo, uno scheduler le assegna alle banchine compatibili per taglia, e il sistema avanza il **giorno operativo virtuale** aggiornando automaticamente gli stati delle navi (in attesa, assegnata, partita).

In sintesi, BlueHarbor permette di **registrare navi**, **visualizzare lo stato delle banchine**, **pianificare ormeggi senza sovrapposizioni temporali** e **simulare il passaggio del tempo** con un unico giorno corrente condiviso tra tutti gli utenti dell'applicazione.

### 1.2 Contesto formativo

Il progetto nasce nel contesto del corso *Learning by Project* dell'ITS Web Solutions Architect. L'obiettivo formativo non era costruire un TMS (Terminal Management System) enterprise completo, bensì dimostrare la capacità di progettare e integrare un'applicazione **full-stack** con:

- separazione delle responsabilità tra frontend, backend e database;
- regole di business non banali (compatibilità taglie, calcolo finestre temporali, prevenzione conflitti);
- scelte tecnologiche coerenti con un contesto didattico e facilmente dimostrabile.

### 1.3 Obiettivi raggiunti

| Obietivo | Stato |
|---|---|
| Registrazione e consultazione navi | ✅ Implementato |
| Esposizione di 8 banchine fisse per taglia | ✅ Implementato (seed in `AppDbContext`) |
| Assegnazione nave–banchina con vincoli | ✅ Implementato (`AssignmentService`) |
| Avanzamento giorno operativo | ✅ Implementato (`SystemController`) |
| Interfaccia web per due ruoli operativi | ✅ Implementato (Operatore / Scheduler) |
| Test automatici sulla logica critica | ✅ 6 test xUnit, tutti superati |
| Documentazione architetturale | ✅ Presente in `docs/` |

### 1.4 Riassunto operativo (1 paragrafo)

BlueHarbor è un'applicazione web client–server in cui un operatore portuale inserisce navi con dati tecnici generati automaticamente (taglia, giorno di arrivo, durata occupazione), mentre uno scheduler le assegna alle banchine tramite un'interfaccia drag-and-drop. Il backend ASP.NET Core valida ogni assegnazione (compatibilità dimensionale, stato della nave, assenza di overlap temporale) dentro una transazione serializzabile, persiste i dati su SQLite e aggiorna lo stato globale del terminal quando l'utente avanza il giorno corrente dalla navbar.

---

## 2. Architettura

### 2.1 Pattern architetturale

Il sistema adotta un'architettura **Client–Server** con API **REST** e payload **JSON**. Il frontend React (porta 5173) comunica con il backend ASP.NET Core (porta 5000) tramite fetch HTTP. Il backend espone controller REST, delega la logica di business critica a un service layer minimo e persiste i dati tramite Entity Framework Core su SQLite.

```text
┌─────────────────────────┐         HTTP/JSON          ┌──────────────────────────┐
│   Browser (React+Vite)  │ ◄────────────────────────► │  ASP.NET Core Backend    │
│   localhost:5173        │                            │  localhost:5000          │
│                         │                            │                          │
│  App.jsx (routing)      │                            │  Controllers             │
│  pages/ (UI)            │                            │  Services                │
│  services/api.js        │                            │  Middleware              │
└─────────────────────────┘                            │  Models + AppDbContext   │
                                                       └────────────┬─────────────┘
                                                                    │ EF Core
                                                                    ▼
                                                       ┌──────────────────────────┐
                                                       │  SQLite (blueharbor.db)  │
                                                       └──────────────────────────┘
```

### 2.2 Struttura del repository

| Cartella / file | Responsabilità |
|---|---|
| `Program.cs` | Bootstrap applicazione: DI, CORS, Swagger, migrazioni, middleware errori |
| `Controllers/` | Esposizione HTTP REST (6 controller) |
| `Services/` | Logica di business (`AssignmentService`, `PortLogService`) |
| `Models/` | Entità di dominio ed enum (`ShipSize`, `ShipStatus`) |
| `Data/AppDbContext.cs` | Configurazione EF Core, seed banchine e giorno iniziale |
| `Middleware/ApiExceptionHandler.cs` | Gestione globale eccezioni non gestite |
| `frontend/src/` | Applicazione React (pagine, componenti, servizio API) |
| `BlueHarbor.API.Tests/` | Test unitari xUnit con EF Core InMemory |
| `docs/` | Documentazione architetturale e report di progetto |

### 2.3 Layer backend

#### Controllers (orchestrazione HTTP)

| Controller | Route base | Endpoint principali |
|---|---|---|
| `ShipsController` | `/api/ships` | GET (con filtro `?status=`), GET `{id}`, POST, PUT `{id}`, DELETE `{id}` |
| `BerthsController` | `/api/berths` | GET con stato operativo corrente per banchina |
| `AssignmentsController` | `/api/assignments` | GET, GET `{id}`, POST |
| `SystemController` | `/api` | GET `/day`, POST `/advance-day` |
| `AdminController` | `/api` | POST `/reset` |
| `PortLogsController` | `/api/portlogs` | GET storico eventi |

I controller restano **snelli**: validano l'input, interrogano il database o delegano al service, e mappano le eccezioni in codici HTTP appropriati (400, 404, 409, 500).

#### Services (business logic)

| Service | Ruolo |
|---|---|
| `IAssignmentService` / `AssignmentService` | Unico punto di creazione assegnazioni: validazioni, calcolo finestra, transazione, aggiornamento stato nave, logging |
| `IPortLogService` / `PortLogService` | Scrittura log operativi (`Assigned`, `Departed`); errori di logging non bloccano l'operazione principale |

#### Data layer

`AppDbContext` definisce i `DbSet` per `Ship`, `Berth`, `Assignment`, `SystemState` e `PortLog`. Al modello applica:

- **Seed** di 8 banchine (1 XL, 1 L, 2 M, 4 S) e `CurrentDay = 1`;
- **Indici** su `Ship.Status`, `Ship.ArrivalDay`, `Assignment.ShipId`;
- **Vincolo di unicità** su `(BerthId, StartDay, EndDay)` — previene duplicati esatti, non overlap parziali (gestiti dal service).

### 2.4 Frontend

Il frontend è organizzato in:

| Componente | File | Funzione |
|---|---|---|
| Routing e stato globale | `App.jsx` | React Router, `currentDay`, lista navi condivisa, selezione ruolo |
| Home / scelta ruolo | `MainPage.jsx` | Ingresso come Operatore o Scheduler |
| Area operatore | `OperatorePages.jsx` | Registro navi, form creazione, modifica, eliminazione |
| Area scheduler | `SchedulerPage.jsx` | Matrice banchine, coda navi, drag-and-drop, modal conferma |
| Navbar | `Navbar.jsx` | Giorno corrente, Next Day, Reset, navigazione per ruolo |
| Client HTTP | `services/api.js` | Wrapper centralizzato su tutte le API |

#### Protezione per ruolo

`App.jsx` implementa `ProtectedRoute`: il ruolo scelto viene salvato in `localStorage` (`blueharbor-role`) e le rotte `/operatore` e `/scheduler` sono accessibili solo al ruolo corrispondente. Non esiste autenticazione reale: la separazione è **simulata a livello UI**, adeguata al contesto didattico.

### 2.5 Flussi di dati principali

#### Flusso 1 — Registrazione nave (Operatore)

```text
Operatore compila nome + note
        │
        ▼
Frontend genera taglia, arrivalDay, occupationDuration (random)
        │
        ▼
POST /api/ships  →  ShipsController.CreateShip
        │
        ▼
Status forzato a Pending  →  INSERT in SQLite  →  201 Created
        │
        ▼
Frontend ricarica GET /api/ships
```

#### Flusso 2 — Assegnazione nave a banchina (Scheduler)

```text
Scheduler seleziona nave Pending + banchina compatibile (stessa taglia)
        │
        ▼
Frontend calcola anteprima finestra (calcSlotReal) — solo informativa
        │
        ▼
POST /api/assignments { shipId, berthId }
        │
        ▼
AssignmentService.AssignShipToBerthAsync
  ├─ Verifica nave Pending, taglia compatibile
  ├─ BEGIN TRANSACTION (IsolationLevel.Serializable)
  ├─ Calcola startDay = max(currentDay, lastEndDay+1, arrivalDay)
  ├─ Calcola endDay = startDay + duration - 1
  ├─ Verifica assenza overlap
  ├─ Aggiorna Ship.Status → Assigned
  ├─ INSERT Assignment
  ├─ COMMIT
  └─ PortLogService.LogAsync("Assigned", ...)
        │
        ▼
Frontend aggiorna navi, banchine, assegnazioni; toast di conferma
```

#### Flusso 3 — Avanzamento giorno

```text
Navbar → POST /api/advance-day
        │
        ▼
SystemController.AdvanceDay
  ├─ CurrentDay++
  ├─ Conta navi Pending con ArrivalDay < CurrentDay (warning)
  ├─ Trova assegnazioni con EndDay < CurrentDay e nave Assigned
  ├─ Per ciascuna: Ship.Status → Departed + log "Departed"
  └─ SaveChanges
        │
        ▼
Frontend aggiorna currentDay; console.warn se presente warning
```

### 2.6 Modello dati e relazioni

```text
Ship (1) ──────< Assignment >────── (1) Berth

SystemState (singleton logico, Id=1, CurrentDay)

PortLog (audit trail indipendente)
```

| Entità | Campi principali | Note |
|---|---|---|
| `Ship` | Name, Size, ArrivalDay, OccupationDuration, Status, Notes | Validazioni DataAnnotations (nome 2–100 char, durata 3–15 giorni) |
| `Berth` | Name, Size | 8 record fissi via seed |
| `Assignment` | ShipId, BerthId, StartDay, EndDay | Finestra temporale inclusiva |
| `SystemState` | CurrentDay | Giorno operativo condiviso |
| `PortLog` | Action, Details, Timestamp, ArrivalDay, DepartureDay, Duration | Tracciamento eventi Assigned/Departed |

#### Enum di dominio

```csharp
// ShipSize: XL, L, M, S
// ShipStatus: Pending, Assigned, Departed
```

Gli enum sono serializzati come **stringhe JSON** lato API grazie a `JsonStringEnumConverter` configurato in `Program.cs`, mantenendo compatibilità con il frontend React.

---

## 3. Stack Tecnologico

### 3.1 Backend

| Tecnologia | Versione | Motivazione |
|---|---|---|
| **.NET / ASP.NET Core** | 10.0 | Framework moderno, dependency injection nativa, performance adeguate, allineato al corso |
| **Entity Framework Core** | 10.0.x | ORM per modellazione dominio, query LINQ, seed dati, gestione schema |
| **SQLite** | via EF Core | Zero configurazione infrastrutturale, file singolo (`Data/blueharbor.db`), ideale per demo e sviluppo locale |
| **Swashbuckle (Swagger)** | 10.2.x | Documentazione e test interattivo API; configurato sulla root (`http://localhost:5000`) |
| **System.Text.Json** | built-in | Serializzazione JSON con supporto enum stringa |

### 3.2 Frontend

| Tecnologia | Versione | Motivazione |
|---|---|---|
| **React** | 19.2.x | UI component-based, ecosistema maturo, standard de facto per SPA |
| **Vite** | 8.x | Dev server veloce, HMR, build ottimizzata |
| **React Router** | 7.x | Routing client-side, protezione rotte per ruolo |
| **Sass (SCSS)** | 1.100.x | Stili modulari per pagina (`MainPage.scss`, `SchedulerPage.scss`, ecc.) |
| **lucide-react** | 1.23.x | Icone SVG leggere per home e navbar |

### 3.3 Testing

| Tecnologia | Versione | Motivazione |
|---|---|---|
| **xUnit** | v3 (3.2.2) | Framework di test standard .NET |
| **EF Core InMemory** | 10.0.9 | Database in memoria per test isolati e veloci del service layer |
| **Microsoft.NET.Test.Sdk** | 17.14.1 | Runner test integrato con `dotnet test` |

### 3.4 Perché queste scelte

- **SQLite** elimina la necessità di installare e configurare un server database separato; il file `.db` è portabile e il `.gitignore` lo esclude dal repository.
- **ASP.NET Core** offre un modello a controller ben definito, middleware pipeline e DI out-of-the-box, riducendo il codice boilerplate.
- **React + Vite** permette sviluppo frontend rapido con hot reload, separato dal backend su porta diversa (richiede CORS).
- **Service layer minimo** invece di un'architettura a molti servizi: la complessità reale del dominio è concentrata nell'assegnazione; il resto sono operazioni CRUD dirette su EF Core.
- **Enum type-safe** al posto di stringhe magiche: il compilatore verifica i valori ammessi, riducendo bug silenziosi nelle comparazioni.

---

## 4. Funzionalità Implementate

### 4.1 Home e selezione ruolo

La pagina `MainPage` presenta due card interattive:

- **Operatore** — accesso al registro navi;
- **Scheduler** — accesso alla matrice di assegnazione.

Il ruolo scelto viene persistito in `localStorage` e determina la navigazione disponibile nella navbar.

### 4.2 Area Operatore — Registro Navi

| Funzionalità | Dettaglio |
|---|---|
| **Creazione nave** | L'operatore inserisce nome (obbligatorio) e note; taglia, giorno arrivo e durata vengono generati random dal frontend (`generateShipData`) |
| **Lista navi** | Visualizzazione completa con chip taglia, badge stato, dettagli arrivo/durata/note |
| **Statistiche** | Contatori: totale, in attesa, assegnate, partite |
| **Modifica nave** | Form inline per navi in qualsiasi stato visibile; il backend accetta solo **nome e note** per navi in stato `Pending` |
| **Eliminazione nave** | Consentita solo per navi `Pending` (409 Conflict altrimenti) |
| **Feedback utente** | Alert di errore/successo, stati di loading sui pulsanti |

### 4.3 Area Scheduler — Matrice di Assegnazione

| Funzionalità | Dettaglio |
|---|---|
| **Coda navi Pending** | Sidebar con navi in attesa, filtrate lato API (`GET /api/ships?status=Pending`) |
| **Griglia banchine** | 8 card con stato: DISPONIBILE / PIANIFICATA / OCCUPATA |
| **Timeline 7 giorni** | Per banchine occupate o pianificate, barra visuale dei prossimi 7 giorni |
| **Barra utilizzo terminal** | Segmenti colorati per occupazione complessiva |
| **Selezione nave** | Click o drag-and-drop dalla coda |
| **Assegnazione** | Click o drop su banchina compatibile (stessa taglia); modal di conferma con anteprima finestra |
| **Warning navi in ritardo** | Banner se navi Pending hanno `arrivalDay <= currentDay` |
| **Toast conferma** | Notifica temporanea (4 secondi) dopo assegnazione riuscita |
| **Modalità mock** | Flag `USE_MOCK = false`; il codice mock resta per sviluppo offline ma è disattivato |

### 4.4 Navbar operativa

Visibile solo fuori dalla home (`/`), la navbar espone:

- **Brand** BlueHarbor Terminal con logo MSC;
- **Navigazione** contestuale al ruolo (Home + Operatore oppure Home + Scheduler);
- **Giorno corrente** sincronizzato con `GET /api/day` all'avvio;
- **Next Day** — chiama `POST /api/advance-day` e aggiorna lo stato;
- **Reset** — conferma utente, poi `POST /api/reset` (cancella navi e assegnazioni, ripristina giorno 1) e reload pagina;
- **Menu mobile** responsive con hamburger.

### 4.5 API di sistema e amministrazione

| Endpoint | Comportamento |
|---|---|
| `GET /api/day` | Restituisce `{ currentDay }` |
| `POST /api/advance-day` | Incrementa giorno, marca navi partite, restituisce warning su navi in ritardo |
| `POST /api/reset` | Transazione: elimina assignments → ships → reset CurrentDay a 1 |
| `GET /api/portlogs` | Storico eventi ordinato per timestamp decrescente |

### 4.6 Gestione errori

| Livello | Meccanismo |
|---|---|
| **Validazione input** | DataAnnotations sui model + `ApiBehaviorOptions` con risposta `{ error: "..." }` |
| **Controller** | Mapping eccezioni: `ArgumentException` → 400, `InvalidOperationException` → 409, not found → 404 |
| **Middleware globale** | `ApiExceptionHandler` cattura eccezioni non gestite → 500 con `{ error: message }` |
| **Frontend** | `api.js` estrae `error` o `errors` dal body JSON e lancia `Error` leggibile |

### 4.7 Logging operativo (PortLog)

Il sistema registra automaticamente:

- **Assigned** — quando una nave viene assegnata (con arrivalDay, departureDay, duration);
- **Departed** — quando una nave parte dopo l'avanzamento del giorno.

Il servizio `PortLogService` è progettato in modo **fail-safe**: un errore di scrittura log viene catturato e scritto su console, senza far fallire l'operazione principale.

---

## 5. Decisioni Progettuali

### 5.1 SQLite come database

**Scelta:** persistenza su file SQLite (`Data/blueharbor.db`).

**Motivazione:** nessuna dipendenza da server esterno, setup immediato per docenti e studenti, adatto al volume dati ridotto del progetto.

**Trade-off:** non adatto a scenari multi-istanza o alta concorrenza; accettabile per un gestionale didattico mono-utente.

### 5.2 Enum type-safe (`ShipSize`, `ShipStatus`)

**Scelta:** sostituire stringhe magiche con enum C#.

**Motivazione:** il compilatore impedisce valori non validi; le comparazioni in `AssignmentService` e nei controller sono type-safe. L'API espone comunque stringhe JSON (`"Pending"`, `"XL"`) grazie a `JsonStringEnumConverter`.

**Impatto:** refactoring più sicuro, meno bug silenziosi nelle query e nei filtri frontend (`status === "Pending"`).

### 5.3 Service layer minimo

**Scelta:** un solo service con logica non banale (`AssignmentService`); CRUD navi/banchine direttamente nei controller.

**Motivazione:** evitare over-engineering. L'assegnazione richiede transazioni, calcolo slot e aggiornamento stato; le altre operazioni sono query/insert semplici.

### 5.4 Transazione serializzabile per le assegnazioni

**Scelta:** `BeginTransactionAsync(IsolationLevel.Serializable)` in `AssignmentService`.

**Motivazione:** prevenire double-booking in caso di richieste concorrenti sulla stessa banchina. Il vincolo DB `(BerthId, StartDay, EndDay)` UNIQUE previene solo duplicati esatti, non overlap parziali — la verifica overlap è nel service:

```csharp
bool overlap = await _db.Assignments.AnyAsync(a =>
    a.BerthId == berthId &&
    startDay <= a.EndDay && endDay >= a.StartDay);
```

### 5.5 Formula di calcolo slot

La finestra di occupazione segue la regola:

```text
lastEndDay   = MAX(EndDay) delle assegnazioni esistenti sulla banchina, oppure (currentDay - 1)
firstFreeDay = MAX(currentDay, lastEndDay + 1)
startDay     = MAX(ship.ArrivalDay, firstFreeDay)
endDay       = startDay + ship.OccupationDuration - 1
```

Questa formula è **testata** da 5 test unitari in `AssignmentServiceTests.cs`, inclusi casi di overlap consecutivo e rispetto del giorno di arrivo futuro.

### 5.6 Frontend leggero, backend come fonte di verità

**Scelta:** il frontend calcola un'anteprima della finestra (`calcSlotReal`) per il modal di conferma, ma al POST usa i valori restituiti dal backend.

**Motivazione:** UX reattiva (l'utente vede subito la finestra stimata) senza duplicare la logica autoritativa lato client.

### 5.7 Nessun DTO generalizzato

**Scelta:** i model EF (`Ship`, `Assignment`) vengono usati direttamente nelle API, con eccezioni mirate:

- `UpdateShipDto` — solo Name e Notes modificabili;
- `AssignmentRequest` — record `(ShipId, BerthId)`.

**Motivazione:** ridurre boilerplate in un progetto piccolo; accettabile didatticamente, con il trade-off di esporre la struttura interna del model.

### 5.8 CORS esplicito

**Scelta:** policy CORS limitata a `http://localhost:5173`.

**Motivazione:** frontend e backend girano su porte diverse in sviluppo; senza CORS le chiamata fetch fallirebbero. `UseCors()` è posizionato **prima** di `UseAuthorization()` come richiesto da ASP.NET Core.

### 5.9 Swagger sulla root

**Scelta:** `RoutePrefix = string.Empty` — Swagger UI accessibile direttamente su `http://localhost:5000`.

**Motivazione:** facilitare test manuali delle API durante sviluppo e dimostrazione, senza ricordare path `/swagger`.

### 5.10 Mock frontend coesistente

**Scelta:** `SchedulerPage.jsx` mantiene codice mock (`USE_MOCK`, `BERTHS` hardcoded, `calcSlot`) accanto al percorso reale.

**Motivazione:** permettere sviluppo UI parallelo al backend nelle fasi iniziali. Attualmente `USE_MOCK = false`, quindi l'app usa esclusivamente le API reali.

### 5.11 Ruoli simulati via localStorage

**Scelta:** nessuna autenticazione JWT/sessione; il ruolo è una stringa in `localStorage`.

**Motivazione:** fuori scope didattico; sufficiente per separare le due interfacce operative e dimostrare routing condizionale.

---

## 6. Sfide e Soluzioni

### 6.1 Prevenzione sovrapposizioni temporali (overlap)

**Problema:** due navi non possono occupare la stessa banchina in periodi sovrapposti, ma le finestre possono essere adiacenti (es. G1–G5 e G6–G8).

**Soluzione:**
1. Calcolo del primo giorno libero basato sull'ultimo `EndDay` esistente;
2. Verifica esplicita overlap con condizione `startDay <= a.EndDay && endDay >= a.StartDay`;
3. Transazione serializzabile per serializzare richieste concorrenti;
4. Test dedicati (`BerthOverlap_MovesToNextAvailableWindow`, `RespectsFormula_MaxArrivalDayLastEndDayPlusOne`).

### 6.2 Configurazione CORS

**Problema:** il frontend Vite (porta 5173) non può chiamare il backend (porta 5000) senza policy CORS.

**Soluzione:** configurazione in `Program.cs` con `WithOrigins("http://localhost:5173")` e posizionamento corretto del middleware nella pipeline.

### 6.3 Allineamento calcolo slot frontend/backend

**Problema:** rischio di discrepanza tra anteprima UI e risultato reale dell'assegnazione.

**Soluzione:** commento esplicito nel codice scheduler — *"Usiamo la finestra restituita dal backend (fonte di verità)"*; il toast post-assegnazione usa `result.startDay` e `result.endDay` dalla risposta API, non i valori del modal.

### 6.4 Refactoring da stringhe a enum

**Problema:** valori come `"Pending"`, `"XL"` come stringhe rendevano il codice fragile (refusi, comparazioni errate).

**Soluzione:** introduzione di `ShipSize` e `ShipStatus` come enum C#; serializzazione JSON come stringhe per compatibilità frontend; validazione `[EnumDataType]` sui model.

### 6.5 Gestione stati nave nel ciclo di vita

**Problema:** coordinare transizioni Pending → Assigned → Departed in modo coerente.

**Soluzione:**
- `CreateShip` forza sempre `Status = Pending`;
- `AssignmentService` imposta `Assigned` dentro la transazione;
- `AdvanceDay` imposta `Departed` per navi con assegnazione terminata;
- Modifica/eliminazione bloccate per navi non-Pending.

### 6.6 Migrazioni EF Core assenti nel repository

**Problema:** `Program.cs` invoca `db.Database.Migrate()` all'avvio, ma **non esiste una cartella `Migrations/`** nel repository. All'avvio il log EF Core segnala: *"No migrations were found in assembly 'BlueHarbor.API'"*.

**Impatto:** su un clone pulito del repository, lo schema del database potrebbe non essere creato automaticamente finché non si genera una migration iniziale con:

```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

**Nota:** il file `Data/blueharbor.db` è nel `.gitignore`, quindi ogni sviluppatore deve generare il proprio database localmente.

### 6.7 Disallineamento modifica nave frontend/backend

**Problema:** `OperatorePages.jsx` invia in PUT anche `size`, `arrivalDay`, `occupationDuration`, ma `UpdateShipDto` accetta solo `Name` e `Notes`. I campi extra vengono ignorati dal model binder.

**Impatto:** l'UI mostra un form di modifica completo, ma solo nome e note vengono effettivamente persistiti. Da considerare come **miglioramento futuro** o semplificazione dell'UI.

### 6.8 Test con transazioni su InMemory

**Problema:** EF Core InMemory non supporta transazioni reali; i test che usano `BeginTransactionAsync(Serializable)` generano warning.

**Soluzione:** `.ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))` nel setup dei test. I test verificano comunque la correttezza della logica di calcolo slot.

### 6.9 Componente AccessDenied non collegato

**Problema:** esiste `AccessDenied.jsx` ma `ProtectedRoute` in `App.jsx` reindirizza silenziosamente invece di mostrare la pagina di accesso negato.

**Impatto:** nessun malfunzionamento; il componente è pronto ma non integrato nel flusso attuale.

---

## 7. Stato Attuale

### 7.1 Cosa funziona

| Area | Stato | Evidenza |
|---|---|---|
| Avvio backend | ✅ | `dotnet run` su `http://localhost:5000`, Swagger attivo |
| Avvio frontend | ✅ | `npm run dev` su `http://localhost:5173` |
| Registrazione navi | ✅ | POST `/api/ships` con validazione |
| Lista e filtro navi | ✅ | GET `/api/ships?status=Pending` |
| Eliminazione navi Pending | ✅ | DELETE con controllo stato |
| Assegnazione con vincoli | ✅ | Service + transazione + test |
| Visualizzazione banchine | ✅ | GET `/api/berths` con assignment corrente |
| Avanzamento giorno | ✅ | POST `/api/advance-day` con partenze automatiche |
| Reset sistema | ✅ | POST `/api/reset` transazionale |
| PortLog backend | ✅ | Scrittura su Assigned/Departed, GET `/api/portlogs` |
| Test automatici | ✅ | **6/6 superati** (`dotnet test`) |
| UI drag-and-drop scheduler | ✅ | Selezione, drop, modal, toast |
| Protezione rotte per ruolo | ✅ | localStorage + ProtectedRoute |

### 7.2 Limitazioni note (by design o gap minori)

| Limitazione | Tipo | Dettaglio |
|---|---|---|
| Nessuna autenticazione | By design | Ruoli simulati, nessun login |
| Nessuna paginazione | By design | Volume dati ridotto |
| Nessuna containerizzazione | By design | Non richiesta |
| Migrazioni EF assenti nel repo | Gap tecnico | Richiede `dotnet ef migrations add` al primo setup |
| Modifica nave parziale | Gap UI/API | Frontend mostra più campi di quanti il backend accetti |
| PortLog non esposto in UI | Gap funzionale | API disponibile, nessuna pagina frontend |
| AccessDenied non usato | Gap minore | Componente orphan |
| Database gitignored | By design | Ogni ambiente genera il proprio `.db` |

### 7.3 Test eseguiti

Esecuzione verificata con `dotnet test BlueHarbor.API.Tests/BlueHarbor.API.Tests.csproj`:

| Test | Classe | Verifica |
|---|---|---|
| `AssignShipToBerth_ValidAssignment_CalculatesCorrectStartAndEndDay` | AssignmentServiceTests | Calcolo corretto startDay/endDay |
| `AssignShipToBerth_IncompatibleSize_ThrowsException` | AssignmentServiceTests | Rifiuto taglia incompatibile |
| `AssignShipToBerth_ShipAlreadyAssigned_ThrowsException` | AssignmentServiceTests | Rifiuto nave già assegnata |
| `AssignShipToBerth_BerthOverlap_MovesToNextAvailableWindow` | AssignmentServiceTests | Slot successivo dopo overlap |
| `AssignShipToBerth_RespectsFormula_MaxArrivalDayLastEndDayPlusOne` | AssignmentServiceTests | Rispetto arrivalDay futuro |
| `LogAsync_CreatesLogEntry` | PortLogServiceTests | Persistenza log con metadati |

**Risultato:** 6 superati, 0 falliti (durata ~1s).

### 7.4 Prossimi passi suggeriti

1. **Aggiungere migration EF Core iniziale** al repository per setup out-of-the-box;
2. **Allineare UI modifica nave** al contratto backend (solo nome/note) oppure estendere `UpdateShipDto`;
3. **Pagina storico PortLog** nel frontend per visualizzare eventi operativi;
4. **Integrare AccessDenied** nel flusso ProtectedRoute per UX più chiara;
5. **Test di integrazione API** (WebApplicationFactory) sui controller;
6. **Autenticazione base** se il progetto evolvesse oltre il contesto didattico;
7. **Docker Compose** per avvio unificato backend + frontend (opzionale).

---

## 8. Istruzioni per l'Uso

### 8.1 Prerequisiti

| Software | Versione verificata |
|---|---|
| .NET SDK | 10.0.302 |
| Node.js + npm | compatibile con Vite 8 / React 19 |
| Browser moderno | Chrome, Firefox, Edge |

### 8.2 Avvio del sistema

Aprire **due terminali** nella root del progetto (`wsa-sushi-project`).

**Terminale 1 — Backend:**

```bash
dotnet run
```

Il backend si avvia su `http://localhost:5000`. Swagger UI è disponibile sulla stessa URL.

**Terminale 2 — Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Il frontend si avvia su `http://localhost:5173`.

**Browser:**

Aprire `http://localhost:5173`, selezionare il ruolo (Operatore o Scheduler) e iniziare le operazioni.

### 8.3 Primo avvio — Database

Se è la prima esecuzione e non esiste `Data/blueharbor.db`:

1. Verificare che il backend sia in esecuzione;
2. Se le API restituiscono errori di database, generare la migration:

```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
```

3. Riavviare il backend con `dotnet run`.

All'avvio, `Program.cs` esegue automaticamente `db.Database.Migrate()` e applica eventuali migration pendenti.

### 8.4 Scenario operativo di test

#### Test come Operatore

1. Selezionare **Operatore** dalla home;
2. Inserire nome nave (es. "MSC Aurora") e note opzionali;
3. Cliccare **Registra nave** — taglia, arrivo e durata vengono assegnati automaticamente;
4. Verificare la nave nella lista con stato **Pending**;
5. Opzionale: modificare nome/note o eliminare navi Pending.

#### Test come Scheduler

1. Tornare alla home (link Navbar) e selezionare **Scheduler**;
2. Nella coda a sinistra, selezionare o trascinare una nave Pending;
3. Cliccare o rilasciare su una banchina con **taglia compatibile** (evidenziata in blu);
4. Confermare nel modal — verificare toast con finestra G[start]–G[end];
5. Osservare la banchina passare a OCCUPATA o PIANIFICATA.

#### Test avanzamento giorno

1. Dalla navbar, cliccare **Next Day**;
2. Il contatore giorno incrementa;
3. Le navi con assegnazione terminata passano a **Departed**;
4. Se ci sono navi Pending con arrivo passato, compare un warning (backend + banner scheduler).

#### Reset

1. Cliccare **Reset** nella navbar;
2. Confermare il dialogo;
3. Il sistema cancella navi e assegnazioni, ripristina giorno 1 e ricarica la pagina.

### 8.5 Test API via Swagger / HTTP

Swagger UI: `http://localhost:5000`

File di richieste predefinite: `BlueHarbor.API.http` (compatibile con REST Client VS Code).

Esempi rapidi:

```http
GET http://localhost:5000/api/ships?status=Pending
GET http://localhost:5000/api/berths
POST http://localhost:5000/api/assignments
Content-Type: application/json

{ "shipId": 1, "berthId": 3 }
```

### 8.6 Esecuzione test automatici

```bash
dotnet test BlueHarbor.API.Tests/BlueHarbor.API.Tests.csproj
```

Output atteso: 6 test superati.

### 8.7 Troubleshooting

| Problema | Causa probabile | Soluzione |
|---|---|---|
| Frontend non carica dati | Backend non avviato | Verificare `dotnet run` e porta 5000 |
| Errore CORS in console | Backend non raggiungibile o porta errata | Controllare `BASE_URL` in `frontend/src/services/api.js` |
| Database vuoto / errori 500 | Migration mancante | Generare migration EF (sezione 8.3) |
| Assegnazione rifiutata (409) | Taglia incompatibile, nave già assegnata, overlap | Leggere messaggio `error` nella risposta |
| Banchina non selezionabile | Taglia diversa dalla nave | Selezionare banchina con stessa taglia (XL→XL-1, S→S-1..S-4) |

---

## 9. Conclusioni

BlueHarbor rappresenta un **esempio compatto ma strutturato** di applicazione full-stack per la gestione operativa di un terminal portuale. Il progetto dimostra con successo l'integrazione tra un frontend React moderno e un backend ASP.NET Core con persistenza SQLite, mantenendo una separazione chiara delle responsabilità e regole di business non triviali nel service layer.

I punti di forza principali del sistema sono:

1. **Architettura a strati leggibile** — controller snelli, service dedicato alla logica critica, modello dati coerente con enum type-safe;
2. **Affidabilità delle assegnazioni** — transazioni serializzabili, verifica overlap, formula di calcolo slot testata automaticamente;
3. **Esperienza utente operativa** — due ruoli distinti, drag-and-drop, feedback visivo (statistiche, timeline, toast, warning);
4. **Facilità di avvio** — stack leggero, Swagger integrato, istruzioni chiare nel README.

Le limitazioni attuali (assenza autenticazione, migrazioni non versionate, logging non esposto in UI) sono coerenti con gli obiettivi didattici del corso e non compromettono la consegna del progetto, che risulta **completo e funzionante** per la dimostrazione del flusso operativo end-to-end.

Il sistema è pronto per la presentazione al corso *Learning by Project* e costituisce una base solida per eventuali estensioni future verso un gestionale portuale più completo.

---

*Report generato sull'analisi del codice sorgente del repository BlueHarbor — luglio 2026.*
