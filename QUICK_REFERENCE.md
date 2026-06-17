# BlueHarbor - Quick Reference Guide

## 🎯 Project Overview
- **Status:** 24% Complete (MVP Framework Ready)
- **Team:** Hussein (Backend), Mirko (UI/Operator), Paul (Frontend/Scheduler), Salome (Database), Ibrahim (Integration)
- **Current Focus:** Frontend-Backend Integration
- **Est. Completion:** 5-7 giorni (full-time), 2-3 settimane (part-time)

---

## 📊 Branch Status Overview

### ✅ BACKEND (READY)
- **Current:** `ibrahimdiallo-cell-patch-1` (HEAD)
- **API Endpoints:** Ships CRUD, Assignments CRUD, System/Day
- **Database:** SQLite, 8 berths seeded, EF Core setup
- **Status:** Fully functional, ready for frontend integration

### 🟡 FRONTEND (PARTIAL)
- **Base:** `hussni/integration-local` or `origin/frontend/dev`
- **Completed:** MainPage UI, Navbar, OperatorePage (in branch)
- **Missing:** SchedulerPage, API integration, State management
- **Status:** Framework ready, needs implementation

### ⚠️ FEATURES STATUS
| Feature | Status | Location | Issue |
|---------|--------|----------|-------|
| Ship Registration API | ✅ | Backend | N/A |
| Ship Registration UI | ✅ | mirko/operatore | Not in workspace |
| Berth Assignment Logic | ❌ | Backend | Missing service |
| Scheduler Page UI | ❌ | paul/scheduler | Stub only |
| Frontend-API Integration | ❌ | api.js | Empty file |
| Next Day Logic | 🟡 | Backend | Endpoint exists, incomplete |
| Authentication | ❌ | N/A | Not started |

---

## 🚀 Critical Path (Ordered by Priority)

### Week 1
1. **Day 1-2:** Implement api.js and Context API
   - Connect frontend to backend
   - Create global state management
   
2. **Day 2-3:** Build SchedulerPage
   - Grid visualization
   - Drag-and-drop logic
   
3. **Day 3-4:** Implement Berth Assignment Service
   - Size compatibility check
   - Availability verification
   - Update ship status

4. **Day 4-5:** Complete Next Day functionality
   - Advance virtual day
   - Auto-update ship statuses

### Week 2 (If needed)
5. **Day 6:** Authentication system
6. **Day 7:** Testing & Polish

---

## 💡 Quick Commands

### Run Backend
```bash
cd "c:\Users\hussni.sougrati\Documents\AWS_Sushi_project"
dotnet run
# API available at: https://localhost:5001
# Swagger at: https://localhost:5001/swagger
```

### Run Frontend
```bash
cd "c:\Users\hussni.sougrati\Documents\AWS_Sushi_project\frontend"
npm run dev
# Available at: http://localhost:5173
```

### Check Branch Status
```bash
git branch -v -a
git log --all --oneline --graph -20
```

### Pull Latest Frontend
```bash
# To get OperatorePage from Mirko's branch:
git checkout origin/mirko/operatore -- frontend/src/pages/OperatorePages.jsx frontend/src/pages/OperatorePages.scss
```

---

## 📋 File Locations

### Backend Core Files
```
/Program.cs                                    - ASP.NET Core configuration
/Data/AppDbContext.cs                          - EF Core context & seeding
/Models/Ship.cs, Berth.cs, Assignment.cs      - Domain models
/Controllers/ShipsController.cs                - Ships API endpoints
/Controllers/AssignmentsController.cs          - Assignments API endpoints
/Controllers/SystemController.cs               - System/Day endpoints
```

### Frontend Core Files
```
/frontend/src/App.jsx                          - Main app component
/frontend/src/pages/MainPage.jsx               - Landing page
/frontend/src/pages/SchedulerPage.jsx          - Scheduler (NEEDS WORK)
/frontend/src/components/Navbar.jsx            - Navigation
/frontend/src/api/api.js                       - API service (NEEDS WORK)
```

### Branch-Specific Features
```
mirko/operatore
├── OperatorePages.jsx                         - Ship registration UI
├── OperatorePages.scss                        - Styling
└── Navbar.scss                                - Navigation styling

paul/sistemare-nav-bar-e-mainpage
├── MainPage hero section                      - Landing page design
└── Responsive improvements

paul/scheduler
└── SchedulerPage routing                      - Needs implementation
```

---

## 🔗 Integration Checklist

- [ ] **Immediate:** Import OperatorePage from mirko/operatore to workspace
- [ ] **Today:** Create api.js with axios client
- [ ] **Today:** Setup Context API providers
- [ ] **Tomorrow:** Connect OperatorePage to API
- [ ] **Tomorrow:** Update SchedulerPage with grid layout
- [ ] **2 Days:** Implement berth assignment logic in backend
- [ ] **2 Days:** Connect SchedulerPage to assignment API
- [ ] **3 Days:** Implement Next Day functionality

---

## ⚠️ Known Issues & Gaps

1. **Frontend State:** No global state management
2. **API Integration:** api.js is empty (just comments)
3. **OperatorePage:** Not in current workspace (in mirko/operatore branch)
4. **SchedulerPage:** Just a stub component
5. **Assignment Logic:** Missing berth assignment service
6. **Authentication:** Not implemented
7. **CORS:** May need configuration for Vite dev server
8. **Error Handling:** Minimal in frontend

---

## 📚 Documentation

- `BACKEND_DOCS.md` - Backend API documentation (in progress)
- `BLUEHARBOR_PROJECT_STATUS_REPORT.md` - Comprehensive status report (this document)
- `docs/README.md` - Project overview

---

## 👥 Team Responsibilities

| Team Member | Primary Role | Next Task |
|------------|--------------|-----------|
| **Hussein** | Backend, Integration | Implement api.js & Context API |
| **Mirko** | Frontend UI, Operator | Integrate OperatorePage, connect to API |
| **Paul** | Frontend, Scheduler | Build SchedulerPage UI & logic |
| **Salome** | Database Design | Review DB schema alignment |
| **Ibrahim** | Coordinator | Support integration efforts |

---

## 🎓 Project Spec Reference

**Core Requirements:**
- ✅ 2 Roles: Operatore, Scheduler
- ✅ Ship states: Pending, Assigned, Departed
- ✅ 8 Berths: 1 XL, 1 L, 2 M, 4 S (fixed size compatibility)
- ✅ Random ship data: Size, ArrivalDay (0-30), OccupationDuration (3-15)
- 🔄 Berth assignment with compatibility checks
- 🔄 "Next Day" action with auto-status updates
- ❌ Authentication system
- ❌ Virtual time model (days only)

---

**Last Updated:** 17 Giugno 2026  
**Next Review:** After Phase 1 integration
