# BlueHarbor — Manuale d'uso del terminal portuale

> **Versione:** 1.0 · **Progetto didattico** — ITS Web Solutions Architect

---

## Cos'è BlueHarbor?

BlueHarbor è un'applicazione web che simula la gestione di un **terminal portuale** (un porto per navi container). Il sistema ti permette di:

1. **Registrare le navi** che arrivano al porto
2. **Assegnare le navi alle banchine** (i posti barca) in modo ordinato
3. **Avanzare il giorno operativo** per simulare lo scorrere del tempo

Il tutto con un'interfaccia web semplice, accessibile dal browser.

### A cosa serve?

BlueHarbor è nato come progetto didattico per imparare a costruire un'applicazione **full-stack** — cioè un programma che ha una parte visibile (il **frontend**, quello che vedi nel browser) e una parte invisibile (il **backend**, il server che elabora i dati e li salva).

Non è un sistema "vero" per gestire un porto reale, ma mostra come funzionano le applicazioni web professionali: separazione tra interfaccia e logica, database, API, e regole di business.

---

## Prerequisiti (cosa ti serve per farlo funzionare)

Prima di avviare BlueHarbor, devi installare alcuni strumenti sul tuo computer. Ecco cosa ti serve e **perché** serve.

### 1. .NET SDK (versione 10.0 o superiore)

**.NET** è il "motore" che fa funzionare il backend. Il backend è la parte del programma che sta sul server: riceve le richieste dal browser, elabora i dati (es. controlla se una nave può essere assegnata a una banchina) e li salva nel database.

