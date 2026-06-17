# BlueHarbor - Team SAL & Action Items

## 📊 SAL Table (Status At Launch) - Detailed View

### Hussein Sougrati - Backend & Integration
**Branches:** `hussni/integration-local`, `hussni/ships`

| Category | Status |
|----------|--------|
| **Completed Tasks** | ✅ Backend API (ShipsController, AssignmentsController) ✅ Database setup (SQLite + EF Core) ✅ Models with validations ✅ Berth seeding (8 berths) ✅ GET/POST Ships endpoints ✅ GET/POST Assignments endpoints ✅ System/Day endpoint ✅ ShipService implementation (in branch) |
| **Completion %** | 45% |
| **What's Missing** | ❌ Berth assignment business logic ❌ Ship status lifecycle automation ❌ Advanced day functionality (partial) ❌ Frontend API integration (api.js) ❌ CORS setup for Vite ❌ Authentication endpoints |
| **Next Priority** | 1. Implement api.js with axios client 2. Create AssignmentService for berth assignment logic 3. Setup Context API providers 4. Implement complete advance-day endpoint |
| **Blocker Issues** | None - ready to proceed |
| **Files to Review** | - /Program.cs (CORS setup needed) - /Controllers/AssignmentsController.cs (add assignment logic) - /Services/ (create AssignmentService) |

**Estimated Effort:** 3-4 days (api.js + service + testing)

---

### Mirko Di Vincenzo - Frontend UI & Operator Page
**Branch:** `origin/mirko/operatore`

| Category | Status |
|----------|--------|
| **Completed Tasks** | ✅ OperatorePage component ✅ Ship registration form ✅ Navbar component with styling ✅ Statistics display (total, pending, assigned, departed) ✅ Random ship data generation (size, arrival, duration) ✅ Form validation ✅ SCSS styling |
| **Completion %** | 25% (UI only, no backend) |
| **What's Missing** | ❌ Backend integration (API calls) ❌ Database persistence ❌ Data fetching on mount ❌ Loading/error states ❌ Success notifications ❌ Form reset after submission |
| **Next Priority** | 1. Import latest api.js from Hussein 2. Use useContext for ShipsContext 3. Add useEffect to fetch ships 4. Connect form submit to API POST 5. Add loading & error handling |
| **Blocker Issues** | Depends on Hussein's api.js implementation |
| **Files to Review** | - /frontend/src/pages/OperatorePages.jsx (add API calls) - /frontend/src/pages/OperatorePages.scss (styling complete) |

**Note:** This component needs to be imported into the main workspace from mirko/operatore branch  
**Estimated Effort:** 2 days (once api.js ready)

---

### Paul (Bruno Potosi) - Frontend & Scheduler
**Branches:** `origin/paul/frontend`, `origin/paul/sistemare-nav-bar-e-mainpage`, `paul/scheduler`

| Category | Status |
|----------|--------|
| **Completed Tasks** | ✅ MainPage hero section ✅ Navigation bar ✅ Layout & responsive design ✅ Static stat cards ✅ SchedulerPage routing ✅ CSS consolidation |
| **Completion %** | 30% (UI framework, no logic) |
| **What's Missing** | ❌ SchedulerPage implementation (CRITICAL - currently just shows "Scheduler Page") ❌ Berth grid visualization ❌ Ship list display ❌ Drag-and-drop functionality ❌ Assignment creation UI ❌ Dynamic data binding ❌ Loading states |
| **Next Priority** | 1. Create berth grid layout (CSS Grid) 2. Fetch pending ships from API 3. Implement drag-and-drop 4. Add assignment form 5. Connect to AssignmentService API |
| **Blocker Issues** | Blocked by: 1) Hussein's api.js 2) Hussein's AssignmentService endpoint |
| **Files to Review** | - /frontend/src/pages/SchedulerPage.jsx (add implementation) - /frontend/src/App.jsx (routing setup looks OK) |

**CRITICAL:** SchedulerPage is the core feature - this is highest priority after integration  
**Estimated Effort:** 4-5 days (UI + logic)

---

### Salome - Database Design
**Branch:** `origin/salomembangmbang-dev-patch-1`

