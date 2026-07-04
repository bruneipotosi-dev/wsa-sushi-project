// src/components/Navbar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import mscLogo from '../assets/msc-logo.png';
import './Navbar.scss';

const NAV_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/operatore', label: 'Operatore' },
  { to: '/scheduler', label: 'Scheduler' },
];

const Navbar = ({ currentDay, onNextDay, onReset }) => {
  const location = useLocation();

  // La navbar operativa non appare nella home — solo quando si è
  // dentro un ruolo (Operatore o Scheduler)
  if (location.pathname === '/') {
    return null;
  }

  return (
    <header className="bh-header">
      <div className="bh-left">
        <div className="bh-brand">
          <img src={mscLogo} alt="MSC" className="bh-logo" />
          <span className="bh-divider" />
          <div className="bh-title">
            BlueHarbor<span>Terminal</span>
          </div>
        </div>

        <div className="bh-day-pill">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
          <span className="bh-day-label">Giorno</span>
          <span className="bh-day-num">{currentDay}</span>
        </div>
      </div>

      <nav className="bh-links">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`bh-link ${location.pathname === item.to ? 'bh-link--active' : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="bh-right">
        <div className="bh-status">
          <span className="bh-status-dot" />
          <span className="bh-status-text">Online</span>
        </div>
        <button className="bh-btn-primary" onClick={onNextDay}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#161616" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
          Next Day
        </button>
        <button className="bh-btn-icon" onClick={onReset}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />
          </svg>
          Reset
        </button>
      </div>
    </header>
  );
};

export default Navbar;