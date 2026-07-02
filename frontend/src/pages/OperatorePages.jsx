// src/pages/OperatorePages.jsx
import { useState } from "react";
import "./OperatorePages.scss";

// Genera valori casuali per la nave (il frontend li genera, il backend li validerà)
function generateShipData() {
  const sizes = ["XL", "L", "M", "S"];
  return {
    size: sizes[Math.floor(Math.random() * sizes.length)],
    arrivalDay: Math.floor(Math.random() * 31),           // 0–30
    occupationDuration: Math.floor(Math.random() * 13) + 3 // 3–15
  };
}

export default function OperatorePage({ ships, setShips }) {
  const [name, setName]       = useState("");
  const [notes, setNotes]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [success, setSuccess] = useState(null);

  // Filtra per stato
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
      // FASE A: salva in mock locale (ma ora usando lo stato globale di App.jsx)
      const generated = generateShipData();
      const newShip = {
        id: Date.now(),
        name: name.trim(),
        notes: notes.trim(),
        status: "Pending",
        ...generated
      };

      // ⬇️ Questo è il punto chiave: usa setShips ricevuto da App.jsx
      setShips(prev => [...prev, newShip]);

      setSuccess(`Nave "${newShip.name}" registrata! Dimensione: ${newShip.size}`);
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

      {/* Header statistiche */}
      <div className="stats-bar">
        <div className="stat">
          <span className="stat-number">{ships.length}</span>
          <span className="stat-label">Totale</span>
        </div>
        <div className="stat pending">
          <span className="stat-number">{pending.length}</span>
          <span className="stat-label">In attesa</span>
        </div>
        <div className="stat assigned">
          <span className="stat-number">{assigned.length}</span>
          <span className="stat-label">Assegnate</span>
        </div>
        <div className="stat departed">
          <span className="stat-number">{departed.length}</span>
          <span className="stat-label">Partite</span>
        </div>
      </div>

      {/* Form registrazione nave */}
      <div className="form-section">
        <h2>Registra Nuova Nave</h2>

        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="form-group">
          <label>Nome Nave *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="es. MSC Aurora"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Note (opzionale)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Informazioni aggiuntive..."
            disabled={loading}
            rows={3}
          />
        </div>

        <p className="form-hint">
          Dimensione, giorno di arrivo e durata vengono generati automaticamente dal sistema.
        </p>

        <button
          onClick={handleSubmit}
          disabled={loading || !name.trim()}
          className="btn-primary"
        >
          {loading ? "Registrazione in corso..." : "Registra Nave"}
        </button>
      </div>

      {/* Lista navi per stato */}
      <div className="ships-section">

        <div className="ships-group">
          <h3>🟡 In Attesa ({pending.length})</h3>
          {pending.length === 0
            ? <p className="empty">Nessuna nave in attesa</p>
            : pending.map(ship => <ShipCard key={ship.id} ship={ship} />)
          }
        </div>

        <div className="ships-group">
          <h3>🟢 Assegnate ({assigned.length})</h3>
          {assigned.length === 0
            ? <p className="empty">Nessuna nave assegnata</p>
            : assigned.map(ship => <ShipCard key={ship.id} ship={ship} />)
          }
        </div>

        <div className="ships-group">
          <h3>⚫ Partite ({departed.length})</h3>
          {departed.length === 0
            ? <p className="empty">Nessuna nave partita</p>
            : departed.map(ship => <ShipCard key={ship.id} ship={ship} />)
          }
        </div>

      </div>
    </div>
  );
}

// Componente card per ogni nave
function ShipCard({ ship }) {
  const statusClass = {
    Pending:  "pending",
    Assigned: "assigned",
    Departed: "departed"
  }[ship.status] || "";

  return (
    <div className={`ship-card ${statusClass}`}>
      <div className="ship-card-header">
        <strong>{ship.name}</strong>
        <span className={`badge badge-${statusClass}`}>{ship.status}</span>
      </div>
      <div className="ship-card-body">
        <span>📦 {ship.size}</span>
        <span>📅 Arrivo: giorno {ship.arrivalDay}</span>
        <span>⏱ Durata: {ship.occupationDuration} giorni</span>
      </div>
      {ship.notes && <p className="ship-notes">{ship.notes}</p>}
    </div>
  );
}