| Category | Status |
|----------|--------|
| **Completed Tasks** | ✅ Database schema design ✅ SQL creation scripts ✅ SQL insertion scripts ✅ Database documentation ✅ Berth table design |
| **Completion %** | 15% (design only, implementation is in EF Core) |
| **What's Missing** | ❌ Integration with current EF Core setup ❌ Migration validation ❌ SQL scripts versioning ❌ Performance indexes ❌ Backup procedures |
| **Next Priority** | 1. Review EF Core schema in AppDbContext 2. Validate mapping against SQL design 3. Create database diagram doc 4. Add migration comments |
| **Blocker Issues** | None - documentation phase |
| **Files to Review** | - /Data/AppDbContext.cs (review migration setup) - SQL scripts in branch (archive or document) |

**Note:** EF Core is handling the DB now, SQL scripts may be used for reference only  
**Estimated Effort:** 1 day (documentation)

---

### Ibrahim Diallo - Integration & Current HEAD
**Branch:** `ibrahimdiallo-cell-patch-1` (HEAD)

| Category | Status |
|----------|--------|
| **Completed Tasks** | ✅ Merged backend API files to workspace ✅ Setup current HEAD with working backend ✅ Database creation |
| **Completion %** | 5% (merge only) |
| **What's Missing** | ❌ Everything else that depends on backend |
| **Next Priority** | 1. Support integration efforts 2. Coordinate branch merges 3. Verify no conflicts 4. Help with CORS setup |
| **Blocker Issues** | None |
| **Files to Review** | - Current workspace structure (baseline) |

**Note:** Good merge work - backend is usable  
**Estimated Effort:** As-needed support

---

## 🎯 Team Action Items (Prioritized)

### IMMEDIATE (Today/Tomorrow)

#### [HUSSNI] - Create api.js HTTP Client
**Effort:** 2-3 hours  
**Impact:** Unblocks Mirko and Paul

```javascript
// frontend/src/api/api.js - Template
import axios from 'axios';

const API_BASE_URL = 'https://localhost:5001/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

export const shipAPI = {
  getAll: () => client.get('/ships'),
  getById: (id) => client.get(`/ships/${id}`),
  create: (ship) => client.post('/ships', ship)
};

export const assignmentAPI = {
  getAll: () => client.get('/assignments'),
  create: (assignment) => client.post('/assignments', assignment)
};

export const systemAPI = {
  getCurrentDay: () => client.get('/day'),
  advanceDay: () => client.post('/advance-day')
};
```

**Deliverable:** api.js with all required endpoints  
**PR:** frontend/api-integration

---

#### [HUSSNI] - Setup CORS for Vite Frontend
**Effort:** 30 minutes  
**Impact:** Unblocks API calls

```csharp
// Program.cs - Add before app.Build()
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowVite", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// After var app = builder.Build();
app.UseCors("AllowVite");
```

**Deliverable:** CORS configured  
**PR:** backend/cors-setup

---

#### [HUSSNI] - Create Context API State Management
**Effort:** 2-3 hours  
**Impact:** Unblocks UI binding

```javascript
// frontend/src/contexts/ShipsContext.jsx - Template
import React, { createContext, useState, useEffect } from 'react';
import { shipAPI } from '../api/api';

export const ShipsContext = createContext();

export function ShipsProvider({ children }) {
  const [ships, setShips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchShips();
  }, []);

  const fetchShips = async () => {
    try {
      setLoading(true);
      const { data } = await shipAPI.getAll();
      setShips(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addShip = async (newShip) => {
    const { data } = await shipAPI.create(newShip);
    setShips([...ships, data]);
    return data;
  };

  return (
    <ShipsContext.Provider value={{ ships, loading, error, addShip, refetch: fetchShips }}>
      {children}
    </ShipsContext.Provider>
  );
}
```

**Deliverable:** ShipsContext, CurrentDayContext, providers  
**PR:** frontend/state-management

---

### PRIORITY 1 (Next 2 Days)

#### [MIRKO] - Update OperatorePage to Use API
**Effort:** 4 hours  
**Depends on:** Hussein's api.js  

- Import from ShipsContext
- Add useEffect to fetch initial ships
- Connect form submit to API
- Add loading/error states
- Add success toast notification

**Deliverable:** OperatorePage connected to backend  
**PR:** frontend/operatore-api-integration

