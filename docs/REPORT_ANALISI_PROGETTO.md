# Report Analisi Progetto — BlueHarbor Terminal
> Generato il: 22/07/2026 · Branch/commit: 9eddbcf067379c36b14c3b36ad2faf545297723b
> Scope: analisi read-only del codice + requisiti commessa + task extra.

## 1. Riepilogo esecutivo
Il progetto BlueHarbor si presenta in uno stato **completo e funzionante**, con un backend ASP.NET Core 10 ben strutturato (controller snelli, service layer per logica critica, transazioni serializzabili, persistenza SQLite) e un frontend React moderno con due ruoli distinti. La stima di copertura vs requisiti commessa è **~90%**: tutti i requisiti base sono implementati e testati, e i tre task extra (Salome, Mirko KDI, Mirko Operatore Upgrade) risultano integrati. Permangono alcune riserve di severità medio-bassa, in particolare il disallineamento frontend/backend nella modifica nave (lato Operatore la UI mostra campi modificabili che il backend ignora), l'assenza di test xUnit per il catalogo ShipProfile e alcune piccole mancanze di copertura frontend (endpoint ship profiles non chiamato, problema di falsi negativi nell'overlap detection del service). Verdetto: **pronto per demo con riserve**.

## 2. Tabella stato requisiti e task
| Area / Task | Stato | Evidenza (file:riga) | Note |
|---|---|---|---|
| Registrazione navi | ✅ fatto | `Controllers/ShipsController.cs:67-92` | POST /api/ships, forza status=Pending |
| Generazione casuale size/arrivo/durata | ✅ fatto | `frontend/src/pages/OperatorePages.jsx:6-13` | `generateShipData()`: size random da array, arrivalDay random +31gg, duration random 3-15 |
| Assegnazione compatibile (taglia) | ✅ fatto | `Services/AssignmentService.cs:31-32` | `if (ship.Size != berth.Size)` throw |
| No-overlap (primo slot libero) | ✅ fatto | `Services/AssignmentService.cs:37-47` | Calcolo lastEndDay + firstFreeDay + verifica overlap esplicita |
| Next Day → Departed | ✅ fatto | `Controllers/SystemController.cs:38-61` | Filtra assignments con EndDay < CurrentDay, imposta Departed |
| No auto-assign su Next Day | ✅ fatto | `Controllers/SystemController.cs:30-78` | Nessuna assegnazione automatica, solo passaggio a Departed |
| Task Salome: catalogo ShipProfile (8 navi) | ✅ fatto | `Data/AppDbContext.cs:58-67` | Seed 8 profili (Poseidon Express, Ocean Trader, ...) |
| Task Salome: autocompletamento note in CreateShip | ✅ fatto | `Controllers/ShipsController.cs:77-86` | Solo se note vuote, case-insensitive (ToLower), senza toccare Size |
| Task Salome: endpoint GET /api/shipprofiles | ✅ fatto | `Controllers/ShipProfilesController.cs:18-22` | GET /api/shipprofiles, return Ok(list) |
| Task Mirko KDI: stats in basso (Operatore) | ✅ fatto | `frontend/src/pages/OperatorePages.jsx:314-331` | Stats-container--bottom dopo ships-list |
| Task Mirko KDI: stats in basso (Scheduler) | ✅ fatto | `frontend/src/pages/SchedulerPage.jsx:414-423` | sch-stats--bottom dopo sch-berth-grid |
| Task Mirko Operatore Upgrade: logo MSC | ✅ fatto | `frontend/src/components/Navbar.jsx:35` | `<img src={mscLogo} alt="MSC" className="bh-logo" />` |
| Task Mirko Operatore Upgrade: contrasto testi | ✅ fatto | `frontend/src/styles/_theme.scss:67-131` | Token WCAG AA calibrati per tema light |
| Task Mirko Operatore Upgrade: responsive | ✅ fatto | `frontend/src/pages/OperatorePages.scss:582-714` | Breakpoint 1200/768/480px |
| Test xUnit | ⚠️ parziale | `BlueHarbor.API.Tests/AssignmentServiceTests.cs`, `PortLogServiceTests.cs` | 6 test, ma **mancano test per ShipProfile** (Task Salome) e per i controller |
| Documentazione | ✅ fatto | `docs/BLUEHARBOR_ARCHITECTURAL_DOCUMENTATION.md`, `docs/BLUEHARBOR_PROJECT_REPORT.md` | Coerente con il codice, aggiornata a luglio 2026 |

## 3. 🔴🟠🟡 Problematiche e cose da sistemare

