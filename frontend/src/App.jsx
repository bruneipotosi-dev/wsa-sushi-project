import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import MainPage from './pages/MainPage';
import OperatorePages from './pages/OperatorePages';
import SchedulerPage from './pages/SchedulerPage';
import AccessDenied from './components/AccessDenied';
import { getCurrentDay, advanceDay, resetSystem } from './services/api';

const ROLE_STORAGE_KEY = 'blueharbor-role';

function ProtectedRoute({ role, userRole, children }) {
  if (!userRole) {
    return <Navigate to="/" replace />;
  }

  if (userRole !== role) {
    return <AccessDenied role={role} />;
  }

  return children;
}

function App() {
  const [currentDay, setCurrentDay] = useState(1);
  const [ships, setShips] = useState([]);
  const [userRole, setUserRole] = useState(() => localStorage.getItem(ROLE_STORAGE_KEY));

  // Carica currentDay dal backend all'avvio
  useEffect(() => {
    getCurrentDay()
      .then(res => setCurrentDay(res.currentDay))
      .catch(console.error);
  }, []);

  const handleRoleSelect = (role) => {
    if (role) {
      localStorage.setItem(ROLE_STORAGE_KEY, role);
    } else {
      localStorage.removeItem(ROLE_STORAGE_KEY);
    }
    setUserRole(role);
  };

  // Next Day chiama il backend — non più stato locale
  const handleNextDay = async () => {
    try {
      const res = await advanceDay();
      setCurrentDay(res.newDay);
      if (res.warning) {
        console.warn(res.warning);
      }
    } catch (err) {
      console.error('Errore advance-day:', err);
    }
  };

  const handleReset = async () => {
    if (confirm('Sei sicuro? Tutti i dati verranno cancellati!')) {
      try {
        await resetSystem();
        handleRoleSelect(null);
        window.location.reload();
      } catch (err) {
        console.error('Errore reset:', err);
      }
    }
  };

  return (
    <Router>
      <div className="App">
        <Navbar
          currentDay={currentDay}
          onNextDay={handleNextDay}
          onReset={handleReset}
          userRole={userRole}
        />
        <Routes>
          <Route path="/" element={<MainPage onRoleSelect={handleRoleSelect} />} />
          <Route path="/operatore" element={
            <ProtectedRoute role="Operatore" userRole={userRole}>
              <OperatorePages currentDay={currentDay} ships={ships} setShips={setShips} />
            </ProtectedRoute>
          } />
          <Route path="/scheduler" element={
            <ProtectedRoute role="Scheduler" userRole={userRole}>
              <SchedulerPage currentDay={currentDay} ships={ships} setShips={setShips} />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;