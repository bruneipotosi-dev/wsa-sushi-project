# BlueHarbor - Documentazione Architetturale

## 1. Introduzione

**BlueHarbor** è un terminal container didattico sviluppato per il corso *Learning by Project* dell'ITS Web Solutions Architect. Il sistema simula la gestione operativa di un porto con navi in attesa, banchine disponibili e assegnazioni pianificate nel tempo.

Lo scenario di business è semplice ma realistico: l'operatore registra le navi, lo scheduler assegna una nave a una banchina compatibile per taglia, e il sistema mantiene lo stato operativo del terminal giorno per giorno. L'obiettivo non è costruire un TMS completo, ma dimostrare una progettazione pulita, coerente e facilmente estendibile.

Gli obiettivi principali del sistema sono:

| Obiettivo | Descrizione |
|---|---|
| Gestione navi | Inserire e consultare le navi con taglia, stato, arrivo e durata di occupazione |
| Gestione banchine | Esporre 8 banchine fisse con taglie compatibili |
| Assegnazione ormeggi | Assegnare una nave a una banchina evitando conflitti temporali |
| Avanzamento operativo | Simulare il passaggio del tempo con un giorno corrente condiviso |
| Supporto didattico | Rendere chiara l'architettura e le scelte progettuali |

---

## 2. Architettura Complessiva

BlueHarbor adotta un'architettura **Client-Server** con API **REST**. Il frontend React richiede dati e comandi al backend ASP.NET Core tramite HTTP JSON. Il backend applica le regole di business e persiste i dati in SQLite tramite Entity Framework Core.

### Diagramma ad alto livello

```text
+--------------------------+        HTTP/JSON         +---------------------------+
|   Browser / Frontend     | <---------------------> |   ASP.NET Core Backend    |
|   React + Vite           |                         |   Controllers + Services   |
|                          |                         |   Models + EF Core         |
+--------------------------+                         +-------------+-------------+
                                                                      |
                                                                      | EF Core
                                                                      v
                                                           +-----------------------+
                                                           |      SQLite DB        |
                                                           |  blueharbor.db        |
                                                           +-----------------------+
```

### Flusso logico principale

```text
Utente
  |
  v
Frontend React
  |
  +--> GET /api/ships, /api/berths, /api/assignments
  |
  +--> POST /api/ships
  |
  +--> POST /api/assignments
  |
  +--> POST /api/advance-day
  v
Backend ASP.NET Core
  |
  +--> Controllers validano input e orchestrano richieste
  +--> AssignmentService applica le regole di business
  +--> AppDbContext persiste su SQLite
```

### Tecnologie utilizzate

| Livello | Tecnologia | Ruolo |
|---|---|---|
| Frontend | React + Vite | UI, routing, chiamate HTTP, stato locale |
| Backend | ASP.NET Core | API REST, configurazione applicativa, dependency injection |
| Persistenza | SQLite | Database leggero per il progetto didattico |
| ORM | Entity Framework Core | Modellazione dominio, migrazioni, query |
| Serializzazione | System.Text.Json | JSON con enum serializzati come stringhe |

---

## 3. Componenti Principali

## 3.1 Backend (ASP.NET Core)

Il backend è organizzato per responsabilità, con controller per l'esposizione HTTP, un service layer minimo per la logica più delicata e un modello dati gestito da EF Core.

### Controllers

| Controller | Responsabilità | Endpoint principali |
|---|---|---|
| ShipsController | Gestione CRUD base delle navi | `GET /api/ships`, `GET /api/ships/{id}`, `POST /api/ships` |
| BerthsController | Esposizione delle banchine e dello stato operativo | `GET /api/berths` |
| AssignmentsController | Creazione e consultazione assegnazioni | `GET /api/assignments`, `GET /api/assignments/{id}`, `POST /api/assignments` |
| SystemController | Stato del giorno e avanzamento del sistema | `GET /api/day`, `POST /api/advance-day` |

I controller hanno un ruolo di orchestrazione: ricevono la richiesta, delegano a EF Core o al service layer, e restituiscono una risposta HTTP coerente.

### Services

Il progetto usa un service layer essenziale, concentrato su un solo caso d'uso critico: l'assegnazione di una nave a una banchina.

| Service | Responsabilità |
|---|---|
| IAssignmentService | Contratto del servizio di assegnazione |
| AssignmentService | Verifica compatibilità, calcolo finestra temporale, aggiornamento stato nave, persistenza transazionale |

Questa scelta mantiene la logica di business fuori dai controller e riduce il rischio di duplicazione.

### Models

Le entità di dominio principali sono:

| Modello | Ruolo |
|---|---|
| Ship | Nave registrata nel sistema |
| Berth | Banchina del terminal |
| Assignment | Assegnazione temporale nave-banchina |
| SystemState | Stato globale del sistema, incluso il giorno corrente |

Il progetto usa anche due enum type-safe:

| Enum | Valori |
|---|---|
| ShipSize | `XL`, `L`, `M`, `S` |
| ShipStatus | `Pending`, `Assigned`, `Departed` |

### Data

`AppDbContext` definisce:

| Aspetto | Implementazione |
|---|---|
| Connessione dati | `DbSet<>` per le entità principali |
| Seed | 8 banchine fisse e `CurrentDay = 1` |
| Indici | Su `Ship.Status`, `Ship.ArrivalDay`, `Assignment.ShipId`, `Assignment.BerthId + StartDay + EndDay` |
| Vincoli | Unicità su `(BerthId, StartDay, EndDay)` |
| Conversioni | `HasConversion<string>()` per enum memorizzati come testo |