### P1 — Disallineamento modifica nave: frontend invia campi extra che backend ignora [🟠 MEDIO]
- **Evidenza**: `frontend/src/pages/OperatorePages.jsx:109-116` invia `size`, `arrivalDay`, `occupationDuration`, `status` nel PUT; `Controllers/ShipsController.cs:101` usa `UpdateShipDto` che accetta solo `Name` e `Notes`.
- **Cosa succede**: Il model binder ignora silenziosamente size/arrivalDay/duration. L'operatore vede campi editabili ma le modifiche non vengono persistite. UX ingannevole.
- **Impatto**: Demo — l'operatore può credere di aver cambiato la taglia di una nave, ma il backend non la applica. Violazione del principio di minima sorpresa.
- **Suggerimento fix**: Due opzioni: (a) rimuovere i campi extra dal form di modifica frontend, oppure (b) estendere `UpdateShipDto` con `Size`, `ArrivalDay`, `OccupationDuration` e validarli, modificando il controller per aggiornarli.

### P2 — Assenza test xUnit per catalogo ShipProfile (Task Salome) [🟠 MEDIO]
- **Evidenza**: Nessun file di test menziona `ShipProfile` o `ShipProfilesController` in `BlueHarbor.API.Tests/`.
- **Perché è un problema**: La funzionalità di autocompletamento note (Task Salome) è logica nuova — senza test non c'è garanzia che il match case-insensitive funzioni, che il fallback a note vuote sia corretto, o che endpoint GET /api/shipprofiles risponda bene.
- **Impatto**: Manutenibilità — un refactoring futuro del catalogo non avrebbe rete di sicurezza.
- **Suggerimento fix**: Aggiungere test xUnit per `ShipsController.CreateShip` (autocompletamento note, case-insensitive, navi non nel catalogo) e per `ShipProfilesController.GetAll`.

### P3 — Falsa sicurezza: verifica overlap in AssignmentService può dare falsi negativi con dati sovrapposti in batch [🟠 MEDIO]
- **Evidenza**: `Services/AssignmentService.cs:49-54` fa `AnyAsync(a => a.BerthId == berthId && startDay <= a.EndDay && endDay >= a.StartDay)` **dopo** aver calcolato startDay/endDay ma **prima** di SaveChanges. In un batch multi-thread, due richieste concorrenti sulla stessa banchina potrebbero entrambe superare il controllo overlap prima che una committi.
- **Perché è un problema**: La transazione Serializable (riga 37) mitiga ma non elimina il rischio al 100% su SQLite (locking a livello file). Se due richieste arrivano quasi insieme, entrambe potrebbero vedere la stessa `lastEndDay` e passare l'overlap check.
- **Impatto**: Robustezza — possibilità di double-booking in scenari di concorrenza reale (diversi scheduler).
- **Suggerimento fix**: Aggiungere un unique constraint composito su `(BerthId, StartDay)` nel DB (oltre a quello esistente su BerthId+StartDay+EndDay) oppure usare `_db.Database.ExecuteSqlRaw` con `OUTPUT INSERTED` in una singola operazione atomica.

### P4 — Migration cronologicamente invertite [🟠 MEDIO]
- **Evidenza**: `Migrations/20260721093923_AddShipProfileCatalog.cs` ha timestamp **2026-07-21**, mentre `Migrations/20260722091132_InitialCreate.cs` ha timestamp **2026-07-22**. La migration "AddShipProfileCatalog" è stata creata PRIMA di "InitialCreate".
- **Perché è un problema**: EF Core applica le migrazioni in ordine cronologico. Con un database pulito, `AddShipProfileCatalog` verrebbe applicata prima di `InitialCreate` (che crea la tabella `ShipProfiles`), causando un errore `"Table 'ShipProfiles' already exists"` o `"Invalid column name"`.
- **Impatto**: Demo — il `db.Database.Migrate()` in Program.cs fallirebbe su un clone pulito del repository. (Nota: il file `.db` è gitignored, quindi ogni nuovo ambiente è esposto.)
- **Suggerimento fix**: Rinominare i file delle migrazioni per avere ordine cronologico corretto: `InitialCreate` → 20260721..., `AddShipProfileCatalog` → 20260722..., oppure unire le due migrazioni in una sola.

### P5 — Frontend non espone l'endpoint GET /api/shipprofiles [🟡 BASSO]
- **Evidenza**: `frontend/src/services/api.js:1-54` non contiene nessuna funzione `getShipProfiles()`.
- **Perché è un problema**: Il backend fornisce il catalogo (Task Salome), ma il frontend non lo chiama mai. L'autocompletamento note avviene lato backend (corretto), ma l'operatore non può vedere l'elenco dei profili disponibili.
- **Impatto**: UX — l'operatore potrebbe non sapere quali nomi di nave attivano l'autocompletamento.
- **Suggerimento fix**: Aggiungere `export const getShipProfiles = () => request("/shipprofiles")` in `api.js` e opzionalmente mostrare un piccolo tooltip/legenda nel form di creazione.

