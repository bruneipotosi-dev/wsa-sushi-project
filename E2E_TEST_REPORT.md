# Report Test Funzionale — 2026-07-22

> **Aggiornamento successivo (PR #30, branch `fix/scheduler-slot-and-operator-permissions`):** i Bug #2 (mismatch finestra nel modal di assegnazione), #3 (bottoni Modifica/Elimina visibili su navi assegnate) e #4 (nessuna pagina Accesso negato) sono stati **corretti e verificati** con una nuova esecuzione completa dei 5 scenari, nessuna regressione. Resta aperto solo il **Bug #1** (form di modifica che non salva Taglia/Arrivo/Durata), escluso di proposito perché di competenza di Mirko. Dettagli tecnici delle correzioni nella PR #30.

> **Aggiornamento — stesso giorno, dopo nuovo pull:** `main` è avanzato a `e18ac38` (merge della PR #29, che porta in `main` il lavoro del branch `feature/accessibility-audit-fix`). Backend riavviato a pulito e i 5 scenari rieseguiti per verificare l'impatto sui bug trovati. Risultato: **Bug #5 e #6 (focus trap + `Esc`) risultano corretti**, verificati end-to-end da tastiera con successo completo. Gli altri 4 bug (#1, #2, #3, #4) sono ancora presenti, ri-riprodotti singolarmente per conferma — vedi stato aggiornato accanto a ciascuno nella sezione "Bug trovati". Nessuna regressione rilevata sugli scenari già passati. Unica differenza cosmetica: l'etichetta di stato "Pending" nell'interfaccia Operatore ora appare tradotta in italiano ("In attesa") — non è un bug, solo un cambio di copy incluso nel redesign UX di questa PR; il valore interno resta `Pending`.

**Ambiente testato:** branch `main`, commit `9eddbcf` nella prima passata, `e18ac38` (merge PR #29) nella seconda.
**Metodo:** esecuzione automatizzata reale con Playwright (Chromium headless), backend ASP.NET Core su `http://localhost:5000`, frontend Vite su `http://localhost:5173`, database SQLite ricreato da zero via migrazioni. Nessun dato mockato: ogni verifica ha interrogato l'app in esecuzione tramite click, digitazione, drag-and-drop e chiamate dirette all'API dove specificato.

## Setup

Backend e frontend sono partiti correttamente in entrambe le passate.

- `dotnet build` → 0 errori, 0 warning.
- `dotnet run` → migrazioni applicate, 8 banchine e 8 profili nave seminati, server su `:5000`.
- `npm install` (frontend) → 0 vulnerabilità, `npm run dev` → server Vite su `:5173`, HTTP 200.
- **Nota procedurale (prima passata):** all'avvio della sessione erano già attivi un processo backend e uno frontend lanciati in un turno precedente. Il processo backend era compilato **prima** del `git pull` che ha introdotto il catalogo `ShipProfiles` (`/api/shipprofiles` rispondeva 404). Riavviato a metà sessione; i test dipendenti (Scenario 3.2) sono stati rieseguiti sul processo aggiornato.
- **Nota procedurale (seconda passata):** dopo il pull della PR #29, il backend è stato nuovamente fermato, il database ricreato da zero e riavviato per garantire che i test girassero sul codice effettivamente più recente.

## Risultati per scenario

### Scenario 1 — Ciclo di vita nave
- [x] Passo 1: Registrazione "Test Nave 1" con nota "Test scenario 1" — **PASS**
- [x] Passo 2: Nave in lista con stato `Pending` (mostrato come "In attesa" dopo la PR #29 — solo copy, valore interno invariato), taglia plausibile, arrivo entro 30 gg, durata 3–15 gg — **PASS**
- [x] Passo 3: Nave trovata nella coda dello Scheduler — **PASS**
- [x] Passo 4: Assegnazione a banchina compatibile sia via **click-e-seleziona** sia via **drag-and-drop** — **PASS** entrambi i metodi
- [x] Passo 5: Modal di conferma corretto; dopo conferma la nave sparisce dalla coda, appare come occupante, stato passa a `Assigned` — **PASS**
- [ ] Passo 6: Nave assegnata **non dovrebbe** più mostrare i bottoni Modifica/Elimina in Operatore — **FAIL** (ancora presente dopo PR #29), vedi Bug #1
- [x] Passo 7–8: Dopo avanzamento giorno oltre `endDay`, la nave passa a `Departed` e la banchina torna libera — **PASS**

### Scenario 2 — Regole di compatibilità e slot
- [x] Passo 1: Due navi della stessa taglia ottenute — **PASS**
- [x] Passo 2: Prima nave assegnata correttamente — **PASS**
- [x] Passo 4: Seconda nave sulla stessa banchina inizia il giorno successivo alla fine della prima — **PASS** nella riproduzione base, ma vedi Bug #2: riprodotto separatamente con un caso mirato (nave con arrivo molto anticipato rispetto a un buco libero) il modal ha mostrato G1–G3 mentre il backend ha salvato G35–G37. **Il bug è ancora presente dopo PR #29**, semplicemente non sempre visibile con dati casuali.
- [x] Passo 5: UI impedisce il click su banchina incompatibile — **PASS**
- [ ] Passo 6: Messaggio di errore chiaro lato UI per incompatibilità — **FAIL** lato UI (invariato); **PASS** lato backend via chiamata diretta

### Scenario 3 — Funzionalità del team
- [x] Passo 1 (Reset): navi/assegnazioni azzerate, giorno a 1, 8 banchine presenti — **PASS**
- [x] Passo 2 (Catalogo navi): autocompletamento note dal catalogo + nota manuale non sovrascritta — **PASS**
- [x] Passo 3 (Modifica/Elimina): rinomina nave `Pending` e cancellazione funzionano — **PASS**
- [x] Passo 4 (Tema chiaro/scuro): cambia e persiste su tutte le pagine e dopo refresh — **PASS**
- [x] Passo 5 (Card statistiche): posizionate in basso in entrambe le pagine — **PASS**

*(Riverificato interamente nella seconda passata, nessuna regressione.)*

### Scenario 4 — Casi limite e gestione errori
- [x] Passo 1: nome vuoto bloccato lato client + errore di validazione leggibile lato server — **PASS**
- [x] Passo 2: doppia chiamata concorrente a `/api/reset` senza errori — **PASS**
- [ ] Passo 3: accesso a `/scheduler` con ruolo Operatore attivo (e viceversa) — nessun crash/pagina bianca, ma ancora nessuna pagina "Accesso negato" — **FAIL** parziale, invariato dopo PR #29, vedi Bug #4

### Scenario 5 — Navigazione da tastiera
- [x] Selezione nave in coda raggiungibile con `Tab`, `Enter` la seleziona — **PASS**
- [x] Banchina compatibile raggiungibile con `Tab` (banchine incompatibili correttamente escluse dal tab order) — **PASS**
- [x] Il focus si sposta **dentro** il modal quando si apre — **PASS** ✅ **CORRETTO dopo PR #29** (era Bug #5)
- [x] Il focus resta intrappolato nel modal fino a "Conferma" (focus trap attivo) — **PASS** ✅ **CORRETTO dopo PR #29**
- [x] `Enter` su "Conferma" completa l'assegnazione al 100% da tastiera — **PASS**
- [x] `Esc` chiude il modal — **PASS** ✅ **CORRETTO dopo PR #29** (era Bug #6)
- [x] Indicatore di focus visibile su tutti gli elementi navigabili — **PASS**

**Scenario 5 ora passa integralmente.** L'hook `useFocusTrap.js`, visto in stash durante la prima passata, risulta ora integrato in `SchedulerPage.jsx` (`useFocusTrap(!!confirmModal, handleCloseModal)`) e funziona correttamente: focus spostato nel modal all'apertura, trap attivo su Tab/Shift+Tab, `Esc` chiude il modal, focus ripristinato all'elemento che aveva aperto il dialog.

## Bug trovati

### 🔴 Alta priorità — ancora aperti

**Bug #1 — Il form di modifica nave permette di cambiare Taglia/Arrivo/Durata ma il backend li ignora silenziosamente** — **STATO: ancora presente**
- `UpdateShipDto` (`Controllers/ShipsController.cs`) accetta solo `Name` e `Notes`. Riverificato dopo la PR #29: richiesto `size=M→S, arrivalDay=21→1, duration=14→7`, salvato invece il valore originale invariato, con messaggio "modificata con successo" fuorviante.

**Bug #2 — Il modal di conferma assegnazione può mostrare una finestra temporale diversa da quella realmente salvata** — **STATO: ancora presente**
- `calcSlotReal` in `SchedulerPage.jsx` non è cambiato: prova ancora a riempire i "buchi" liberi su una banchina, mentre `AssignmentService.cs` assegna sempre in modo strettamente sequenziale (`MAX(EndDay)+1`). Riprodotto con un caso mirato dopo la PR #29: nave con arrivo giorno 1 su banchina libera-a-buco → modal mostra **G1–G3**, il backend salva realmente **G35–G37**.

### 🟡 Media priorità — ancora aperti

**Bug #3 — Una nave `Assigned` mostra ancora i bottoni Modifica/Elimina in Operatore** — **STATO: ancora presente**
- `OperatorePages.jsx` renderizza sempre `.btn-ship-edit`/`.btn-ship-delete` indipendentemente dallo stato, invariato dopo la PR #29.

**Bug #4 — Nessuna pagina "Accesso negato" quando si accede a una sezione del ruolo sbagliato** — **STATO: ancora presente**
- `ProtectedRoute` in `App.jsx` reindirizza silenziosamente. `AccessDenied.jsx` resta codice morto (mai importato), invariato dopo la PR #29.

### ✅ Corretti dalla PR #29

**Bug #5 — Il modal di assegnazione non aveva un focus trap** — **CORRETTO**
- `useFocusTrap.js` ora integrato in `SchedulerPage.jsx`. Verificato da tastiera: focus spostato nel modal all'apertura, intrappolato correttamente su Tab.

**Bug #6 — `Esc` non chiudeva il modal di assegnazione** — **CORRETTO**
- Lo stesso hook gestisce `Escape` chiamando `handleCloseModal`. Verificato: il modal si chiude correttamente con `Esc`.

### 🟢 Bassa priorità / osservazioni

**Oss. #1 — Nessun messaggio di errore esplicito per assegnazione incompatibile** — invariato
- La UI previene l'errore disabilitando/sbiadendo le banchine incompatibili, ma non spiega mai testualmente il motivo. Il backend ha un messaggio chiaro (`"Dimensione incompatibile: ..."`) ma non è mai raggiungibile dalla UI normale.

## Limiti del test

- Testato solo su **Chromium** (via Playwright headless); non verificato su Firefox/Safari né su viewport mobile/touch.
- La visibilità del focus è stata verificata leggendo `outline`/`box-shadow` calcolati dal browser, non con osservazione visiva umana; screenshot di alcuni passaggi chiave salvati in `/tmp/.../scratchpad/e2e/screenshots/` (non allegati a questo report).
- Non testato con screen reader reali (NVDA/VoiceOver/JAWS): le verifiche di accessibilità si sono limitate a ordine di tabulazione, gestione del focus e attributi ARIA nel markup.
- Il Bug #2 non si manifesta con ogni combinazione casuale di dati (serve che l'arrivo della nuova nave produca una finestra che "sembra" libera prima dell'ultima assegnazione sulla banchina); è stato riprodotto deliberatamente con un caso mirato per confermarlo in modo inequivocabile, sia prima che dopo la PR #29.
- Come da istruzioni, nessun bug è stato corretto in questa fase: sono stati solo documentati/riverificati, in attesa di conferma su quali affrontare per primi.