- **A cosa serve**: eseguire il backend di BlueHarbor
- **Dove scaricarlo**: [https://dotnet.microsoft.com/download](https://dotnet.microsoft.com/download)
- **Come verificare se è già installato**: apri un terminale (Prompt dei comandi o PowerShell) e digita:
  ```bash
  dotnet --version
  ```
  Se vedi un numero che inizia con `10.` (es. `10.0.302`), sei a posto.

### 2. Node.js (con npm)

**Node.js** è un ambiente che permette di eseguire JavaScript al di fuori del browser. **npm** (Node Package Manager) è il suo "negozio di pacchetti": serve per scaricare le librerie necessarie al frontend (React, Vite, ecc.).

- **A cosa serve**: eseguire il frontend di BlueHarbor (la parte che vedi nel browser)
- **Dove scaricarlo**: [https://nodejs.org/](https://nodejs.org/) (scegli la versione LTS, che è la più stabile)
- **Come verificare se è già installato**:
  ```bash
  node --version
  npm --version
  ```
  Se vedi due numeri di versione, tutto ok.

### 3. Un browser moderno

BlueHarbor funziona con Chrome, Firefox, Edge o qualsiasi browser aggiornato. Non serve installare niente di speciale.

### 4. (Opzionale) Git

Git serve per scaricare il codice del progetto se non lo hai già. Se hai già la cartella `wsa-sushi-project` sul computer, puoi saltare questo passaggio.

---

## Installazione passo-passo

Segui questi passaggi nell'ordine. Ogni comando è accompagnato da una spiegazione di cosa fa.

### Passo 1: Apri due terminali

Dovrai tenere aperti **due terminali** (finestre di Prompt dei comandi o PowerShell) perché backend e frontend girano contemporaneamente.

- **Terminale 1** → per il backend (il server)
- **Terminale 2** → per il frontend (l'interfaccia)

### Passo 2: Avvia il backend (Terminale 1)

Il backend è la parte "nascosta" del programma. Si occupa di ricevere le richieste, applicare le regole di business e salvare i dati.

```bash
# Spostati nella cartella del backend
cd backend

# Avvia il server
dotnet run
```

**Cosa succede qui:**
- `cd backend` ti porta nella cartella che contiene il codice del server
- `dotnet run` compila il codice (se necessario) e avvia il server

**Output atteso:** vedrai dei messaggi che dicono che il server è partito, tra cui:
```
Now listening on: http://localhost:5000
```

Questo significa che il backend è in esecuzione sulla **porta 5000** del tuo computer. La "porta" è come un canale di comunicazione: il frontend parlerà con il backend attraverso questa porta.

> **Nota:** Lascia questo terminale aperto. Se lo chiudi, il backend si ferma.

### Passo 3: Avvia il frontend (Terminale 2)

Il frontend è la parte visibile: le pagine web che vedrai nel browser.

```bash
# Spostati nella cartella del frontend
cd frontend

# Scarica le librerie necessarie (solo la prima volta)
npm install

# Avvia il server di sviluppo
npm run dev
```

**Cosa succede qui:**
- `cd frontend` ti porta nella cartella del codice dell'interfaccia
- `npm install` scarica tutte le librerie elencate in `package.json` (React, Vite, ecc.). Lo fai solo la **prima volta** che avvii il progetto
- `npm run dev` avvia un server di sviluppo che ricarica automaticamente la pagina quando modifichi il codice

**Output atteso:**
```
VITE v8.x.x  ready in XXX ms
➜  Local:   http://localhost:5173/
```

Il frontend è ora accessibile all'indirizzo `http://localhost:5173`.

### Passo 4: Apri il browser

Apri il browser e vai all'indirizzo:

```
http://localhost:5173
```

Dovresti vedere la schermata principale di BlueHarbor con due opzioni: **Operatore** e **Scheduler**.

---

## Guida all'uso

### Prima di iniziare: scegli il tuo ruolo

Quando apri BlueHarbor per la prima volta, vedrai una schermata con due card (due riquadri cliccabili):

- **Operatore** — gestisce le navi (le registra, le modifica, le elimina)
- **Scheduler** — assegna le navi alle banchine

Clicca su uno dei due per iniziare. Puoi cambiare ruolo in qualsiasi momento cliccando su "Home" nella barra di navigazione in alto.

> **Nota:** Non c'è una vera autenticazione (login con password). Il ruolo è solo una simulazione per separare le due funzioni. In un sistema reale, ci sarebbero account e permessi.

---

### Funzionalità 1: Registrare una nave (ruolo Operatore)

Questa è la prima cosa da fare per usare BlueHarbor: senza navi, non c'è niente da assegnare.

**Passaggi:**

1. Dalla home, clicca su **Operatore**
2. Nella sezione "Registra nuova nave", inserisci:
   - **Nome nave** (obbligatorio) — ad esempio "MSC Aurora"
   - **Note operative** (opzionale) — ad esempio "Carico di containers refrigerati"
3. Clicca su **Registra nave**

**Cosa succede "dietro le quinte":**

Il frontend genera automaticamente tre dati tecnici che non devi inserire tu:

| Dato | Come viene generato | Esempio |
|---|---|---|
| **Taglia** | Casuale tra XL, L, M, S | M |
| **Giorno di arrivo** | Casuale tra oggi e oggi+31 | Giorno 15 |
| **Durata occupazione** | Casuale tra 3 e 15 giorni | 5 giorni |

La nave viene creata con stato **"In attesa"** (Pending in inglese). Questo significa che è in coda, pronta per essere assegnata a una banchina.

**Se il nome corrisponde a un profilo noto...**

BlueHarbor ha un catalogo di 8 navi predefinite (es. "Poseidon Express", "Ocean Trader"). Se inserisci uno di questi nomi, le note vengono compilate automaticamente dal sistema. Puoi comunque modificarle se vuoi.

**Output atteso dopo la registrazione:**

Vedrai un messaggio di conferma come:
```
"MSC Aurora" registrata — taglia M, arrivo giorno 15
```

E la nave apparirà nella lista "Registro navi" qui sotto, con un badge che dice "In attesa".

---

### Funzionalità 2: Modificare o eliminare una nave (ruolo Operatore)

Nella lista "Registro navi", ogni nave in stato "In attesa" ha due pulsanti:

- **✏️ (Modifica)** — ti permette di cambiare nome e note
- **❌ (Elimina)** — cancella la nave definitivamente

**Importante:** Puoi modificare o eliminare solo le navi **in attesa**. Una volta che una nave è stata assegnata o è partita, non puoi più toccarla. Questo perché il sistema deve garantire che le assegnazioni già fatte rimangano valide.

**⚠️ Nota sulla modifica:** Il form di modifica mostra anche i campi "Taglia", "Arrivo" e "Durata", ma queste modifiche **non vengono salvate** dal backend. Solo nome e note vengono effettivamente aggiornati. Questo è un piccolo difetto noto dell'interfaccia.

---

### Funzionalità 3: Assegnare una nave a una banchina (ruolo Scheduler)

Questa è la funzionalità più importante di BlueHarbor. Una nave in attesa deve essere ormeggiata a una banchina compatibile.

**Prima di iniziare, un po' di contesto:**

Il porto ha **8 banchine**, ognuna con una taglia specifica:

| Banchina | Taglia |
|---|---|
| XL-1 | XL (extra large) |
| L-1 | L (large) |
| M-1, M-2 | M (medium) |
| S-1, S-2, S-3, S-4 | S (small) |

Una nave può essere assegnata **solo** a una banchina della stessa taglia. Una nave taglia M non può stare su una banchina S, e viceversa.

**Passaggi:**

1. Dalla home, clicca su **Scheduler**
2. A sinistra vedrai la **Coda di attesa** con le navi in stato "In attesa"
3. Clicca su una nave per selezionarla (si illumina)
4. Nella griglia delle banchine a destra, le banchine **compatibili** (stessa taglia) si illuminano di blu
5. Clicca su una banchina compatibile (oppure trascina la nave sulla banchina)

**Cosa succede dopo:**

Apparirà una finestra di conferma che mostra:

```
Nave: MSC Aurora (M)
→ Banchina: M-1
Giorno inizio: G15
Giorno fine: G19
Durata: 5 giorni
```

Clicca **Conferma** per completare l'assegnazione.

**Come viene calcolata la finestra temporale?**

Il backend segue queste regole:

1. La nave non può arrivare **prima** del suo giorno di arrivo
2. La nave non può occupare la banchina **prima** del giorno corrente
3. Se la banchina è già occupata in quei giorni, la nave viene spostata **dopo** l'ultima occupazione
4. Due navi non possono **mai** sovrapporsi sulla stessa banchina

Esempio pratico:
- Oggi è il giorno 10
- La banchina M-1 è occupata dal giorno 8 al giorno 14
- La nave "MSC Aurora" arriva il giorno 12
- → L'assegnazione partirà dal giorno **15** (dopo che la banchina si libera)

**Output atteso:**

Vedrai un toast (notifica temporanea) in basso:
```
Assegnazione confermata
MSC Aurora → M-1 · Finestra G15–G19
```

E la banchina nella griglia passerà a stato **PIANIFICATA** o **OCCUPATA**.

---

### Funzionalità 4: Avanzare il giorno operativo

Nella barra di navigazione in alto (navbar), vedrai il **giorno corrente** e un pulsante **Next Day**.

**Cosa fa "Next Day"?**

1. Il giorno corrente aumenta di 1 (es. da giorno 10 a giorno 11)
2. Le navi la cui assegnazione è **terminata** (EndDay < nuovo giorno) passano automaticamente a stato **"Partita"** (Departed)
3. Se ci sono navi in attesa con arrivo già passato, compare un avviso

**Perché serve?**

Simula lo scorrere del tempo nel porto. In un porto reale, ogni giorno le navi arrivano, vengono ormeggiate e ripartono. BlueHarbor fa lo stesso in modo virtuale.

**Esempio concreto:**

1. Assegna "MSC Aurora" alla banchina M-1 (finestra G15–G19)
2. Clicca **Next Day** più volte fino a superare il giorno 19
3. Nella lista navi (ruolo Operatore), "MSC Aurora" ora ha stato **"Partita"**

---

### Funzionalità 5: Resettare il sistema

Il pulsante **Reset** nella navbar cancella tutti i dati (navi, assegnazioni) e riporta il giorno corrente a 1.

**Attenzione:** Questa operazione **non può essere annullata**. Il sistema ti chiederà conferma prima di procedere.

A cosa serve: per ricominciare da capo durante una dimostrazione o un test.

---

### Funzionalità 6: Le statistiche

Sia nella pagina Operatore che in quella Scheduler, in fondo trovi delle statistiche:

**Operatore:**
- Totale navi
- In attesa
- Assegnate
- Partite

**Scheduler:**
- Navi in attesa
- Banchine libere

Queste statistiche ti danno un colpo d'occhio immediato sullo stato del terminal.

---

## Errori comuni e soluzioni

| Problema | Causa probabile | Soluzione |
|---|---|---|
| **Il frontend non carica i dati** (schermata vuota) | Il backend non è in esecuzione | Verifica che `dotnet run` sia partito nel Terminale 1 e che la porta 5000 sia attiva |
| **Errore CORS nella console del browser** | Il backend non risponde sulla porta giusta | Controlla che `BASE_URL` in `frontend/src/services/api.js` sia `http://localhost:5000/api` |
| **Errore 500 all'avvio del backend** | Database non inizializzato o migrazioni non applicate | Ferma il backend con `Ctrl+C`, poi esegui: `cd backend && dotnet ef database update`, poi riavvia con `dotnet run` |
| **"Nave non trovata"** quando provi ad assegnare | La nave è già stata assegnata o eliminata | Ricarica la pagina (F5) per aggiornare la lista |
| **"Dimensione incompatibile"** | Hai selezionato una banchina di taglia diversa dalla nave | Scegli una banchina con la stessa taglia (es. nave M → banchina M-1 o M-2) |
| **"La banchina è già occupata"** | La banchina è già prenotata per quei giorni | Il backend sposterà automaticamente la finestra più avanti; riprova |
| **"1 navi"** (errore grammaticale) | Bug minore nell'interfaccia | Segnalalo — dovrebbe essere "1 nave" |
| **Il database non si crea** | Migrazioni EF Core mancanti o con ordine sbagliato | Vedi sezione "Primo avvio — Database" qui sotto |

### Primo avvio — Database

Se è la prima volta che avvii il progetto e il backend dà errori di database:

```bash
# Ferma il backend (Ctrl+C), poi:
cd backend

# Crea le migrazioni (se non esistono già)
dotnet ef migrations add InitialCreate

# Applica le migrazioni al database
dotnet ef database update

# Riavvia il backend
dotnet run
```

> **Nota tecnica:** Il database SQLite (`Data/blueharbor.db`) viene creato automaticamente. Non è incluso nel repository Git perché ogni sviluppatore deve generare il proprio.

---

## API (per chi vuole approfondire)

BlueHarbor espone delle **API REST** — cioè degli indirizzi web che restituiscono dati in formato JSON. Se sei curioso di vedere cosa "parlano" frontend e backend, puoi esplorare le API direttamente dal browser.

### Swagger UI

Apri il browser e vai a:

```
http://localhost:5000
```

Vedrai l'interfaccia **Swagger**, che elenca tutte le API disponibili e ti permette di testarle con un clic.

### Elenco delle API principali

| Indirizzo | Cosa fa |
|---|---|
| `GET /api/ships` | Elenco di tutte le navi |
| `GET /api/ships?status=Pending` | Solo navi in attesa |
| `POST /api/ships` | Crea una nuova nave |
| `PUT /api/ships/{id}` | Modifica nome e note di una nave |
| `DELETE /api/ships/{id}` | Elimina una nave (solo se in attesa) |
| `GET /api/berths` | Elenco banchine con stato attuale |
| `GET /api/assignments` | Elenco assegnazioni |
| `POST /api/assignments` | Crea una nuova assegnazione |
| `GET /api/day` | Giorno corrente |
| `POST /api/advance-day` | Avanza il giorno |
| `POST /api/reset` | Resetta il sistema |
| `GET /api/portlogs` | Storico eventi (log) |
| `GET /api/shipprofiles` | Catalogo profili navi predefiniti |

---

## Struttura del progetto (per chi vuole capire com'è fatto)

Se vuoi esplorare il codice, ecco una mappa delle cartelle principali:

```
wsa-sushi-project/
├── backend/                    # Il server (ASP.NET Core)
│   ├── Controllers/            # Le "porte" delle API (7 file)
│   ├── Services/               # La logica di business
│   ├── Models/                 # Le entità (nave, banchina, ecc.)
│   ├── Data/                   # Il database e la configurazione
│   ├── Middleware/              # Gestione errori
│   └── Migrations/             # Cronologia delle modifiche al database
├── frontend/                   # L'interfaccia (React + Vite)
│   └── src/
│       ├── pages/              # Le pagine (Operatore, Scheduler, Home)
│       ├── components/         # Componenti riutilizzabili (Navbar)
│       ├── services/           # Le chiamate al backend
│       └── styles/             # Fogli di stile
├── docs/                       # Documentazione
└── BlueHarbor.API.Tests/       # Test automatici
```

---

## Test automatici

BlueHarbor include **6 test automatici** che verificano il corretto funzionamento della logica di assegnazione. Per eseguirli:

```bash
dotnet test BlueHarbor.API.Tests/BlueHarbor.API.Tests.csproj
```

Output atteso: **6 test superati, 0 falliti**.

---

## Glossario

| Termine | Significato |
|---|---|
| **API** | Interfaccia che permette a due programmi di comunicare tra loro. In BlueHarbor, il frontend parla con il backend attraverso API REST. |
| **Backend** | La parte "nascosta" del programma che gira sul server. Elabora i dati e li salva nel database. |
| **Banchina** | Il posto barca dove una nave si ormeggia. Ogni banchina ha una taglia (XL, L, M, S). |
| **CORS** | Un meccanismo di sicurezza del browser che permette a un sito web (frontend) di chiamare un server su una porta diversa. |
| **Database** | Il "magazzino" dove vengono salvati tutti i dati (navi, banchine, assegnazioni). BlueHarbor usa SQLite, un database leggero basato su file. |
| **Endpoint** | Un indirizzo web specifico dell'API (es. `/api/ships`). |
| **Frontend** | La parte visibile del programma, quella che vedi nel browser. |
| **JSON** | Un formato per rappresentare dati come testo. Esempio: `{ "nome": "MSC Aurora", "taglia": "M" }`. |
| **ORM** | Un programma che traduce il codice (oggetti C#) in comandi per il database. BlueHarbor usa Entity Framework Core. |
| **Porta** | Un "canale" di comunicazione del computer. Il backend usa la porta 5000, il frontend la 5173. |
| **REST** | Uno stile per progettare API web. Si basa su operazioni standard (GET, POST, PUT, DELETE). |
| **Singleton** | Un oggetto che esiste in una sola copia. In BlueHarbor, il giorno corrente è un singleton. |
| **SQLite** | Un database leggero che salva i dati in un unico file (`.db`). Non serve installare un server. |
| **Swagger** | Un'interfaccia web che elenca tutte le API e permette di testarle. |
| **Transazione** | Un'operazione che viene eseguita "tutta o niente". Se qualcosa va storto, il database torna allo stato precedente. |

---

## Come contribuire (per sviluppatori)

BlueHarbor è un progetto didattico, ma se vuoi contribuire o segnalare problemi:

1. **Segnala bug** — apri una issue su GitHub
2. **Suggerisci miglioramenti** — le aree più utili su cui lavorare sono elencate nella [documentazione tecnica](docs/DOCUMENTAZIONE_TECNICA.md#9-limiti-noti-e-sviluppi-futuri)
3. **Fai una pull request** — se modifichi il codice, assicurati che i test passino

### Cose da sapere prima di modificare il codice

- Il backend è in C# con ASP.NET Core 10
- Il frontend è in JavaScript con React 19
- Il database è SQLite (il file `.db` è nel `.gitignore`)
- I test sono in xUnit e si eseguono con `dotnet test`

---

## Licenza e contatti

BlueHarbor è un progetto didattico realizzato per il corso **Learning by Project** dell'ITS Web Solutions Architect.

- **Docenti e team del corso:** Grazie per il supporto e la guida durante lo sviluppo.
- **Repository GitHub:** [https://github.com/bruneipotosi-dev/wsa-sushi-project](https://github.com/bruneipotosi-dev/wsa-sushi-project)

---

## Documentazione correlata

- [Documentazione tecnica completa](docs/DOCUMENTAZIONE_TECNICA.md) — per sviluppatori e approfondimenti
- [Report di progetto](docs/BLUEHARBOR_PROJECT_REPORT.md) — analisi architetturale originale
- [Report analisi codice](docs/REPORT_ANALISI_PROGETTO.md) — audit e incongruenze rilevate