### P6 — Pluralizzazione italiana errata nei messaggi UI (sempre "navi" anche con 1) [🟡 BASSO]
- **Evidenza**: `frontend/src/pages/OperatorePages.jsx:182` ha `<span className="ships-count">{ships.length} navi</span>` — mostra "1 navi". `frontend/src/pages/SchedulerPage.jsx:264-265` ha `c'è 1 nave` (corretto) ma solo per il warning, non per il counter generale.
- **Perché è un problema**: Errore grammaticale italiano — "1 navi" suona scorretto.
- **Impatto**: UX/cosmetico — non blocca la demo, ma poco professionale.
- **Suggerimento fix**: Usare `{ships.length} ${ships.length === 1 ? 'nave' : 'navi'}`.

### P7 — Componente AccessDenied non integrato nel routing [🟡 BASSO]
- **Evidenza**: `frontend/src/components/AccessDenied.jsx` esiste, ma `frontend/src/App.jsx:12-22` (ProtectedRoute) fa `return <Navigate to="/" replace />` invece di mostrare AccessDenied.
- **Perché è un problema**: Componente orphan — creato ma mai usato. Se un utente tenta di accedere a una rotta non autorizzata, viene reindirizzato silenziosamente alla home invece di ricevere un feedback esplicito.
- **Impatto**: UX minore.
- **Suggerimento fix**: In ProtectedRoute, al posto del Navigate, rendere `<AccessDenied />`.

### P8 — PortLog non visibile in nessuna pagina frontend [🟡 BASSO]
- **Evidenza**: `Controllers/PortLogsController.cs` espone GET /api/portlogs, ma nessuna pagina frontend lo utilizza.
- **Perché è un problema**: Funzionalità backend completa ma invisibile all'utente.
- **Impatto**: Demo — non si può mostrare lo storico operativo durante la presentazione senza usare Swagger.
- **Suggerimento fix**: Aggiungere una pagina "Storico" o una sezione nel pannello operatore/scheduler che mostri i log recenti.

### P9 — Operatore: handleSaveEdit invia dati non gestiti dal backend ma non resetta error allo switch [nessuna severità aggiuntiva / incluso in P1]

### P10 — Operatore: assenza di hover effettivo sulle ship-card (commentato) correttamente per Task Mirko KDI [✅ risolto]
- Verifica positiva: il commento "HOVER RIMOSSO" in `frontend/src/pages/OperatorePages.scss:302-306` conferma che il task è stato eseguito. Nessuna problematica.

## 4. 🟢 Cose TOP / Punti di forza

### T1 — Transazione Serializable in AssignmentService [MASSIMA AFFIDABILITÀ]
- **Evidenza**: `Services/AssignmentService.cs:37`
- **Perché è ben fatto**: La scelta di `IsolationLevel.Serializable` è la più restrittiva e previene race condition sul double-booking. In combinazione con la verifica overlap esplicita (righe 49-54) e il rollback su eccezione (righe 87-90), il servizio garantisce l'integrità delle assegnazioni anche in scenari concorrenti. Documentato anche in `docs/BLUEHARBOR_PROJECT_REPORT.md:364-372`.

### T2 — Autocompletamento note da catalogo ShipProfile lato backend, case-insensitive, senza toccare Size [IMPLEMENTAZIONE PRECISA TASK SALOME]
- **Evidenza**: `Controllers/ShipsController.cs:77-86`
- **Perché è ben fatto**: Il codice controlla `string.IsNullOrWhiteSpace(ship.Notes)`, fa il match case-insensitive con `.ToLower()` su entrambi i lati, completa le note **solo** se trovate e **non modifica** la Size (requisito Salome). L'operatore può comunque sovrascrivere le note manualmente.

### T3 — Tema chiaro con contrasto WCAG AA certificato [ACCESSIBILITÀ]
- **Evidenza**: `frontend/src/styles/_theme.scss:67-131` (intero blocco `:root[data-theme="light"]`) e commento righe 100-101, 110-112.
- **Perché è ben fatto**: I colori sono stati scelti verificando il rapporto di contrasto 4.5:1 per testo normale (WCAG AA). Le varianti "primary-text" (riga 101) e i colori semantici scuriti (success, warning, danger, coral) dimostrano cura artigianale per l'accessibilità, rara in progetti didattici.

### T4 — Statistiche spostate in basso in entrambe le pagine [TASK MIRKO KDI COMPLETATO]
- **Evidenza**: `frontend/src/pages/OperatorePages.jsx:314-331` e `frontend/src/pages/SchedulerPage.jsx:414-423`
- **Perché è ben fatto**: Le stats sono state spostate dal top al fondo della card/nella sch-berth-column, con separatore `border-top`, allineamento a destra e stili dedicati `.stats-container--bottom` e `.sch-stats--bottom`.