---

#### [PAUL] - Create SchedulerPage Grid Layout
**Effort:** 3-4 hours  
**Depends on:** Hussein's api.js

```jsx
// Template structure:
<div className="scheduler-container">
  <div className="berths-grid">
    {/* 1 XL, 1 L, 2 M, 4 S berths */}
    {berths.map(berth => (
      <BerthCard key={berth.id} berth={berth} />
    ))}
  </div>
  <div className="pending-ships-list">
    {/* Draggable ship cards */}
  </div>
</div>
```

**Deliverable:** SchedulerPage with grid layout, pending ships list  
**PR:** frontend/scheduler-ui

---

### PRIORITY 2 (Days 3-4)

#### [HUSSNI] - Create AssignmentService (Backend)
**Effort:** 4-5 hours  
**Impact:** Enables scheduler functionality

```csharp
// Backend/Services/AssignmentService.cs - Template
public class AssignmentService
{
    public async Task<Assignment> AssignShipToBerthAsync(int shipId, int berthId)
    {
        // 1. Verify ship exists
        // 2. Verify berth exists
        // 3. Verify size compatibility
        // 4. Find first free day for berth
        // 5. Calculate EndDay
        // 6. Check no overlap
        // 7. Create assignment
        // 8. Update ship status to "Assigned"
        // 9. Return assignment
    }
}
```

**Deliverable:** AssignmentService with business logic  
**PR:** backend/assignment-service

---

#### [PAUL] - Add Drag-and-Drop to SchedulerPage
**Effort:** 4-5 hours  
**Depends on:** Hussein's AssignmentService endpoint

Use react-dnd or native drag-drop API

**Deliverable:** Drag-and-drop working, calls POST /api/assignments  
**PR:** frontend/scheduler-drag-drop

---

### PRIORITY 3 (Day 5)

#### [HUSSNI] - Complete advance-day Endpoint
**Effort:** 2-3 hours

- Implement day increment
- Auto-update departed ships
- Return new day + affected ships

**Deliverable:** POST /api/advance-day fully functional  
**PR:** backend/advance-day-complete

---

#### [PAUL] - Add "Next Day" Button & Logic
**Effort:** 1-2 hours

**Deliverable:** Button calls advance-day, UI updates  
**PR:** frontend/next-day-action

---

## 📋 Integration Checklist

### Phase 1: Foundation (Days 1-2)
- [ ] Hussein: Create api.js
- [ ] Hussein: Setup CORS
- [ ] Hussein: Create Context API
- [ ] Mirko: Import OperatorePage to workspace
- [ ] Merge integration-local to main branch

### Phase 2: Operator Functionality (Day 2-3)
- [ ] Mirko: Update OperatorePage with API calls
- [ ] Test ship creation end-to-end
- [ ] Verify data persists in database

### Phase 3: Scheduler MVP (Day 3-4)
- [ ] Paul: Create SchedulerPage grid
- [ ] Hussein: Implement AssignmentService
- [ ] Paul: Add drag-and-drop
- [ ] Test assignment end-to-end

### Phase 4: Time Management (Day 5)
- [ ] Hussein: Complete advance-day
- [ ] Paul: Add Next Day button
- [ ] Test day advancement & auto-updates

### Phase 5: Polish (Days 6-7)
- [ ] Add error boundaries
- [ ] Add loading skeletons
- [ ] Test edge cases
- [ ] Documentation

---

## ⚠️ Potential Blockers & Mitigations

| Blocker | Probability | Mitigation |
|---------|------------|-----------|
| CORS issues | Medium | Test with Postman first, check error logs |
| State management complexity | Low | Use simple Context API, avoid Redux |
| Drag-drop library choice | Low | React-dnd well-established, or native API |
| Database migration issues | Low | Run migrations in development first |
| Frontend build errors | Medium | Clear node_modules, reinstall packages |

---

## 📞 Communication Plan

- **Daily standup:** 15 min (review blockers)
- **PR reviews:** Peer review before merge
- **Integration tests:** Run full flow before major commits
- **Documentation:** Update docs as features complete

---

**Last Updated:** 17 Giugno 2026  
**Target Completion:** 24 Giugno 2026 (7 giorni)
