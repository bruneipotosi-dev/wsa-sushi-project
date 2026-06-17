# BlueHarbor Project - Visual Dashboard

```
╔════════════════════════════════════════════════════════════════════════════════╗
║                         BLUEHARBOR PROJECT STATUS                             ║
║                       Container Terminal Management System                     ║
╚════════════════════════════════════════════════════════════════════════════════╝
```

## 📈 Project Progress

```
████████░░░░░░░░░░░░░░░░░░░░░░░░░░░ 24% Complete

Timeline: ▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
          Jun 8         Jun 17          Jun 24       Jun 30
          START         NOW             TARGET       DEADLINE
```

---

## 🏗️ Project Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     BLUEHARBOR SYSTEM                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │   FRONTEND       │         │   BACKEND API    │         │
│  │   React+Vite     │◄────────►│  ASP.NET Core    │         │
│  │                  │ 🔄 HTTP │                  │         │
│  │  ✅ MainPage    │         │  ✅ Models      │         │
│  │  ✅ Navbar      │         │  ✅ Controllers │         │
│  │  ⚠️ OperatorUI   │         │  ✅ Services    │         │
│  │  ❌ SchedulerUI  │         │  ✅ Database    │         │
│  │                  │         │                  │         │
│  └──────────────────┘         └────────┬─────────┘         │
│                                        │                   │
│                               ┌────────▼──────────┐        │
│                               │   SQLite Database │        │
│                               │                   │        │
│                               │  ✅ Ships        │        │
│                               │  ✅ Berths       │        │
│                               │  ✅ Assignments  │        │
│                               └───────────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Key Integration Points:
  🔴 MISSING: api.js (Frontend → Backend HTTP client)
  🔴 MISSING: Context API (Global state management)
  🔴 MISSING: SchedulerPage implementation
  🔴 MISSING: Berth assignment business logic
```

---

## 📊 Feature Matrix

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Feature                          Backend  Frontend  Integrated  Status  │
├─────────────────────────────────────────────────────────────────────────┤
│ Ship Registration API               ✅      ⚠️        ❌       50%    │
│ Ship Registration UI                         ✅       ❌       30%    │
│ Berth Management API                ✅       ❌        ❌       20%    │
│ Berth Assignment Logic              ❌       ❌        ❌        0%    │
│ Scheduler Page UI                          ❌        ❌        0%    │
│ Ship Status Lifecycle               ⚠️       ❌        ❌       20%    │
│ Next Day Action                     ⚠️       ❌        ❌       20%    │
│ Authentication System               ❌       ❌        ❌        0%    │
│ Real-time Updates                   ❌       ❌        ❌        0%    │
│ API Documentation                   ⚠️       N/A       N/A      60%    │
└─────────────────────────────────────────────────────────────────────────┘

Legend: ✅ = Complete | ⚠️ = Partial | ❌ = Not Started
```

---

## 🎯 Sprint Roadmap (Next 7 Days)

### Sprint 1: Foundation Integration (Days 1-2) 🔥 CRITICAL
```
DAY 1 (Jun 17-18):
  ├─ [Hussein] Create api.js client (axios wrapper)
  ├─ [Hussein] Setup CORS in Program.cs
  ├─ [Hussein] Create Context API (Ships, CurrentDay)
  └─ [Team] Code review & validation

DAY 2 (Jun 18-19):
  ├─ [Mirko] Import OperatorePage from branch
  ├─ [Mirko] Connect OperatorePage to API
  ├─ [Paul] Create SchedulerPage grid layout
  └─ [All] E2E test: Create ship → Verify in DB
```

### Sprint 2: Core Features (Days 3-5) 🚀 MAIN WORK
```
DAY 3 (Jun 19-20):
  ├─ [Hussein] Implement AssignmentService (berth assignment)
  ├─ [Paul] Add drag-and-drop to SchedulerPage
  └─ [Mirko] Add loading states & error handling

DAY 4 (Jun 20-21):
  ├─ [Hussein] Complete advance-day endpoint
  ├─ [Paul] Add "Next Day" button & UI update
  ├─ [Paul] Add status color coding (Pending/Assigned/Departed)
  └─ [Team] Full integration test

DAY 5 (Jun 21-22):
  ├─ [All] Bug fixes & edge cases
  ├─ [Hussein] Add missing API endpoints (PUT/DELETE)
  └─ [Team] Performance testing
```

### Sprint 3: Authentication & Polish (Days 6-7)
```
DAY 6 (Jun 22-23):
  ├─ [Hussein] Implement JWT authentication
  ├─ [Paul] Create Login page
  └─ [Mirko] Add error boundaries

DAY 7 (Jun 23-24):
  ├─ [All] Final testing & QA
  ├─ [Hussein] Generate Swagger docs
  ├─ [All] Documentation & handoff
  └─ 🎉 MVP COMPLETE
```