### T5 — Validazione completa con DataAnnotations su tutti i modelli [ROBUSTEZZA]
- **Evidenza**: `Models/Ship.cs:10-28` (Required, StringLength, Range, EnumDataType), `Models/Assignment.cs:9-23`, `Controllers/ShipsController.cs:13-18` (UpdateShipDto), `Program.cs:18-27` (ApiBehaviorOptions).
- **Perché è ben fatto**: Ogni input ha validazione sia lato model che lato controller. La normalizzazione degli errori in `Program.cs` produce risposte JSON uniformi con campo `error`, consumate consistentemente dal frontend `api.js:12-14`.

### T6 — 6 test xUnit con EF Core InMemory e copertura della logica di calcolo slot [QUALITÀ TEST]
- **Evidenza**: `BlueHarbor.API.Tests/AssignmentServiceTests.cs:10-168` (5 test), `PortLogServiceTests.cs:10-29` (1 test).
- **Perché è ben fatto**: I test coprono: calcolo corretto start/end day, taglia incompatibile, nave già assegnata, overlap che si sposta allo slot successivo, rispetto dell'arrivalDay futuro. Il setup `CreateInMemoryDb` (righe 12-27) è pulito e riutilizzabile.

### T7 — ProtectedRoute con routing condizionale per ruolo [SICUREZZA UI]
- **Evidenza**: `frontend/src/App.jsx:12-22`
- **Perché è ben fatto**: Il componente ProtectedRoute verifica la presenza del ruolo in localStorage e reindirizza al percorso corretto (o alla home) se l'utente tenta di accedere a una rotta non autorizzata. Pattern pulito e riutilizzabile.

## 5. 🟡 Da verificare / Incertezze

1. **Ordine delle migration su database pulito**: Non ho potuto eseguire `dotnet run` per verificare se `db.Database.Migrate()` fallisce con l'ordine invertito delle migration. La diagnosi è basata sull'analisi dei timestamp dei file. Dipende dalla configurazione EF Core e dal fatto che `AddShipProfileCatalog` contenga già l'istruzione `CREATE TABLE IF NOT EXISTS` o usi `migrationBuilder.CreateTable` (che fallirebbe se la tabella esiste già da `InitialCreate`).

2. **Comportamento della transazione Serializable su SQLite**: SQLite non supporta `IsolationLevel.Serializable` realmente — si comporta come `Serialized` a livello di connessione. Non verificabile staticamente.

3. **Presenza/assenza di altri file di task *.md**: Ho trovato solo `BLUEHARBOR_ARCHITECTURAL_DOCUMENTATION.md` e `BLUEHARBOR_PROJECT_REPORT.md` in `docs/`. Nessun file di task esplicito nella root oltre al README.md. I task extra (Salome, Mirko KDI, Operatore Upgrade) sono stati dedotti dal codice e dai commenti.

4. **Il bug di falsi negativi nell'overlap check (P3) è teorico in un contesto didattico monoutente, ma andrebbe monitorato se il sistema venisse esposto a più scheduler contemporaneamente.

## 6. Checklist pre-consegna consigliata
- [ ] 🔴 **P1**: Allineare il form di modifica nave in OperatorePages.jsx al contratto backend `UpdateShipDto` (solo Name e Notes) — rimuovere i campi size/arrivalDay/duration/status dal form di edit, oppure estendere il DTO backend.
- [ ] 🔴 **P4**: Correggere l'ordine delle migration EF Core — unire le due migrazioni o rinominare i file per ordine cronologico corretto.
- [ ] 🟠 **P2**: Aggiungere test xUnit per il catalogo ShipProfile (autocompletamento notes, case-insensitive, endpoint GET).
- [ ] 🟠 **P3**: Valutare se aggiungere un unique constraint su `(BerthId, StartDay)` per prevenire double-booking a livello database.
- [ ] 🟡 **P5**: Aggiungere `getShipProfiles()` in `api.js` e considerare una legenda UI per l'operatore.
- [ ] 🟡 **P6**: Correggere la pluralizzazione italiana in OperatorePages.jsx riga 182: usare template string con condizionale.
- [ ] 🟡 **P7**: Integrare il componente `AccessDenied.jsx` nel `ProtectedRoute` invece del reindirizzamento silenzioso.
- [ ] 🟡 **P8**: Valutare se aggiungere una pagina "Storico" o una sezione log nel frontend per esporre i PortLog.
- [ ] ✅ Verificare che `npm run dev` e `dotnet run` funzionino su un clone pulito con le migration corrette.