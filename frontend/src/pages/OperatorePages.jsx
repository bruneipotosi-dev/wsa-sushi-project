// src/pages/OperatorePages.jsx
import { useState, useEffect } from "react";
import { createShip, getShips } from "../services/api";
import "./OperatorePages.scss";

function generateShipData(currentDay) {
  const sizes = ["XL", "L", "M", "S"];
  return {
    size: sizes[Math.floor(Math.random() * sizes.length)],
    arrivalDay: (currentDay || 1) + Math.floor(Math.random() * 31),
    occupationDuration: Math.floor(Math.random() * 13) + 3
  };
}

export default function OperatorePage({ ships, setShips, currentDay }) {
  const [name, setName]       = useState("");
  const [notes, setNotes]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(null);

  const loadShips = async () => {
    try {
      const data = await getShips();
      setShips(data);
    } catch (err) {
      console.error('Errore caricamento navi:', err);
    }
  };

  useEffect(() => {
    loadShips();
  }, []);

  const pending  = ships.filter(s => s.status === "Pending");
  const assigned = ships.filter(s => s.status === "Assigned");
  const departed = ships.filter(s => s.status === "Departed");

  async function handleSubmit() {
    if (!name.trim()) {
      setError("Il nome della nave è obbligatorio.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const generated = generateShipData(currentDay);
      await createShip({
        name: name.trim(),
        notes: notes.trim(),
        status: "Pending",
        ...generated
      });
      await loadShips();
      setSuccess(`"${name.trim()}" registrata — taglia ${generated.size}, arrivo giorno ${generated.arrivalDay}`);
      setName("");
      setNotes("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="operatore-page">

      <div className="operatore-header">
        <h2>⚓ Area Operatore</h2>
        <p>Registra le navi in arrivo al terminal BlueHarbor</p>
      </div>

      <div className="stats-bar">
        <div className="stat">
          <span className="stat-icon">🚢</span>
          <div className="stat-info">
            <span className="stat-number">{ships.length}</span>
            <span className="stat-label">Totale navi</span>
          </div>
        </div>
        <div className="stat pending">
          <span className="stat-icon">⏳</span>
          <div className="stat-info">
            <span className="stat-number">{pending.length}</span>
            <span className="stat-label">In attesa</span>
          </div>
        </div>
        <div className="stat assigned">
          <span className="stat-icon">⚓</span>
          <div className="stat-info">
            <span className="stat-number">{assigned.length}</span>
            <span className="stat-label">Assegnate</span>
          </div>
        </div>
        <div className="stat departed">
          <span className="stat-icon">✅</span>
          <div className="stat-info">
            <span className="stat-number">{departed.length}</span>
            <span className="stat-label">Partite</span>
          </div>
        </div>
      </div>

      <div className="operatore-layout">

        <div className="form-card">
          <h3>📝 Registra nuova nave</h3>

          {error   && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="form-group">
            <label>Nome nave *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="es. MSC Aurora"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Note operative</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Carico, provenienza, istruzioni..."
              disabled={loading}
              rows={4}
            />
          </div>

          <p className="form-hint">
            Taglia, giorno di arrivo e durata vengono assegnati automaticamente dal sistema.
          </p>

          <button
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            className="btn-submit"
          >
            {loading ? "Registrazione..." : "🚢 Registra nave"}
          </button>
        </div>

        <div className="ships-card">
          <div className="ships-card-header">
            <h3>Registro navi</h3>
            <span className="ships-count">{ships.length} navi totali</span>
          </div>

          {ships.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🚢</span>
              <p>Nessuna nave registrata.<br/>Usa il form per aggiungerne una.</p>
            </div>
          ) : (
            <table className="ships-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Taglia</th>
                  <th>Arrivo</th>
                  <th>Durata</th>
                  <th>Stato</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {ships.map(ship => (
                  <tr key={ship.id}>
                    <td className="ship-name">{ship.name}</td>
                    <td>
                      <span className={`size-badge size-${ship.size.toLowerCase()}`}>
                        {ship.size}
                      </span>
                    </td>
                    <td>Gg {ship.arrivalDay}</td>
                    <td>{ship.occupationDuration} giorni</td>
                    <td>
                      <span className={`status-badge status-${ship.status.toLowerCase()}`}>
                        {ship.status}
                      </span>
                    </td>
                    <td className="ship-notes">{ship.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}