---

## 📋 Dependency Graph

```
                    ┌─────────────────┐
                    │   HUSSNI        │
                    │  Create api.js  │
                    │  Setup CORS     │
                    │ Create Contexts │
                    └────────┬────────┘
                             │
                  ┌──────────┴──────────┐
                  │                   │
            ┌─────▼─────┐      ┌─────▼──────┐
            │   MIRKO   │      │   PAUL     │
            │ OperatorUI│      │ SchedulerUI│
            │ API Calls │      │ Grid Layout│
            └─────┬─────┘      └─────┬──────┘
                  │                  │
                  │            ┌─────▼──────┐
                  │            │   HUSSNI   │
                  │            │ Assignment │
                  │            │  Service   │
                  │            └─────┬──────┘
                  │                  │
                  └──────────┬───────┘
                             │
                    ┌────────▼────────┐
                    │   PAUL          │
                    │ Drag & Drop     │
                    │ Assignment Form │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   HUSSNI        │
                    │  Next Day API   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   PAUL          │
                    │ Next Day Button │
                    └────────────────┘
```

---

## 🔥 Critical Path

```
MVP COMPLETION CRITICAL PATH (24 days est.)

Start: Jun 17
  │
  ├─ [2h]   API.js ──────────────────────────┐
  │                                          ├─→ Integration Ready (Jun 18)
  ├─ [2h]   CORS Setup ────────────────────┬─┘
  │                                         │
  ├─ [2h]   Context API ──────────────────┘
  │
  ├─ [2d]   Operator UI Integration ──────────┐
  │                                           ├─→ Operator MVP (Jun 20)
  ├─ [2d]   SchedulerPage UI ────────────────┘
  │
  ├─ [2d]   Assignment Service ──────────────┐
  │                                          ├─→ Scheduler MVP (Jun 22)
  ├─ [1d]   Drag-and-Drop ────────────────┬─┘
  │                                        │
  ├─ [1d]   Next Day Logic ───────────────┘
  │
  └─ [2d]   Testing & Fixes ────────────────→ MVP COMPLETE (Jun 24)

TOTAL: 15 working hours + testing ≈ 3-5 days full-time
       or 2-3 weeks part-time
```

---

## 💾 Database Schema

```
┌─────────────────────────┐
│     SHIPS TABLE         │
├──────────┬──────────────┤
│ id (PK)  │ INT AUTO    │
│ name     │ VARCHAR(100)│
│ size     │ ENUM(XL,L,M,S)│
│ arrivalDay │ INT        │
│ occupationDuration │ INT │
│ status   │ ENUM(Pending,Assigned,Departed) │
│ notes    │ VARCHAR(500)│
└─────────────────────────┘
         ↓ FK
┌─────────────────────────┐
│  ASSIGNMENTS TABLE      │
├──────────┬──────────────┤
│ id (PK)  │ INT AUTO    │
│ shipId   │ INT (FK)    │───→ SHIPS
│ berthId  │ INT (FK)    │───→ BERTHS
│ startDay │ INT         │
│ endDay   │ INT         │
└─────────────────────────┘

┌─────────────────────────┐
│    BERTHS TABLE         │
├──────────┬──────────────┤
│ id (PK)  │ INT AUTO    │
│ name     │ VARCHAR(20) │
│ size     │ ENUM(XL,L,M,S)│
└─────────────────────────┘
  (8 rows seeded)

┌──────────────────────────┐
│  SYSTEMSTATE TABLE       │
├──────────┬───────────────┤
│ id (PK)  │ INT           │
│ currentVirtualDay │ INT  │
│ lastUpdated │ TIMESTAMP  │
└──────────────────────────┘
  (1 row, updated by advance-day)
```

---

## ✅ Completion Checklist

### Phase 1: Integration Foundation
```
BACKEND PREPARATION
  ☐ api.js created & exported
  ☐ CORS configured in Program.cs
  ☐ Context API setup (Ships, CurrentDay)
  ☐ Error handling in api service
  ☐ Tested with Postman

FRONTEND SETUP
  ☐ Contexts wrapped in App.jsx
  ☐ OperatorePage imported from branch
  ☐ Navigation routes working
  ☐ No console errors
```

### Phase 2: Operator Functionality
```
OPERATORE PAGE
  ☐ Shows pending ships from API
  ☐ Form submits new ship to backend
  ☐ Loading state while saving
  ☐ Success notification after create
  ☐ New ship appears in list immediately
  ☐ Error handling for API failures
```

### Phase 3: Scheduler MVP
```
SCHEDULER PAGE
  ☐ Berth grid displays all 8 berths
  ☐ Pending ships list shows ships in "Pending" status
  ☐ Drag-and-drop works
  ☐ Drop calls POST /api/assignments
  ☐ Assignment created successfully
  ☐ Ship status changes to "Assigned"
  ☐ Ship moves from pending list
  ☐ Assigned ship appears in berth
```

