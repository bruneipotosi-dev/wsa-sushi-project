# 🚢 BlueHarbor
> Port Terminal Management System — ITS Web Solutions Architect · Learning by Project 2025

---

## ⚡ Quick Start — Leggi prima di tutto

### 1. Clona il repo
```bash
git clone https://github.com/bruneipotosi-dev/wsa-sushi-project.git
cd wsa-sushi-project
```

### 2. Crea il tuo branch
```bash
git checkout -b tuo-nome/task
# esempio: git checkout -b mirko/navbar
```

### 3. Avvia il Frontend
```bash
cd frontend
npm install
npm run dev     # → localhost:5173
```

### 4. Avvia il Backend
```bash
cd backend
dotnet restore
dotnet run      # → localhost:5000
```

### 5. Per testare sul telefono
```bash
# Installa cloudflared (solo la prima volta)
npm install -g cloudflared

# Terminale 1 — avvia Vite
npm run dev

# Terminale 2 — crea tunnel
cloudflared tunnel --url http://localhost:5173
# → ti darà un URL pubblico da aprire sul telefono
```

---

## 🔄 Git Workflow — ogni giorno

```bash
# Prima di iniziare → aggiorna
git pull origin main

# Lavori sui tuoi file...

# Salva e carica
git add .
git commit -m "feat: descrizione modifica"
git push origin tuo-nome/task
```

> ⚠️ **Non pushare mai direttamente su `main`!**
> Apri sempre una Pull Request su GitHub e aspetta l'approvazione.

---

## 👥 Team & Branch

| Membro | Task | Branch |
|--------|------|--------|
| **Paul** | MainPage · SchedulerPage | `paul/frontend` |
| **Mirko** | Navbar · OperatorePage | `mirko/navbar` |
| **Hussni** | ShipService · POST/GET /api/ships | `hussni/ships` |
| **Ibra** | AssignmentService · /api/assignments | `ibra/assign` |
| **Salome** | Schema DB · AdvanceDay · Data layer | `salome/db` |

---

## 📁 Struttura Cartelle

```
wsa-sushi-project/
├── frontend/                         # React + Vite
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                   # routing principale
│       ├── styles/
│       │   └── _variables.scss       # colori condivisi
│       ├── api/
│       │   └── api.js                # USE_MOCK toggle
│       ├── mock/
│       │   └── mockData.js           # dati finti per sviluppo
│       ├── components/
│       │   └── Navbar.jsx            # MIRKO
│       └── pages/
│           ├── MainPage.jsx          # PAUL
│           ├── OperatorePage.jsx     # MIRKO
│           └── SchedulerPage.jsx     # PAUL
│
└── backend/                          # ASP.NET Core C#
    ├── Program.cs
    ├── Controllers/
    │   ├── ShipsController.cs        # HUSSNI
    │   ├── AssignmentsController.cs  # IBRA
    │   └── SystemController.cs       # SALOME
    ├── Services/
    │   ├── ShipService.cs            # HUSSNI
    │   └── AssignmentService.cs      # IBRA
    ├── Models/
    │   ├── Ship.cs
    │   ├── Berth.cs
    │   └── Assignment.cs
    └── Data/                         # SALOME
```

---

## 🔗 API Endpoints

| Metodo | Endpoint | Chi |
|--------|----------|-----|
| GET | /api/day | Salome |
| POST | /api/advance-day | Salome |
| GET | /api/ships | Hussni |
| POST | /api/ships | Hussni |
| GET | /api/assignments | Ibra |
| POST | /api/assignments | Ibra |

---

## 📐 Regole di Dominio

- **Navi:** dimensioni XL / L / M / S
- **Banchine:** 1 XL · 1 L · 2 M · 4 S (solo navi stessa dimensione)
- **Stati nave:** Pending → Assigned → Departed
- **Next Day:** avanza il giorno virtuale · imposta Departed alle navi scadute
- **Arrivo:** massimo 30 giorni dal giorno corrente
- **Durata:** tra 3 e 15 giorni

---

## 🛠️ Stack Tecnologico

| Layer | Tecnologia |
|-------|-----------|
| Frontend | React + Vite + SCSS |
| Routing | React Router DOM |
| Backend | ASP.NET Core C# |
| Database | SQLite |
| Version Control | Git + GitHub |

---

*BlueHarbor © 2025 — INTERNAL USE ONLY*
