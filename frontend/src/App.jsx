// src/App.jsx
import React, { useState, useEffect } from 'react';  // ← AGGIUNTO: useEffect
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import MainPage from './pages/MainPage';
import OperatorePages from './pages/OperatorePages';
import SchedulerPage from './pages/SchedulerPage';

function App() {
  // Stato globale
  const [currentDay, setCurrentDay] = useState(1);
  const [ships, setShips] = useState([]);

  // ← AGGIUNTO: Carica dati salvati all'avvio
  useEffect(() => {
    const savedShips = localStorage.getItem('blueharbor-ships');
    const savedDay = localStorage.getItem('blueharbor-day');
    if (savedShips) setShips(JSON.parse(savedShips));
    if (savedDay) setCurrentDay(parseInt(savedDay));
  }, []);

  // ← AGGIUNTO: Salva dati quando cambiano
  useEffect(() => {
    localStorage.setItem('blueharbor-ships', JSON.stringify(ships));
    localStorage.setItem('blueharbor-day', currentDay);
  }, [ships, currentDay]);

  // Funzione per avanzare il giorno
  const handleNextDay = () => {
    const newDay = currentDay + 1;
    setCurrentDay(newDay);
    
    // Aggiorna lo stato delle navi (Departed)
    setShips(prevShips => 
      prevShips.map(ship => {
        if (ship.status === 'Assigned' && ship.startDay + ship.occupationDuration <= newDay) {
          return { ...ship, status: 'Departed' };
        }
        return ship;
      })
    );
  };

  // ← AGGIUNTO: Funzione per resettare tutti i dati
  const handleReset = () => {
    if (confirm('Sei sicuro? Tutti i dati verranno cancellati!')) {
      setCurrentDay(1);
      setShips([]);
      localStorage.removeItem('blueharbor-ships');
      localStorage.removeItem('blueharbor-day');
    }
  };

  return (
    <Router>
      <div className="App">
        <Navbar 
          currentDay={currentDay} 
          onNextDay={handleNextDay}
          onReset={handleReset}  // ← AGGIUNTO: passa la funzione reset
        />
        
        <Routes>
          {/* MAIN PAGE - Prima schermata */}
          <Route 
            path="/" 
            element={<MainPage />} 
          />
          
          {/* OPERATORE */}
          <Route 
            path="/operatore" 
            element={
              <OperatorePages 
                currentDay={currentDay}
                ships={ships}
                setShips={setShips}
              />
            } 
          />
          
          {/* SCHEDULER */}
          <Route 
            path="/scheduler" 
            element={
              <SchedulerPage 
                currentDay={currentDay}
                ships={ships}
                setShips={setShips}
              />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;