### Phase 4: Time Management
```
NEXT DAY ACTION
  ☐ POST /api/advance-day endpoint works
  ☐ Current day increments by 1
  ☐ Ships with EndDay == CurrentDay change to "Departed"
  ☐ Departed ships disappear from views
  ☐ New pending ships appear if arrivalDay == currentDay
  ☐ UI updates without refresh
```

### Phase 5: Authentication (Optional MVP)
```
AUTH SYSTEM
  ☐ Login page created
  ☐ JWT token generation working
  ☐ Role-based access control
  ☐ Protected endpoints
  ☐ Token refresh logic
```

---

## 🐛 Known Issues & Tech Debt

```
CRITICAL (Affects MVP)
  ├─ ❌ api.js doesn't exist yet → Hussein needs to create
  ├─ ❌ Context API not setup → no global state
  ├─ ❌ SchedulerPage is stub → needs complete rewrite
  └─ ❌ No berth assignment logic → Hussein needs service

HIGH (Should fix soon)
  ├─ ⚠️ CORS not configured → errors on API calls
  ├─ ⚠️ SystemController/advance-day incomplete
  ├─ ⚠️ No error handling in frontend
  └─ ⚠️ OperatorePage not in workspace

MEDIUM (Nice to have)
  ├─ ℹ️ No loading skeletons
  ├─ ℹ️ No dark mode
  ├─ ℹ️ Tests not written
  └─ ℹ️ Swagger docs incomplete

LOW (Technical debt)
  ├─ 📝 Missing code comments
  ├─ 📝 Inconsistent naming
  └─ 📝 No logging
```

---

## 🎓 Key Technical Decisions

| Decision | Rationale | Implementation |
|----------|-----------|-----------------|
| Context API for state | Simpler than Redux for MVP | ShipsContext, CurrentDayContext |
| SQLite for development | No setup, local file-based | EF Core configuration |
| Axios for HTTP | Promise-based, interceptors | api.js wrapper |
| .NET 10 + ASP.NET Core | Type-safe, high performance | Current setup |
| React + Vite | Fast builds, modern ecosystem | Current setup |
| Virtual time model | Simpler than real-time | Int days only |

---

## 📞 Team Info

| Role | Name | GitHub | Primary Task |
|------|------|--------|--------------|
| Backend Lead | Hussein Sougrati | @hussnisougrati | API, Integration |
| Frontend UI | Mirko Di Vincenzo | @mirko | Operator UI |
| Frontend Scheduler | Paul (Bruno) | @bruneipotosi | Scheduler UI |
| Database | Salome | @salomembang | Schema Design |
| Coordinator | Ibrahim | @ibrahimdiallo | Merge/Integration |

---

## 📚 Useful Resources

- **Backend Docs:** `/docs/BACKEND_DOCS.md`
- **Project Spec:** `/docs/README.md`
- **API Endpoints:** Swagger at `https://localhost:5001/swagger` (after running backend)
- **Frontend Repo:** `./frontend/`
- **Database File:** `./Data/blueharbor.db` (SQLite)

---

## 🚀 Getting Started Today

### Step 1: Run Backend
```bash
cd "c:\Users\hussni.sougrati\Documents\AWS_Sushi_project"
dotnet run
# Runs on https://localhost:5001
# Swagger UI: https://localhost:5001/swagger
```

### Step 2: Run Frontend
```bash
cd frontend
npm install  # if needed
npm run dev
# Runs on http://localhost:5173
```

### Step 3: Test API
```bash
# GET all ships
curl https://localhost:5001/api/ships

# POST new ship (from MainPage role selector)
# Should return the created ship with ID
```

### Step 4: Check Frontend
- Open http://localhost:5173
- Click "Inizia Operazione" button
- Should navigate to SchedulerPage (currently shows stub)

---

## 🎯 Success Metrics

**MVP is complete when:**

✅ User can register a ship via OperatorePage  
✅ Ship appears in database  
✅ Scheduler can see pending ship in SchedulerPage  
✅ Scheduler can drag ship to berth  
✅ Ship status changes to "Assigned"  
✅ Scheduler can click "Next Day"  
✅ Day advances  
✅ Ship in departing window changes to "Departed"  
✅ All without errors or console warnings  
✅ No API failures on valid inputs  

---

```
╔════════════════════════════════════════════════════════════════════════════════╗
║                    Next Steps: Execute Sprint 1 TODAY                         ║
║              Get api.js & Context API done to unblock the team               ║
║                          Let's ship this MVP! 🚀                             ║
╚════════════════════════════════════════════════════════════════════════════════╝
```

**Document Created:** 17 Giugno 2026  
**Next Update:** After Sprint 1 completion  
**Version:** 1.0 - Initial Analysis
