// src/pages/OperatorePages.jsx
import { useState, useEffect, useCallback } from "react";
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

  const loadShips = useCallback(async () => {
    try {
      const data = await getShips();
      setShips(data);
    } catch (err) {
      console.error('Errore caricamento navi:', err);
    }
  }, [setShips]);

  useEffect(() => {
    loadShips();
  }, [loadShips]);

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

      {/* SECTION HEADER - Stile Scheduler */}
      <div className="section-header">
        <div>
          <div className="section-eyebrow">AREA OPERATORE</div>
          <h1 className="section-title">
            Registro Navi
            <span className="section-pulse" />
          </h1>
        </div>
        <div className="stats-container">
          <div className="stat-box">
            <div className="stat-label">Totale navi</div>
            <div className="stat-value">{ships.length}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">In attesa</div>
            <div className="stat-value stat-value-pending">{pending.length}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Assegnate</div>
            <div className="stat-value stat-value-assigned">{assigned.length}</div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Partite</div>
            <div className="stat-value stat-value-departed">{departed.length}</div>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="operatore-layout">

        {/* FORM CARD */}
        <div className="form-card">
          <h3>Registra nuova nave</h3>

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

          

          <button
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            className="btn-submit"
          >
            {loading ? "Registrazione..." : "Registra nave"}
          </button>
        </div>

        {/* SHIPS LIST */}
        <div className="ships-card">
          <div className="ships-card-header">
            <h3>Registro navi</h3>
            
          </div>

          {ships.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🚢</span>
              <p>Nessuna nave registrata.<br/>Usa il form per aggiungerne una.</p>
            </div>
          ) : (
            <div className="ships-list">
              {ships.map(ship => (
                <div className="ship-card" key={ship.id}>
                  <div className="ship-main">
                    <span className="ship-name">{ship.name}</span>
                    <span className="ship-chip">{ship.size}</span>
                    <span className={`ship-status status-${ship.status.toLowerCase()}`}>
                      {ship.status}
                    </span>
                  </div>
                  <div className="ship-details">
                    <span>Arrivo: Gg {ship.arrivalDay}</span>
                    <span>•</span>
                    <span>Durata: {ship.occupationDuration} giorni</span>
                    {ship.notes && (
                      <>
                        <span>•</span>
                        <span className="ship-notes">{ship.notes}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}