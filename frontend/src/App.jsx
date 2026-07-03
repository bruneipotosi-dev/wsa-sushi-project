import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import MainPage from './pages/MainPage';
import OperatorePages from './pages/OperatorePages';
import SchedulerPage from './pages/SchedulerPage';
import { getCurrentDay, advanceDay, resetSystem } from './services/api';

function App() {
  const [currentDay, setCurrentDay] = useState(1);
  const [ships, setShips] = useState([]);

  // Carica currentDay dal backend all'avvio
  useEffect(() => {
    getCurrentDay()
      .then(res => setCurrentDay(res.currentDay))
      .catch(console.error);
  }, []);

  // Next Day chiama il backend — non più stato locale
  const handleNextDay = async () => {
    try {
      const res = await advanceDay();
      setCurrentDay(res.newDay);
    } catch (err) {
      console.error('Errore advance-day:', err);
    }
  };

  const handleReset = async () => {
    if (confirm('Sei sicuro? Tutti i dati verranno cancellati!')) {
      try {
        await resetSystem();
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
        />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/operatore" element={
            <OperatorePages currentDay={currentDay} ships={ships} setShips={setShips} />
          } />
          <Route path="/scheduler" element={
            <SchedulerPage currentDay={currentDay} ships={ships} setShips={setShips} />
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;