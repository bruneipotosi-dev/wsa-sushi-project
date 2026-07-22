# BlueHarbor

Questo è il progetto che abbiamo fatto per il corso *Learning by Project*. BlueHarbor è un piccolo gestionale per un terminal portuale fittizio: le navi le registri da una parte, le banchine le vedi dall'altra, e poi lo scheduler si occupa di assegnarle senza farle sovrapporre.

L'idea era fare qualcosa di semplice ma reale, non l'ennesimo esercizio astratto. Il giorno operativo avanza con un pulsante, le assegnazioni vengono calcolate dal backend, e il frontend resta leggero così si capisce subito come gira tutto.

## Come si avvia

Il setup non è lungo. Ti basta aprire due terminali nella cartella del progetto e fare questi passaggi.

```bash
# 1. backend
cd backend
dotnet run

# 2. frontend
cd frontend
npm install
npm run dev

# 3. apri il browser
http://localhost:5173
```

Se qualcosa non parte, controlla prima queste due cose:

```text
- backend su http://localhost:5000
- frontend su http://localhost:5173
```

Il backend usa ASP.NET Core 10, Entity Framework Core e SQLite. Alla partenza applica anche le migrazioni, quindi se è la prima esecuzione potrebbe creare il database da solo.

## Cosa fa il progetto

Ci sono due pagine operative principali.

La pagina **Operatore** serve per registrare le navi. Da lì inserisci nome e note, mentre il backend assegna i dati tecnici come taglia, giorno di arrivo, durata e stato iniziale.

La pagina **Scheduler** serve per assegnare le navi alle banchine. Qui entra in gioco la parte più delicata del progetto: la nave deve avere una taglia compatibile, la banchina deve essere libera nel periodo giusto e il backend deve evitare doppie prenotazioni.

Il resto dell'app è abbastanza lineare: la home ti fa scegliere il ruolo, la navbar mostra il giorno corrente e permette di avanzarlo, e il sistema aggiorna lo stato delle navi quando il tempo passa.

## Stack

| Livello | Tecnologia |
|---|---|
| Frontend | React + Vite |
| Routing frontend | React Router |
| Backend | ASP.NET Core 10 |
| ORM | Entity Framework Core |
| Database | SQLite |

Le API principali sono queste:

```text
/api/ships
/api/berths
/api/assignments
/api/day
/api/advance-day
```

Il frontend parla con il backend tramite `frontend/src/services/api.js`, che centralizza tutte le chiamate HTTP. Le pagine principali stanno in `frontend/src/pages`, mentre il routing generale è gestito da `frontend/src/App.jsx`.

## Struttura del repository

La struttura è abbastanza semplice:

| Cartella | Contenuto |
|---|---|
| `Controllers` | Endpoint API |
| `Services` | Logica di business, soprattutto `AssignmentService` |
| `Models` | Entità del dominio |
| `Data` | `AppDbContext`, seed e configurazione EF Core |
| `frontend/src/pages` | Le tre pagine principali |
| `frontend/src/services/api.js` | Le chiamate HTTP |

## Nota pratica

La parte più rognosa da gestire è stata quella delle sovrapposizioni nelle assegnazioni. Per questo il backend usa una transazione serializzabile e controlli lato service, così non ci si ritrova con due navi nella stessa finestra temporale sulla stessa banchina.

Se non vedi subito i dati del terminal, controlla che le migrazioni siano state applicate e che il backend stia girando sulla porta giusta.

## Documentazione

La documentazione architetturale si trova qui:

- [docs/BLUEHARBOR_PROJECT_REPORT.md](docs/BLUEHARBOR_PROJECT_REPORT.md)

## Grazie

Grazie ai docenti e al team del corso. Questo progetto è stato fatto per imparare a tenere insieme frontend, backend e database senza complicarsi la vita più del necessario.