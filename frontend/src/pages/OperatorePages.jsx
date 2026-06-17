// src/pages/OperatorePages.jsx
// src/pages/OperatorePages.jsx
import React, { useState } from 'react';
import './OperatorePages.scss';   

const OperatorePages = ({ currentDay, ships, setShips }) => {
  const [newShip, setNewShip] = useState({
    name: '',
    notes: '',
  });

  // Statistiche
  const stats = {
    totalShips: ships.length,
    pendingShips: ships.filter(s => s.status === 'Pending').length,
    assignedShips: ships.filter(s => s.status === 'Assigned').length,
    departedShips: ships.filter(s => s.status === 'Departed').length,
  };

  // Funzioni per generare dati casuali
  const getRandomSize = () => {
    const sizes = ['XL', 'L', 'M', 'S'];
    return sizes[Math.floor(Math.random() * sizes.length)];
  };

  const getRandomArrivalDay = (currentDay) => {
    const offset = Math.floor(Math.random() * 31);
    return currentDay + offset;
  };

  const getRandomDuration = () => {
    return Math.floor(Math.random() * 13) + 3;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewShip((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newShip.name.trim()) {
      alert('Il nome della nave è obbligatorio');
      return;
    }

    const newShipEntry = {
      id: Date.now(),
      name: newShip.name,
      notes: newShip.notes,
      size: getRandomSize(),
      arrivalDay: getRandomArrivalDay(currentDay),
      occupationDuration: getRandomDuration(),
      status: 'Pending',
      assignedBerth: null,
      startDay: null,
    };

    setShips((prevShips) => [...prevShips, newShipEntry]);
    setNewShip({ name: '', notes: '' });
  };

  return (
    <div className="operatore-container">
      {/* Header con titolo e descrizione */}
      <div className="page-header">
        <h2>Area Operatore</h2>
        <p>Registra e gestisci le navi nel sistema portuale</p>
      </div>

      {/* Card delle statistiche */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🚢</div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalShips}</span>
            <span className="stat-label">NAVI REGISTRATE</span>
          </div>
        </div>
        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <span className="stat-value">{stats.pendingShips}</span>
            <span className="stat-label">NAVI IN ATTESA</span>
          </div>
        </div>
        <div className="stat-card assigned">
          <div className="stat-icon">⚓</div>
          <div className="stat-info">
            <span className="stat-value">{stats.assignedShips}</span>
            <span className="stat-label">NAVI ASSEGNATE</span>
          </div>
        </div>
        <div className="stat-card departed">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <span className="stat-value">{stats.departedShips}</span>
            <span className="stat-label">NAVI PARTITE</span>
          </div>
        </div>
      </div>

      {/* Form di registrazione */}
      <div className="form-card">
        <h3>📝 Registra Nuova Nave</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome Nave *</label>
            <input
              type="text"
              name="name"
              value={newShip.name}
              onChange={handleInputChange}
              placeholder="Es. Ever Given, MSC Beatrice..."
              required
            />
          </div>
          <div className="form-group">
            <label>Note (opzionali)</label>
            <textarea
              name="notes"
              value={newShip.notes}
              onChange={handleInputChange}
              placeholder="Note operative, carico, provenienza..."
              rows="3"
            />
          </div>
          <button type="submit" className="submit-btn">
            🚢 Registra Nave
          </button>
        </form>
      </div>

      {/* Tabella navi registrate */}
      <div className="ships-section">
        <h3>📋 Navi Registrate</h3>
        <div className="table-wrapper">
          <table className="ships-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Dimensione</th>
                <th>Arrivo</th>
                <th>Durata</th>
                <th>Stato</th>
                <th>Banchina</th>
                <th>Inizio</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {ships.map((ship) => (
                <tr key={ship.id}>
                  <td>{ship.id}</td>
                  <td className="ship-name">{ship.name}</td>
                  <td>
                    <span className={`size-badge size-${ship.size.toLowerCase()}`}>
                      {ship.size}
                    </span>
                  </td>
                  <td>Giorno {ship.arrivalDay}</td>
                  <td>{ship.occupationDuration} gg</td>
                  <td>
                    <span className={`status-badge status-${ship.status.toLowerCase()}`}>
                      {ship.status}
                    </span>
                  </td>
                  <td>{ship.assignedBerth || '—'}</td>
                  <td>{ship.startDay ? `Giorno ${ship.startDay}` : '—'}</td>
                  <td className="ship-notes">{ship.notes || '—'}</td>
                </tr>
              ))}
              {ships.length === 0 && (
                <tr>
                  <td colSpan="9" className="no-data">
                    <div className="empty-state">
                      <span>🚢</span>
                      <p>Nessuna nave registrata</p>
                      <small>Utilizza il form sopra per registrare la prima nave</small>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OperatorePages;