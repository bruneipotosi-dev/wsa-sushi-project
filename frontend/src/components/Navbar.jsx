// src/components/Navbar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.scss';

const Navbar = ({ currentDay, onNextDay, onReset }) => {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>BlueHarbor Terminal</h1>
        <div className="current-day">
          Giorno corrente: <strong>{currentDay}</strong>
        </div>
      </div>
      <div className="navbar-links">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          Home
        </Link>
        <Link to="/operatore" className={location.pathname === '/operatore' ? 'active' : ''}>
          Operatore
        </Link>
        <Link to="/scheduler" className={location.pathname === '/scheduler' ? 'active' : ''}>
          Scheduler
        </Link>
      </div>
      <div className="navbar-actions">
        <button onClick={onNextDay} className="next-day-button">
          ➡️ Next Day
        </button>
        <button onClick={onReset} className="reset-button">
          🔄 Reset
        </button>
      </div>
    </nav>
  );
};

export default Navbar;