### Frontend (React + Vite)

Il frontend è diviso in pagine e componenti di navigazione. Nella struttura attuale non esistono `ShipCard` e `BerthCard` come file separati: le card sono renderizzate direttamente dentro le pagine operative.

| Area | File | Responsabilità |
|---|---|---|
| Pages | `MainPage`, `OperatorePages`, `SchedulerPage` | Schermate principali dell'applicazione |
| Components | `Navbar` | Navigazione, giorno corrente, avanzamento/reset |
| Services | `api.js` | Wrapper HTTP verso il backend |
| State | `useState`, props, `useEffect` | Stato locale e passaggio dati tra componenti |

`App.jsx` gestisce il routing principale e conserva lo stato del giorno corrente e della lista navi, condividendolo tra le pagine operative.

---

## 4. Modello Dati

### Entità e relazioni

```text
Ship 1 ---- n Assignment n ---- 1 Berth
   |
   | stato operativo: Pending / Assigned / Departed
   |
   +--> ShipSize: XL / L / M / S

SystemState
   |
   +--> CurrentDay
```

### Descrizione funzionale

| Entità | Campi principali | Note |
|---|---|---|
| Ship | Id, Name, Size, ArrivalDay, OccupationDuration, Status, Notes | La nave viene registrata e poi assegnata a una banchina |
| Berth | Id, Name, Size | Le banchine sono fisse e dimensionate per taglia |
| Assignment | Id, ShipId, BerthId, StartDay, EndDay | Definisce la finestra temporale dell'ormeggio |
| SystemState | Id, CurrentDay | Memorizza il giorno operativo corrente |

### Seed dati

Il sistema parte con:

| Seed | Valore |
|---|---|
| Banchine | 8 banchine fisse: 1 XL, 1 L, 2 M, 4 S |
| Giorno corrente | 1 |

### Indici e vincoli

Gli indici principali servono a migliorare le query più frequenti:

| Indice | Scopo |
|---|---|
| `IX_Ships_Status` | Filtrare rapidamente le navi per stato |
| `IX_Ships_ArrivalDay` | Ricercare navi per giorno di arrivo |
| `IX_Assignments_ShipId` | Accelerare i join con le assegnazioni |
| `IX_Assignments_BerthId_StartDay_EndDay` | Supportare il calcolo degli slot liberi |
| `UX_Assignments_BerthId_StartDay_EndDay` | Evitare duplicati esatti |

Le conversioni EF Core su `Size` e `Status` permettono di mantenere il database leggibile, pur usando enum nel codice applicativo.

---

## 5. Decisioni Progettuali

| Decisione | Motivazione | Impatto |
|---|---|---|
| SQLite come database | Setup rapido e zero infrastruttura | Ideale per una demo didattica |
| Nessun DTO | Riduce complessità e codice boilerplate | Più semplice da leggere, meno livelli di astrazione |
| Service layer minimo | La sola logica delicata è l'assegnazione | Separazione sufficiente tra orchestrazione e business |
| Enum type-safe | Elimina stringhe magiche e errori di battitura | Codice più sicuro e manutenibile |
| `HasConversion<string>()` | Mantiene il DB leggibile | Persistenza chiara senza perdere i benefici degli enum |
| Transazione serializzabile | Protegge da assegnazioni concorrenti errate | Riduce il rischio di double-booking |
| Mock per sviluppo frontend | Sviluppo parallelo UI/API | Utile nelle prime fasi o per demo locali |

### Perché gli enum sono una scelta importante

Prima del refactoring, valori come `Pending`, `Assigned`, `Departed`, `XL`, `L`, `M`, `S` vivevano come stringhe. Questo rendeva il sistema più fragile: un refuso o una comparazione errata potevano introdurre bug silenziosi. Con gli enum:

```text
stringi magiche -> errori di battitura possibili
enum type-safe  -> valori limitati e controllati dal compilatore
```

Il backend continua comunque a salvare valori testuali nel database grazie alle conversioni EF Core, così il dato resta leggibile anche fuori dall'applicazione.

---

## 6. Compromessi

| Compromesso | Scelta fatta | Motivo |
|---|---|---|
| Nessuna autenticazione | Non implementata | Fuori scope per il progetto didattico |
| Nessuna containerizzazione | Non implementata | Non richiesta dalla consegna |
| Nessuna paginazione | Non implementata | Volume dati ridotto |
| UI essenziale | Layout pulito ma funzionale | Focus su correttezza architetturale |
| Mock e backend reale coesistono | Sì | Permette test e sviluppo progressivo |

Dal punto di vista architetturale, queste scelte sono coerenti con un progetto dimostrativo: si privilegia la chiarezza del flusso e la solidità delle regole di business rispetto a funzionalità enterprise non necessarie.

---

## 7. Conclusione

BlueHarbor è un esempio compatto di applicazione full-stack con architettura pulita, separazione ragionevole delle responsabilità e modello dati coerente. Il sistema dimostra come un backend ASP.NET Core con EF Core possa gestire regole operative reali, mentre un frontend React fornisce un'interfaccia moderna e chiara per l'utente finale.

Dal punto di vista didattico, il progetto mostra tre aspetti importanti:

1. progettazione a strati con responsabilità ben distribuite;
2. uso di enum type-safe e transazioni per migliorare affidabilità e manutenibilità;
3. scelta di tecnologie leggere e facilmente avviabili, adatte a un contesto di corso.

Il risultato è un sistema semplice da comprendere, ma sufficientemente strutturato da rappresentare bene un piccolo dominio operativo reale.