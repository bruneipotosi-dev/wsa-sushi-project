# 🚢 BlueHarbor
**Port Terminal Management System** — ITS Web Solutions Architect · Learning by Project 2025

---

## 👥 Team & Responsabilità

| Membro | Ruolo | Area |
|--------|-------|------|
| **Mirko** | Navbar · MainPage · OperatorePage | Frontend |
| **Paul** | SchedulerPage · griglia banchine | Frontend |
| **Hussni** | ShipService · `POST/GET /api/ships` | Backend |
| **Ibra** | AssignmentService · `/api/assignments` | Backend |
| **Salome** | Schema DB · AdvanceDay · Data layer | Database |

---

## 🌿 Branch Git

> ⚠️ **Non pushare mai direttamente su `main`!**

| Branch | Responsabile |
|--------|-------------|
| `main` | 🔒 base condivisa |
| `paul/scheduler` | Paul |
| `mirko/navbar` | Mirko |
| `hussni/ships` | Hussni |
| `ibra/assign` | Ibra |
| `salome/db` | Salome |

---

## 📁 Struttura Cartelle

```
blueharbor/
│
├── frontend/                         # React + Vite
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                   # routing principale
│       ├── api/
│       │   └── api.js                # USE_MOCK toggle
│       ├── components/               # shared
│       └── pages/
│           ├── MainPage.jsx          # MIRKO
│           ├── OperatorePage.jsx     # MIRKO
│           └── SchedulerPage.jsx     # PAUL
│
├── backend/                          # ASP.NET Core C#
│   ├── Program.cs
│   ├── Controllers/
│   │   ├── ShipsController.cs        # HUSSNI
│   │   ├── AssignmentsController.cs  # IBRA
│   │   └── SystemController.cs       # SALOME
│   ├── Services/
│   ├── Models/
│   │   ├── Ship.cs
│   │   ├── Berth.cs
│   │   └── Assignment.cs
│   └── Data/                         # SALOME
│
├── .gitignore
└── README.md
```

---

## 🚀 Come iniziare

**Frontend**
```bash
cd frontend
npm install
npm run dev     # → localhost:5173
```

**Backend**
```bash
cd backend
dotnet restore
dotnet run      # → localhost:5000
```

---

## 🔄 Git Workflow

```bash
# 1. Prima di iniziare — scarica gli aggiornamenti
git pull origin main

# 2. Crea il tuo branch (solo la prima volta)
git checkout -b paul/scheduler

# 3. Salva le modifiche
git add .
git commit -m "feat: aggiungo SchedulerPage"

# 4. Carica su GitHub
git push origin paul/scheduler
```

---

## 🔗 API Endpoints

| Metodo | Endpoint | Responsabile |
|--------|----------|-------------|
| `GET` | `/api/ships` | Hussni |
| `POST` | `/api/ships` | Hussni |
| `GET` | `/api/assignments` | Ibra |
| `POST` | `/api/assignments` | Ibra |
| `POST` | `/api/advance-day` | Salome |
| `GET` | `/api/day` | Salome |

---

## 📐 Regole di Dominio

- **Navi:** dimensioni XL / L / M / S
- **Banchine:** 1 XL · 1 L · 2 M · 4 S (solo navi stessa dimensione)
- **Stati nave:** `Pending` → `Assigned` → `Departed`
- **Next Day:** avanza il giorno virtuale, imposta `Departed` alle navi scadute

---

*BlueHarbor © 2025 — INTERNAL USE ONLY*
